import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { authApi } from "../api/auth";
import { tokenStorage } from "../api/client";

import type {
    AuthMeResponse,
    LoginPayload,
    RegisterPayload,
    User,
    Workspace,
} from "../types";

interface AuthContextValue {
    user: User | null;
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    selectWorkspace: (workspace: Workspace) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const applyAuthData = useCallback((data: AuthMeResponse) => {
        setUser(data.user);
        setWorkspaces(data.workspaces);

        const savedWorkspaceId = tokenStorage.getWorkspaceId();

        const selected =
            data.workspaces.find((item) => item.id === savedWorkspaceId) ??
            data.workspaces[0] ??
            null;

        setActiveWorkspace(selected);

        if (selected) {
            tokenStorage.setWorkspaceId(selected.id);
        } else {
            tokenStorage.setWorkspaceId("");
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const data = await authApi.me();
        applyAuthData(data);
    }, [applyAuthData]);

    const login = useCallback(
        async (payload: LoginPayload) => {
            await authApi.login(payload);
            await refreshUser();
        },
        [refreshUser],
    );

    const register = useCallback(
        async (payload: RegisterPayload) => {
            await authApi.register(payload);
            await refreshUser();
        },
        [refreshUser],
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setWorkspaces([]);
            setActiveWorkspace(null);
        }
    }, []);

    const selectWorkspace = useCallback((workspace: Workspace) => {
        setActiveWorkspace(workspace);
        tokenStorage.setWorkspaceId(workspace.id);
    }, []);

    useEffect(() => {
        let mounted = true;

        const restoreSession = async () => {
            if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
                if (mounted) setIsLoading(false);
                return;
            }

            try {
                const data = await authApi.me();

                if (mounted) {
                    applyAuthData(data);
                }
            } catch {
                tokenStorage.clear();

                if (mounted) {
                    setUser(null);
                    setWorkspaces([]);
                    setActiveWorkspace(null);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        const handleUnauthorized = () => {
            setUser(null);
            setWorkspaces([]);
            setActiveWorkspace(null);
        };

        window.addEventListener("gymos:unauthorized", handleUnauthorized);

        void restoreSession();

        return () => {
            mounted = false;
            window.removeEventListener("gymos:unauthorized", handleUnauthorized);
        };
    }, [applyAuthData]);

    const value: AuthContextValue = {
        user,
        workspaces,
        activeWorkspace,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        selectWorkspace,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}