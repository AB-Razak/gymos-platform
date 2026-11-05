import type { TokenResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not configured.");
}

const ACCESS_TOKEN_KEY = "gymos_access_token";
const REFRESH_TOKEN_KEY = "gymos_refresh_token";
const WORKSPACE_KEY = "gymos_active_workspace";

export const tokenStorage = {
  getAccessToken: () => sessionStorage.getItem(ACCESS_TOKEN_KEY),

  getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (tokens: TokenResponse) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  clear: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(WORKSPACE_KEY);
  },

  getWorkspaceId: () => sessionStorage.getItem(WORKSPACE_KEY),

  setWorkspaceId: (id: string) => {
    sessionStorage.setItem(WORKSPACE_KEY, id);
  },
};

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
  workspace?: boolean;
  retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    tokenStorage.clear();
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clear();
      return false;
    }

    const tokens: TokenResponse = await response.json();
    tokenStorage.setTokens(tokens);

    return true;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    workspace = false,
    retry = true,
    ...fetchOptions
  } = options;

  const headers = new Headers(fetchOptions.headers);

  headers.set("Accept", "application/json");

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  if (workspace) {
    const workspaceId = tokenStorage.getWorkspaceId();

    if (!workspaceId) {
      throw new Error("Select a workspace before performing this action.");
    }

    headers.set("X-Tenant-ID", workspaceId);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new Error("Unable to connect to GymOS. Check your connection.");
  }

  if (response.status === 401 && authenticated && retry) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });

    const refreshed = await refreshPromise;

    if (refreshed) {
      return apiRequest<T>(path, {
        ...options,
        retry: false,
      });
    }

    window.dispatchEvent(new Event("gymos:unauthorized"));

    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const body = await response.json();
      message =
        typeof body.detail === "string"
          ? body.detail
          : message;
    } catch {
      // Keep the fallback message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}