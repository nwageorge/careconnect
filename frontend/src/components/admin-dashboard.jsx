import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Calendar, Mail, Search, Users } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const TABS = [
  { id: "agencies", label: "Agencies" },
  { id: "bookings", label: "Bookings" },
  { id: "users", label: "Users" },
  { id: "messages", label: "Messages" },
];

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-stone-100 text-stone-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");

const Stat = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-stone-800" /></div>
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="text-2xl font-bold text-stone-800">{value ?? "–"}</p>
        {hint && <p className="text-xs text-stone-500">{hint}</p>}
      </div>
    </div>
  </div>
);

const Table = ({ head, children, empty }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-stone-500 border-b border-stone-100">
          {head.map((h) => <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100">{children}</tbody>
    </table>
    {empty && <p className="p-10 text-center text-stone-500">{empty}</p>}
  </div>
);

export function AdminDashboard() {
  const [tab, setTab] = useState("agencies");
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const [o, a, b, u, m] = await Promise.all([
        axios.get(`${API}/admin/overview`, authHeaders()),
        axios.get(`${API}/admin/agencies`, authHeaders()),
        axios.get(`${API}/admin/bookings`, authHeaders()),
        axios.get(`${API}/admin/users`, authHeaders()),
        axios.get(`${API}/contact/messages`, authHeaders()),
      ]);
      setOverview(o.data);
      setData({ agencies: a.data, bookings: b.data, users: u.data, messages: m.data });
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load admin data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const toggleVerified = async (agency) => {
    setBusy(agency.id);
    try {
      await axios.patch(`${API}/admin/agencies/${agency.id}`, { is_verified: !agency.is_verified }, authHeaders());
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update agency");
    } finally {
      setBusy(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const rows = data[tab] || [];
    if (!q) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, tab, q]);

  if (loading) return <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-800 mb-1">Voallen admin</h1>
        <p className="text-stone-500">Everything happening across the marketplace</p>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={Building2} label="Agencies" value={overview?.agencies} hint={overview ? `${overview.unverified_agencies} not verified` : null} />
        <Stat icon={Calendar} label="Bookings" value={overview?.bookings} hint={overview ? `${overview.pending_bookings} pending` : null} />
        <Stat icon={Users} label="Families" value={overview?.clients} hint={overview ? `${overview.agency_accounts} agency accounts` : null} />
        <Stat icon={Mail} label="Messages" value={overview?.messages} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
        <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t.id ? "bg-stone-800 text-white" : "text-stone-600 hover:bg-stone-100"}`}
                data-testid={`admin-tab-${t.id}`}>
                {t.label} <span className="opacity-70">({(data[t.id] || []).length})</span>
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search"
              className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-stone-200 focus:border-stone-400 outline-none text-sm" />
          </div>
        </div>

        {tab === "agencies" && (
          <Table head={["Agency", "City", "Owner", "Bookings", "Rating", "Status", ""]} empty={filtered.length ? null : "No agencies match."}>
            {filtered.map((a) => (
              <tr key={a.id} data-testid="admin-agency-row">
                <td className="px-4 py-3"><Link to={`/agencies/${a.id}`} className="font-medium text-stone-800 hover:underline">{a.name}</Link>{!a.user_id && <span className="ml-2 text-xs text-stone-400">sample</span>}</td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{a.city}</td>
                <td className="px-4 py-3 text-stone-600">{a.owner ? <>{a.owner.name}<br /><span className="text-xs text-stone-500">{a.owner.email}</span></> : <span className="text-stone-400">None</span>}</td>
                <td className="px-4 py-3 text-stone-600">{a.booking_count}</td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{a.review_count ? `${a.rating} (${a.review_count})` : "No reviews"}</td>
                <td className="px-4 py-3">
                  {a.is_verified
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><BadgeCheck className="w-3.5 h-3.5" />Verified</span>
                    : <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Not verified</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button disabled={busy === a.id} onClick={() => toggleVerified(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap disabled:opacity-50 ${a.is_verified ? "bg-stone-100 text-stone-700 hover:bg-stone-200" : "bg-stone-800 text-white hover:bg-stone-700"}`}
                    data-testid="admin-verify">
                    {a.is_verified ? "Remove badge" : "Verify"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {tab === "bookings" && (
          <Table head={["Requested", "Agency", "Family", "Patient", "Visit", "Status"]} empty={filtered.length ? null : "No bookings yet."}>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{formatDate(b.created_at)}</td>
                <td className="px-4 py-3 text-stone-800 font-medium">{b.agency_name || "Deleted agency"}</td>
                <td className="px-4 py-3 text-stone-600">{b.client ? <>{b.client.name}<br /><span className="text-xs text-stone-500">{b.client.email}</span></> : "Unknown"}</td>
                <td className="px-4 py-3 text-stone-600">{b.patient_name}<br /><span className="text-xs text-stone-500">{b.service_type}</span></td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{b.date} · {b.time_slot}</td>
                <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[b.status] || statusColors.completed}`}>{b.status}</span></td>
              </tr>
            ))}
          </Table>
        )}

        {tab === "users" && (
          <Table head={["Name", "Email", "Type", "Phone", "Joined"]} empty={filtered.length ? null : "No users yet."}>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-stone-800 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-stone-600">{u.email}</td>
                <td className="px-4 py-3 text-stone-600">{u.role === "client" ? "Family" : u.role === "agency" ? "Agency" : "Admin"}{u.is_admin && u.role !== "admin" ? " · Admin" : ""}</td>
                <td className="px-4 py-3 text-stone-600">{u.phone || ""}</td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </Table>
        )}

        {tab === "messages" && (
          <div className="divide-y divide-stone-100">
            {filtered.length === 0 && <p className="p-10 text-center text-stone-500">No messages yet.</p>}
            {filtered.map((m) => (
              <div key={m.id} className="p-5">
                <div className="flex justify-between gap-4">
                  <p className="font-semibold text-stone-800">{m.subject}</p>
                  <p className="text-xs text-stone-500 whitespace-nowrap">{formatDate(m.created_at)}</p>
                </div>
                <p className="text-sm text-stone-500 mb-2">{m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a></p>
                <p className="text-sm text-stone-700 whitespace-pre-line">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
