import { useState } from "react";
import {
    Activity,
    CalendarCheck,
    ChevronDown,
    CreditCard,
    Dumbbell,
    LayoutDashboard,
    LogOut,
    Menu,
    Users,
    X,
} from "lucide-react";
import {
    BrowserRouter,
    Link,
    Navigate,
    NavLink,
    Outlet,
    Route,
    Routes,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";

function DashboardLayout() {
    const { user, workspaces, activeWorkspace, selectWorkspace, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspaceOpen, setWorkspaceOpen] = useState(false);

    const navigation = [
        { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { label: "Members", path: "/members", icon: Users },
        { label: "Memberships", path: "/memberships", icon: CreditCard },
        { label: "Attendance", path: "/attendance", icon: CalendarCheck },
        { label: "Training", path: "/training", icon: Dumbbell },
        { label: "Activity", path: "/activity", icon: Activity },
    ];

    async function handleLogout() {
        await logout();
    }

    return (
        <div className="shell">
            {sidebarOpen && (
                <button
                    className="mobile-overlay"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="brand">
                    <b>G</b>
                    <span>GymOS<small>GYM MANAGEMENT</small></span>
                    <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
                        <X size={19} />
                    </button>
                </div>

                <div className="workspace-selector">
                    <small>WORKSPACE</small>
                    <button
                        className="workspace-button"
                        onClick={() => setWorkspaceOpen(!workspaceOpen)}
                    >
                        <span>
                            <strong>{activeWorkspace?.name ?? "No workspace"}</strong>
                            <small>{activeWorkspace?.role ?? "Workspace"}</small>
                        </span>
                        <ChevronDown size={17} />
                    </button>

                    {workspaceOpen && (
                        <div className="workspace-menu">
                            {workspaces.map((workspace) => (
                                <button
                                    key={workspace.id}
                                    onClick={() => {
                                        selectWorkspace(workspace);
                                        setWorkspaceOpen(false);
                                    }}
                                >
                                    {workspace.name}
                                    {workspace.id === activeWorkspace?.id && " ✓"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <nav>
                    <small className="nav-label">MENU</small>
                    {navigation.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={label}
                            to={path}
                            end={path === "/dashboard"}
                            className={({ isActive }) => isActive ? "active" : ""}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <span className="avatar">
                            {user?.full_name?.slice(0, 2).toUpperCase() ?? "GO"}
                        </span>
                        <span>
                            <strong>{user?.full_name}</strong>
                            <small>{user?.email}</small>
                        </span>
                    </div>

                    <button className="logout-button" onClick={() => void handleLogout()}>
                        <LogOut size={17} /> Sign out
                    </button>
                    <small className="copyright">GymOS SaaS · Workspace edition</small>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>

                    <div>
                        <small>WORKSPACE / GYMOS</small>
                        <h1>{activeWorkspace?.name ?? "Dashboard"}</h1>
                    </div>

                    <div className="topbar-user">
                        <span>{user?.full_name}</span>
                        <b className="avatar">
                            {user?.full_name?.slice(0, 2).toUpperCase() ?? "GO"}
                        </b>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    );
}

function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="panel">
            <span className="eyebrow">GYMOS MODULE</span>
            <h2>{title}</h2>
            <p>This module will be connected to the GymOS backend in the next development stage.</p>
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/memberships" element={<PlaceholderPage title="Memberships" />} />
                    <Route path="/attendance" element={<PlaceholderPage title="Attendance" />} />
                    <Route path="/training" element={<PlaceholderPage title="Training" />} />
                    <Route path="/activity" element={<PlaceholderPage title="Activity" />} />
                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}