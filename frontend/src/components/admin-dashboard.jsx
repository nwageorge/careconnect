import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Building2, Calendar, ChevronRight, Clock, Mail, Phone, Search, Users } from "lucide-react";

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

const AGENCY_STATUS = {
  pending_approval: { label: "Awaiting approval", cls: "bg-amber-100 text-amber-700" },
  available: { label: "Available", cls: "bg-green-100 text-green-700" },
  unavailable: { label: "Unavailable", cls: "bg-red-100 text-red-700" },
};

export const AgencyStatusBadge = ({ status }) => {
  const s = AGENCY_STATUS[status] || AGENCY_STATUS.available;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.cls}`} data-testid="agency-status">{s.label}</span>;
};

const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");

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
  const navigate = useNavigate();

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

  const approve = async (agency) => {
    setBusy(agency.id);
    try {
      await axios.patch(`${API}/admin/agencies/${agency.id}`, { status: "available" }, authHeaders());
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
        <Stat icon={Building2} label="Agencies" value={overview?.agencies} hint={overview ? (overview.awaiting_approval ? `${overview.awaiting_approval} awaiting your approval` : `${overview.unverified_agencies} not verified`) : null} />
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
              <tr key={a.id} onClick={() => navigate(`/admin/agencies/${a.id}`)} className="cursor-pointer hover:bg-stone-50" data-testid="admin-agency-row">
                <td className="px-4 py-3">
                  <span className="font-medium text-stone-800">{a.name}</span>
                  {a.is_verified && <BadgeCheck className="inline w-4 h-4 ml-1 text-green-600" aria-label="Verified" />}
                  {!a.user_id && <span className="ml-2 text-xs text-stone-400">sample</span>}
                </td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{a.city}</td>
                <td className="px-4 py-3 text-stone-600">{a.owner ? <>{a.owner.name}<br /><span className="text-xs text-stone-500">{a.owner.email}</span></> : <span className="text-stone-400">None</span>}</td>
                <td className="px-4 py-3 text-stone-600">{a.booking_count}</td>
                <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{a.review_count ? `${a.rating} (${a.review_count})` : "No reviews"}</td>
                <td className="px-4 py-3"><AgencyStatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {a.status === "pending_approval" && (
                    <button disabled={busy === a.id} onClick={(e) => { e.stopPropagation(); approve(a); }}
                      className="mr-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50" data-testid="admin-approve">
                      Approve
                    </button>
                  )}
                  <ChevronRight className="inline w-4 h-4 text-stone-400" />
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
                <td className="px-4 py-3 text-stone-800 font-medium"><Link to={`/admin/agencies/${b.agency_id}`} className="hover:underline">{b.agency_name || "Deleted agency"}</Link></td>
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


const BOOKING_STATUSES = ["pending", "confirmed", "declined", "completed", "cancelled"];
const ROLE_LABEL = { client: "Family", agency: "Agency", admin: "Voallen admin" };

const BookingCard = ({ booking, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const history = booking.history || [];

  const override = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.patch(`${API}/admin/bookings/${booking.id}/status`, { status, note: note || null }, authHeaders());
      setNote("");
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5" data-testid="admin-booking">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-800">{booking.patient_name}{booking.patient_age ? `, ${booking.patient_age}` : ""} · <span className="font-normal text-stone-600">{booking.service_type}</span></p>
          <p className="text-sm text-stone-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date} · {booking.time_slot}</span>
            <span>Requested {formatDate(booking.created_at)}</span>
          </p>
          {booking.client && <p className="text-sm text-stone-500 mt-1">Family: {booking.client.name} · {booking.client.email}{booking.client.phone ? ` · ${booking.client.phone}` : ""}</p>}
          {booking.care_needs && <p className="text-sm text-stone-600 mt-1">Care needs: {booking.care_needs}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || statusColors.completed}`}>{booking.status}</span>
          <button onClick={() => setOpen(!open)} className="text-sm text-stone-700 underline" data-testid="admin-booking-toggle">{open ? "Hide history" : "History & override"}</button>
        </div>
      </div>
      {open && (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
            <p className="text-sm font-semibold text-stone-800 mb-3">Decision history</p>
            {history.length === 0 ? <p className="text-sm text-stone-500">No history recorded (booking made before tracking started).</p> : (
              <ol className="space-y-3" data-testid="booking-history">
                {history.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Clock className="w-4 h-4 mt-0.5 text-stone-400 shrink-0" />
                    <div>
                      <p className="text-stone-800"><span className="font-medium capitalize">{h.status}</span> by {h.by_name || "Unknown"} <span className="text-stone-500">({ROLE_LABEL[h.by_role] || h.by_role})</span></p>
                      <p className="text-xs text-stone-500">{formatDateTime(h.at)}</p>
                      {h.note && <p className="text-xs text-stone-600 mt-0.5">“{h.note}”</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <form onSubmit={override} className="rounded-xl border border-stone-200 p-4" data-testid="admin-override">
            <p className="text-sm font-semibold text-stone-800 mb-1">Override status</p>
            <p className="text-xs text-stone-500 mb-3">The family and the agency are emailed, and the change is added to the history.</p>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mb-2 px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm">
              {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Reason (optional)"
              className="w-full mb-2 px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm" />
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <button type="submit" disabled={saving || status === booking.status}
              className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-40">
              {saving ? "Saving..." : "Change status"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export function AdminAgencyDetail({ agencyId }) {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      const res = await axios.get(`${API}/admin/agencies/${agencyId}`, authHeaders());
      setAgency(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load this agency");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [agencyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (changes) => {
    setBusy(true);
    try {
      await axios.patch(`${API}/admin/agencies/${agencyId}`, changes, authHeaders());
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update agency");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>;
  if (!agency) return <p className="text-red-600">{error}</p>;

  const counts = agency.booking_counts || {};
  const bookings = filter === "all" ? agency.bookings : agency.bookings.filter((b) => b.status === filter);

  return (
    <div data-testid="admin-agency-detail">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-4"><ArrowLeft className="w-4 h-4" />All agencies</Link>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-stone-800">{agency.name}</h1>
              <AgencyStatusBadge status={agency.status} />
              {agency.is_verified && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><BadgeCheck className="w-3.5 h-3.5" />Verified</span>}
            </div>
            <p className="text-stone-500">{agency.location}</p>
            <p className="text-sm text-stone-600 mt-2">${agency.price_per_hour}/hr · {agency.experience_years} years · {(agency.specialties || []).join(", ") || "No specialties listed"}</p>
            <div className="mt-3 text-sm text-stone-600">
              {agency.owner ? (
                <p className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="font-medium text-stone-800">{agency.owner.name}</span>
                  <a href={`mailto:${agency.owner.email}`} className="inline-flex items-center gap-1 underline"><Mail className="w-4 h-4" />{agency.owner.email}</a>
                  {agency.owner.phone && <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" />{agency.owner.phone}</span>}
                </p>
              ) : <p className="text-stone-500">Sample agency with no owner account</p>}
            </div>
            <Link to={`/agencies/${agency.id}`} className="inline-block mt-3 text-sm underline text-stone-700">View public page</Link>
          </div>
          <div className="lg:w-80 space-y-3">
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1">Listing</p>
              {agency.status === "pending_approval" ? (
                <button disabled={busy} onClick={() => update({ status: "available" })} className="w-full px-4 py-2.5 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50" data-testid="detail-approve">Approve and list agency</button>
              ) : (
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-lg" role="radiogroup" aria-label="Availability">
                  {[["available", "Available"], ["unavailable", "Unavailable"]].map(([v, l]) => (
                    <button key={v} disabled={busy} role="radio" aria-checked={agency.status === v} onClick={() => agency.status !== v && update({ status: v })}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${agency.status === v ? "bg-white text-stone-800 shadow-sm" : "text-stone-600 hover:text-stone-800"}`}
                      data-testid={`detail-${v}`}>{l}</button>
                  ))}
                </div>
              )}
            </div>
            <button disabled={busy} onClick={() => update({ is_verified: !agency.is_verified })}
              className="w-full px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 disabled:opacity-50" data-testid="detail-verify">
              {agency.is_verified ? "Remove verified badge" : "Give verified badge"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
        <div className="p-4 border-b border-stone-100 flex flex-wrap gap-1">
          {["all", ...BOOKING_STATUSES].map((s) => {
            const n = s === "all" ? agency.bookings.length : counts[s] || 0;
            return (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === s ? "bg-stone-800 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                {s} <span className="opacity-70">({n})</span>
              </button>
            );
          })}
        </div>
        {bookings.length === 0 ? <p className="p-10 text-center text-stone-500">No bookings here.</p> : (
          <div className="divide-y divide-stone-100">{bookings.map((b) => <BookingCard key={b.id} booking={b} onChanged={load} />)}</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
