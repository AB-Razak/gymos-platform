import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login({ email, password });
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to sign in.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <div className="brand-mark">G</div>
                <div>
                    <strong>GymOS</strong>
                    <small>GYM MANAGEMENT PLATFORM</small>
                </div>
            </div>

            <div className="auth-card">
                <div className="auth-icon"><Activity size={23} /></div>
                <span className="eyebrow">WELCOME BACK</span>
                <h1>Sign in to GymOS</h1>
                <p className="auth-description">
                    Manage your gym, members and operations from one place.
                </p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <div className="password-field">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button className="primary-button" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                        {!loading && <ArrowRight size={17} />}
                    </button>
                </form>

                <div className="auth-bottom">
                    Don't have a GymOS account? <Link to="/register">Create one</Link>
                </div>
            </div>

            <p className="auth-footer">© {new Date().getFullYear()} GymOS. All rights reserved.</p>
        </div>
    );
}