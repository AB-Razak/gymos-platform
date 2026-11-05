import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, Search, Users, X, RefreshCw } from "lucide-react";
import { membersApi } from "../api/members";
import { useAuth } from "../context/AuthContext";
import type { Member } from "../types";

export default function Members() {
    const { activeWorkspace } = useAuth();

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        member_number: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });

    const loadMembers = useCallback(async () => {
        if (!activeWorkspace) return;

        setLoading(true);
        setError("");

        try {
            const result = await membersApi.list();
            setMembers(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load members.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace]);

    useEffect(() => {
        void loadMembers();
    }, [loadMembers]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const member = await membersApi.create({
                ...form,
                email: form.email.trim() || null,
                phone: form.phone.trim() || null,
            });

            setMembers((current) => [member, ...current]);
            setForm({
                member_number: "",
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
            });
            setShowForm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create member.");
        } finally {
            setSaving(false);
        }
    }

    const filteredMembers = members.filter((member) =>
        `${member.member_number} ${member.first_name} ${member.last_name} ${member.email ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    if (!activeWorkspace) {
        return <div className="panel">No workspace is currently selected.</div>;
    }

    return (
        <div className="content-page">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">GYM MANAGEMENT</span>
                    <h2>Members</h2>
                    <p>Manage your gym's member records.</p>
                </div>

                <button className="primary-button compact" onClick={() => setShowForm(true)}>
                    <Plus size={17} /> Add member
                </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <div className="modal-heading">
                            <div>
                                <span className="eyebrow">NEW MEMBER</span>
                                <h3>Register a member</h3>
                            </div>
                            <button className="icon-button" onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>Member number</label>
                            <input
                                required
                                maxLength={50}
                                value={form.member_number}
                                onChange={(e) => setForm({ ...form, member_number: e.target.value })}
                                placeholder="e.g. MEM-0001"
                            />

                            <div className="form-grid">
                                <div>
                                    <label>First name</label>
                                    <input
                                        required
                                        maxLength={100}
                                        value={form.first_name}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Last name</label>
                                    <input
                                        required
                                        maxLength={100}
                                        value={form.last_name}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label>Email address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />

                            <label>Phone number</label>
                            <input
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+233..."
                            />

                            <button className="primary-button" disabled={saving}>
                                {saving ? "Saving member..." : "Save member"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Search members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button className="secondary-button" onClick={() => void loadMembers()}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <section className="table-card">
                <div className="table-summary">
                    <div>
                        <strong>{members.length}</strong>
                        <span> registered members</span>
                    </div>
                    <Users size={20} />
                </div>

                {loading ? (
                    <p className="empty-state">Loading members...</p>
                ) : filteredMembers.length === 0 ? (
                    <p className="empty-state">
                        {search ? "No matching members found." : "No members registered yet."}
                    </p>
                ) : (
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Member number</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <strong>{member.first_name} {member.last_name}</strong>
                                        </td>
                                        <td>{member.member_number}</td>
                                        <td>{member.email || "—"}</td>
                                        <td>{member.phone || "—"}</td>
                                        <td>
                                            <span className="status-pill">{member.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}