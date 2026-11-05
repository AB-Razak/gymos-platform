import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GuestRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="page-loader">
                <div className="spinner" />
                <p>Loading GymOS...</p>
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}