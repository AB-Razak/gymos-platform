import { apiRequest, tokenStorage } from "./client";
import type {
  AuthMeResponse,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
} from "../types";

export const authApi = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const tokens = await apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      authenticated: false,
    });

    tokenStorage.setTokens(tokens);

    return tokens;
  },

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const tokens = await apiRequest<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      authenticated: false,
    });

    tokenStorage.setTokens(tokens);

    return tokens;
  },

  async me(): Promise<AuthMeResponse> {
    return apiRequest<AuthMeResponse>("/auth/me");
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
          authenticated: false,
        });
      }
    } finally {
      tokenStorage.clear();
    }
  },
};