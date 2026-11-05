import { Activity, CalendarCheck, CreditCard, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user, activeWorkspace } = useAuth();

    const stats = [
        { label: "Total members", value: "—", icon: Users },
        { label: "Active memberships", value: "—", icon: CreditCard },
        { label: "Today's attendance", value: "—", icon: CalendarCheck },
        { label: "Monthly revenue", value: "—", icon: Activity },
    ];

    return (
        <div className="content-page">
            <section className="hero">
                <span className="eyebrow">GYMOS CONTROL CENTRE</span>
                <h2>Build a stronger business.</h2>
                <p>
                    Welcome back, {user?.full_name}. Manage your gym operations,
                    memberships and team from one place.
                </p>
            </section>

            <div className="dashboard-workspace">
                <div>
                    <span className="eyebrow">CURRENT WORKSPACE</span>
                    <h2>{activeWorkspace?.name ?? "Your Gym"}</h2>
                    <p>
                        {activeWorkspace?.role ?? "Member"} ·{" "}
                        {activeWorkspace?.currency ?? "GHS"} ·{" "}
                        {activeWorkspace?.timezone ?? "Africa/Accra"}
                    </p>
                </div>
                <span className="status-pill">{activeWorkspace?.status ?? "Unknown"}</span>
            </div>

            <section className="stats">
                {stats.map(({ label, value, icon: Icon }) => (
                    <article key={label}>
                        <div className="stat-icon"><Icon size={19} /></div>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>Live data integration pending</p>
                    </article>
                ))}
            </section>

            <section className="panel">
                <span className="eyebrow">GETTING STARTED</span>
                <h3>Your GymOS workspace is connected</h3>
                <p>
                    Your account and workspace are authenticated against the GymOS API.
                    You can now start managing your gym records.
                </p>
                <ol>
                    <li>Configure your gym profile and branches.</li>
                    <li>Register your first members.</li>
                    <li>Create membership plans.</li>
                    <li>Set up attendance and payments.</li>
                </ol>
            </section>
        </div>
    );
}