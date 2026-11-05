import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Dumbbell, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        gym_name: "",
        gym_slug: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(field: keyof typeof form, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function createSlug(value: string) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(form);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed.");
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

            <div className="auth-card register-card">
                <div className="auth-icon"><Dumbbell size={23} /></div>
                <span className="eyebrow">GET STARTED</span>
                <h1>Create your gym workspace</h1>
                <p className="auth-description">
                    Set up your gym and start managing your operations with GymOS.
                </p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="full_name">Your full name</label>
                    <input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => updateField("full_name", e.target.value)}
                        placeholder="Full name"
                        minLength={2}
                        maxLength={180}
                        autoComplete="name"
                        required
                    />

                    <label htmlFor="register_email">Email address</label>
                    <input
                        id="register_email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="gym_name">Gym or business name</label>
                    <input
                        id="gym_name"
                        value={form.gym_name}
                        onChange={(e) => {
                            updateField("gym_name", e.target.value);
                            updateField("gym_slug", createSlug(e.target.value));
                        }}
                        placeholder="e.g. ProtoGym"
                        minLength={2}
                        maxLength={180}
                        required
                    />

                    <label htmlFor="gym_slug">Workspace address</label>
                    <div className="slug-field">
                        <input
                            id="gym_slug"
                            value={form.gym_slug}
                            onChange={(e) => updateField("gym_slug", createSlug(e.target.value))}
                            placeholder="your-gym"
                            minLength={3}
                            maxLength={80}
                            pattern="[a-z0-9]+(-[a-z0-9]+)*"
                            required
                        />
                        <span>.gymos.com</span>
                    </div>
                    <small className="field-hint">
                        You can use this name to identify your workspace.
                    </small>

                    <label htmlFor="register_password">Password</label>
                    <div className="password-field">
                        <input
                            id="register_password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            placeholder="At least 10 characters"
                            minLength={10}
                            maxLength={128}
                            autoComplete="new-password"
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
                        {loading ? "Creating workspace..." : "Create workspace"}
                        {!loading && <ArrowRight size={17} />}
                    </button>
                </form>

                <div className="auth-bottom">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>

            <p className="auth-footer">© {new Date().getFullYear()} GymOS. All rights reserved.</p>
        </div>
    );
}