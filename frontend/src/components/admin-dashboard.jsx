import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, BadgeCheck, Building2, Calendar, CheckCircle2, ChevronRight, Clock,
  EyeOff, Mail, Phone, Search, Users, XCircle,
} from "lucide-react";

/*
 * Admin area, designed for clarity first:
 * - Large type (18px body, bold headings) and high contrast
 * - Every action is a big, labeled button (min 48px tall), never an icon alone
 * - Status always shows a word and an icon, not only a color
 * - Anything that hides an agency or changes a booking asks for confirmation first
 * - The home screen starts with what needs a decision, then everything else
 */

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const focusRing = "focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-400";
const btnBase = `inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl text-base font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`;
const btn = {
  primary: `${btnBase} bg-stone-900 text-white hover:bg-stone-700`,
  approve: `${btnBase} bg-green-700 text-white hover:bg-green-800`,
  danger: `${btnBase} bg-red-700 text-white hover:bg-red-800`,
  secondary: `${btnBase} bg-white text-stone-900 border-2 border-stone-300 hover:border-stone-500`,
};

const AGENCY_STATUS = {
  pending_approval: { label: "Waiting for approval", icon: Clock, cls: "bg-amber-100 text-amber-800 border-amber-300" },
  available: { label: "Available to families", icon: CheckCircle2, cls: "bg-green-100 text-green-800 border-green-300" },
  unavailable: { label: "Hidden from families", icon: EyeOff, cls: "bg-red-100 text-red-800 border-red-300" },
};

const BOOKING_STATUS = {
  pending: { label: "Waiting for caregiver", icon: Clock, cls: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "bg-green-100 text-green-800 border-green-300" },
  completed: { label: "Visit completed", icon: BadgeCheck, cls: "bg-stone-100 text-stone-800 border-stone-300" },
  declined: { label: "Declined", icon: XCircle, cls: "bg-red-100 text-red-800 border-red-300" },
  cancelled: { label: "Cancelled by family", icon: XCircle, cls: "bg-red-100 text-red-800 border-red-300" },
};
const BOOKING_STATUSES = Object.keys(BOOKING_STATUS);
const ROLE_LABEL = { client: "Family", agency: "Caregiver", admin: "Voallen admin" };

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : "");
const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");

const Pill = ({ map, status, testid }) => {
  const s = map[status] || Object.values(map)[0];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-base font-bold whitespace-nowrap ${s.cls}`} data-testid={testid}>
      <Icon className="w-5 h-5" aria-hidden="true" />{s.label}
    </span>
  );
};
export const AgencyStatusBadge = ({ status }) => <Pill map={AGENCY_STATUS} status={status} testid="agency-status" />;
const BookingStatusBadge = ({ status }) => <Pill map={BOOKING_STATUS} status={status} testid="booking-status" />;

const Spinner = () => (
  <div className="p-16 text-center" role="status" aria-live="polite">
    <div className="animate-spin w-10 h-10 border-4 border-stone-800 border-t-transparent rounded-full mx-auto" />
    <p className="mt-4 text-lg text-stone-700">Loading…</p>
  </div>
);

const ErrorBox = ({ children }) => children ? (
  <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border-2 border-red-300 bg-red-100 text-red-800 text-lg font-semibold" role="alert">
    <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />{children}
  </div>
) : null;

// A plain confirmation step before anything that's hard to notice or undo
const ConfirmDialog = ({ open, title, body, confirmLabel, tone = "primary", onConfirm, onCancel, busy }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" aria-labelledby="confirm-title" data-testid="confirm-dialog">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h2 id="confirm-title" className="text-2xl font-extrabold text-stone-900 mb-3">{title}</h2>
        <div className="text-lg text-stone-700 leading-relaxed mb-8">{body}</div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button className={btn.secondary} onClick={onCancel} disabled={busy} data-testid="confirm-cancel" autoFocus>Go back</button>
          <button className={btn[tone]} onClick={onConfirm} disabled={busy} data-testid="confirm-ok">{busy ? "Saving…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, subtitle, children, action }) => (
  <section className="mb-10">
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="text-2xl font-extrabold text-stone-900">{title}</h2>
        {subtitle && <p className="text-lg text-stone-600 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Card = ({ children, className = "", ...rest }) => (
  <div className={`bg-white rounded-2xl border-2 border-stone-200 ${className}`} {...rest}>{children}</div>
);

const Stat = ({ icon: Icon, label, value, onClick }) => (
  <button onClick={onClick} className={`text-left bg-white rounded-2xl border-2 border-stone-200 p-5 hover:border-stone-400 transition ${focusRing}`}>
    <Icon className="w-7 h-7 text-stone-800 mb-3" aria-hidden="true" />
    <p className="text-4xl font-extrabold text-stone-900 leading-none">{value ?? "–"}</p>
    <p className="text-lg font-semibold text-stone-700 mt-2">{label}</p>
  </button>
);

const TABS = [
  { id: "agencies", label: "Caregivers", icon: Building2 },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "users", label: "People", icon: Users },
  { id: "messages", label: "Messages", icon: Mail },
];

export function AdminDashboard() {
  const [tab, setTab] = useState("agencies");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [a, b, u, m] = await Promise.all([
        axios.get(`${API}/admin/agencies`, authHeaders()),
        axios.get(`${API}/admin/bookings`, authHeaders()),
        axios.get(`${API}/admin/users`, authHeaders()),
        axios.get(`${API}/contact/messages`, authHeaders()),
      ]);
      setData({ agencies: a.data, bookings: b.data, users: u.data, messages: m.data });
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load admin data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const approve = async (agency) => {
    setBusy(true);
    try {
      await axios.patch(`${API}/admin/agencies/${agency.id}`, { status: "available" }, authHeaders());
      setConfirm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not approve this caregiver.");
    } finally {
      setBusy(false);
    }
  };

  const agencies = data.agencies || [];
  const bookings = data.bookings || [];
  const waiting = agencies.filter((a) => a.status === "pending_approval");
  const pendingBookings = bookings.filter((b) => b.status === "pending");

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const list = data[tab] || [];
    return q ? list.filter((row) => JSON.stringify(row).toLowerCase().includes(q)) : list;
  }, [data, tab, q]);

  const openTab = (id) => { setTab(id); setQuery(""); document.getElementById("admin-lists")?.scrollIntoView({ behavior: "smooth" }); };

  if (loading) return <Spinner />;

  return (
    <div className="admin-ui text-lg text-stone-900" data-testid="admin-dashboard">
      <h1 className="text-4xl font-extrabold mb-2">Admin</h1>
      <p className="text-xl text-stone-700 mb-8">Approve caregivers and keep an eye on every booking.</p>
      <ErrorBox>{error}</ErrorBox>

      {/* 1. Decisions waiting for the admin */}
      <Section title="Needs your attention">
        {waiting.length === 0 && pendingBookings.length === 0 ? (
          <Card className="p-6 flex items-center gap-3 text-xl font-semibold text-green-800 border-green-300 bg-green-50">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />You're all caught up. Nothing is waiting.
          </Card>
        ) : (
          <div className="space-y-4">
            {waiting.map((a) => (
              <Card key={a.id} className="p-5 sm:p-6 border-amber-300 bg-amber-50" data-testid="attention-approval">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold uppercase tracking-wide text-amber-800 mb-1">New caregiver wants to join</p>
                    <p className="text-2xl font-extrabold">{a.name}</p>
                    <p className="text-lg text-stone-700">{a.city}{a.owner ? ` · ${a.owner.name} (${a.owner.email})` : ""}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className={btn.secondary} onClick={() => navigate(`/admin/agencies/${a.id}`)}>Review details</button>
                    <button className={btn.approve} data-testid="admin-approve"
                      onClick={() => setConfirm({ agency: a })}>
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />Approve
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            {pendingBookings.length > 0 && (
              <Card className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xl font-bold">
                    {pendingBookings.length} {pendingBookings.length === 1 ? "booking is" : "bookings are"} waiting for an agency to answer
                  </p>
                  <button className={btn.primary} onClick={() => openTab("bookings")}>See bookings</button>
                </div>
              </Card>
            )}
          </div>
        )}
      </Section>

      {/* 2. Totals, each one opens its list */}
      <Section title="At a glance">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Building2} label="Caregivers" value={agencies.length} onClick={() => openTab("agencies")} />
          <Stat icon={Calendar} label="Bookings" value={bookings.length} onClick={() => openTab("bookings")} />
          <Stat icon={Users} label="People" value={(data.users || []).length} onClick={() => openTab("users")} />
          <Stat icon={Mail} label="Messages" value={(data.messages || []).length} onClick={() => openTab("messages")} />
        </div>
      </Section>

      {/* 3. Full lists */}
      <section id="admin-lists" className="scroll-mt-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-stone-100 rounded-2xl mb-4" role="tablist" aria-label="Lists">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} role="tab" aria-selected={active} onClick={() => { setTab(t.id); setQuery(""); }}
                className={`flex items-center justify-center gap-2 min-h-[52px] rounded-xl text-lg font-bold transition ${focusRing} ${active ? "bg-stone-900 text-white" : "text-stone-800 hover:bg-white"}`}
                data-testid={`admin-tab-${t.id}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />{t.label}
                <span className={active ? "text-stone-300" : "text-stone-500"}>{(data[t.id] || []).length}</span>
              </button>
            );
          })}
        </div>

        <label className="relative block mb-4">
          <span className="sr-only">Search</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-500" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${TABS.find((t) => t.id === tab).label.toLowerCase()}…`}
            className={`w-full min-h-[56px] pl-14 pr-4 bg-white rounded-xl border-2 border-stone-300 text-lg placeholder:text-stone-500 focus:border-stone-700 ${focusRing}`} />
        </label>

        {rows.length === 0 && <Card className="p-10 text-center text-xl text-stone-600">Nothing to show here.</Card>}

        <div className="space-y-3">
          {tab === "agencies" && rows.map((a) => (
            <Card key={a.id} className="p-5 hover:border-stone-400 transition" data-testid="admin-agency-row">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xl font-extrabold flex flex-wrap items-center gap-2">
                    {a.name}
                    {a.is_verified && <span className="inline-flex items-center gap-1 text-base font-bold text-green-800"><BadgeCheck className="w-5 h-5" aria-hidden="true" />Verified</span>}
                    {!a.user_id && <span className="text-base font-semibold text-stone-500">(sample)</span>}
                  </p>
                  <p className="text-lg text-stone-700">{a.city} · {a.booking_count} {a.booking_count === 1 ? "booking" : "bookings"}{a.owner ? ` · ${a.owner.name}` : ""}</p>
                  <div className="mt-2"><AgencyStatusBadge status={a.status} /></div>
                </div>
                <button className={btn.primary} onClick={() => navigate(`/admin/agencies/${a.id}`)} data-testid="admin-open-agency">
                  Open<ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </Card>
          ))}

          {tab === "bookings" && rows.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-extrabold">{b.patient_name} <span className="font-semibold text-stone-700">· {b.service_type}</span></p>
                  <p className="text-lg text-stone-700">Caregiver: <strong>{b.agency_name || "Deleted profile"}</strong></p>
                  <p className="text-lg text-stone-700">Visit: {b.date} at {b.time_slot}</p>
                  {b.client && <p className="text-lg text-stone-700">Family: {b.client.name} ({b.client.email})</p>}
                  <div className="mt-2"><BookingStatusBadge status={b.status} /></div>
                </div>
                <button className={btn.secondary} onClick={() => navigate(`/admin/agencies/${b.agency_id}`)}>Open agency<ChevronRight className="w-5 h-5" aria-hidden="true" /></button>
              </div>
            </Card>
          ))}

          {tab === "users" && rows.map((u) => (
            <Card key={u.id} className="p-5">
              <p className="text-xl font-extrabold">{u.name}</p>
              <p className="text-lg text-stone-700">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
              <p className="text-lg text-stone-700">
                {u.role === "client" ? "Family" : u.role === "agency" ? "Caregiver" : "Admin"}{u.is_admin && u.role !== "admin" ? " and admin" : ""} · joined {formatDate(u.created_at)}
              </p>
            </Card>
          ))}

          {tab === "messages" && rows.map((m) => (
            <Card key={m.id} className="p-5">
              <p className="text-xl font-extrabold">{m.subject}</p>
              <p className="text-lg text-stone-700 mb-2">From {m.name} · <a href={`mailto:${m.email}`} className="underline font-semibold">{m.email}</a> · {formatDate(m.created_at)}</p>
              <p className="text-lg whitespace-pre-line">{m.message}</p>
            </Card>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={!!confirm}
        title={`Approve ${confirm?.agency.name}?`}
        body="Families will be able to find and book this caregiver right away. The caregiver will get an email. You can hide it again at any time."
        confirmLabel="Yes, approve"
        tone="approve"
        busy={busy}
        onConfirm={() => approve(confirm.agency)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

const BookingCard = ({ booking, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const history = booking.history || [];

  useEffect(() => { setStatus(booking.status); }, [booking.status]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.patch(`${API}/admin/bookings/${booking.id}/status`, { status, note: note || null }, authHeaders());
      setNote("");
      setConfirming(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not change this booking.");
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6" data-testid="admin-booking">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <p className="text-xl font-extrabold">{booking.patient_name}{booking.patient_age ? `, ${booking.patient_age}` : ""} <span className="font-semibold text-stone-700">· {booking.service_type}</span></p>
          <p className="text-lg text-stone-700">Visit: <strong>{booking.date} at {booking.time_slot}</strong></p>
          {booking.client && <p className="text-lg text-stone-700">Family: {booking.client.name} · {booking.client.email}{booking.client.phone ? ` · ${booking.client.phone}` : ""}</p>}
          {booking.care_needs && <p className="text-lg text-stone-700">Care needs: {booking.care_needs}</p>}
          <div className="mt-3"><BookingStatusBadge status={booking.status} /></div>
        </div>
        <button className={btn.secondary} onClick={() => setOpen(!open)} aria-expanded={open} data-testid="admin-booking-toggle">
          {open ? "Close" : "History and changes"}
        </button>
      </div>

      {open && (
        <div className="mt-6 grid lg:grid-cols-2 gap-5">
          <div className="rounded-xl bg-stone-50 border-2 border-stone-200 p-5">
            <h3 className="text-xl font-extrabold mb-4">What happened</h3>
            {history.length === 0 ? <p className="text-lg text-stone-700">No history was recorded for this booking. It was made before tracking started.</p> : (
              <ol className="space-y-4" data-testid="booking-history">
                {history.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 w-7 h-7 shrink-0 rounded-full bg-stone-900 text-white text-sm font-bold flex items-center justify-center" aria-hidden="true">{i + 1}</span>
                    <div>
                      <p className="text-lg"><strong>{BOOKING_STATUS[h.status]?.label || h.status}</strong></p>
                      <p className="text-lg text-stone-700">by {h.by_name || "Unknown"} ({ROLE_LABEL[h.by_role] || h.by_role})</p>
                      <p className="text-base text-stone-600">{formatDateTime(h.at)}</p>
                      {h.note && <p className="text-lg text-stone-800 mt-1">Reason: “{h.note}”</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="rounded-xl border-2 border-stone-300 p-5" data-testid="admin-override">
            <h3 className="text-xl font-extrabold mb-1">Change this booking</h3>
            <p className="text-lg text-stone-700 mb-4">Use this only to correct a mistake. The family and the caregiver will both get an email.</p>
            <label className="block text-lg font-bold mb-2" htmlFor={`status-${booking.id}`}>New status</label>
            <select id={`status-${booking.id}`} value={status} onChange={(e) => setStatus(e.target.value)}
              className={`w-full min-h-[52px] mb-4 px-4 bg-white rounded-xl border-2 border-stone-300 text-lg ${focusRing}`}>
              {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{BOOKING_STATUS[s].label}</option>)}
            </select>
            <label className="block text-lg font-bold mb-2" htmlFor={`note-${booking.id}`}>Reason <span className="font-normal text-stone-600">(recommended)</span></label>
            <input id={`note-${booking.id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="For example: agency confirmed by phone"
              className={`w-full min-h-[52px] mb-4 px-4 bg-white rounded-xl border-2 border-stone-300 text-lg placeholder:text-stone-500 ${focusRing}`} />
            <ErrorBox>{error}</ErrorBox>
            <button className={`${btn.primary} w-full`} disabled={status === booking.status} onClick={() => setConfirming(true)}>
              {status === booking.status ? "Pick a different status" : "Save change"}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Change this booking?"
        body={<>
          <p>From <strong>{BOOKING_STATUS[booking.status]?.label}</strong> to <strong>{BOOKING_STATUS[status]?.label}</strong>.</p>
          <p className="mt-2">The family and the caregiver will be emailed. This will be saved in the history with your name.</p>
        </>}
        confirmLabel="Yes, change it"
        busy={saving}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  );
};

export function AdminAgencyDetail({ agencyId }) {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/admin/agencies/${agencyId}`, authHeaders());
      setAgency(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load this caregiver.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [agencyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (changes) => {
    setBusy(true);
    try {
      await axios.patch(`${API}/admin/agencies/${agencyId}`, changes, authHeaders());
      setConfirm(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update this caregiver.");
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;
  if (!agency) return <ErrorBox>{error}</ErrorBox>;

  const counts = agency.booking_counts || {};
  const bookings = filter === "all" ? agency.bookings : agency.bookings.filter((b) => b.status === filter);

  const confirmations = {
    approve: { title: `Approve ${agency.name}?`, body: "Families will be able to find and book this caregiver right away. The caregiver will get an email.", label: "Yes, approve", tone: "approve", changes: { status: "available" } },
    show: { title: `Show ${agency.name} to families again?`, body: "The caregiver will appear in search and can receive new bookings. The caregiver will get an email.", label: "Yes, show it", tone: "approve", changes: { status: "available" } },
    hide: { title: `Hide ${agency.name} from families?`, body: "Families won't see this caregiver or be able to book it. Existing bookings stay as they are. The caregiver will get an email.", label: "Yes, hide it", tone: "danger", changes: { status: "unavailable" } },
    verify: { title: `Give ${agency.name} the verified badge?`, body: "Families will see a green Verified badge on this caregiver.", label: "Yes, verify", tone: "approve", changes: { is_verified: true } },
    unverify: { title: `Remove the verified badge from ${agency.name}?`, body: "The green Verified badge will no longer show to families.", label: "Yes, remove it", tone: "danger", changes: { is_verified: false } },
  };
  const c = confirm && confirmations[confirm];

  return (
    <div className="admin-ui text-lg text-stone-900" data-testid="admin-agency-detail">
      <Link to="/dashboard" className={`inline-flex items-center gap-2 min-h-[48px] text-lg font-bold underline ${focusRing}`}>
        <ArrowLeft className="w-6 h-6" aria-hidden="true" />Back to admin
      </Link>
      <ErrorBox>{error}</ErrorBox>

      <div className="mt-4 mb-10">
        <h1 className="text-4xl font-extrabold mb-3">{agency.name}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <AgencyStatusBadge status={agency.status} />
          {agency.is_verified && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-300 bg-green-100 text-green-800 text-base font-bold"><BadgeCheck className="w-5 h-5" aria-hidden="true" />Verified</span>}
        </div>
        <p className="text-xl text-stone-700">{agency.location}</p>
        <p className="text-xl text-stone-700">${agency.price_per_hour} per hour · {agency.experience_years} years · {(agency.specialties || []).join(", ") || "No specialties listed"}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold mb-4">Contact</h2>
          {agency.owner ? (
            <div className="space-y-3 text-xl">
              <p className="font-bold">{agency.owner.name}</p>
              <a href={`mailto:${agency.owner.email}`} className={`flex items-center gap-3 underline font-semibold ${focusRing}`}><Mail className="w-6 h-6" aria-hidden="true" />{agency.owner.email}</a>
              {agency.owner.phone && <a href={`tel:${agency.owner.phone}`} className={`flex items-center gap-3 underline font-semibold ${focusRing}`}><Phone className="w-6 h-6" aria-hidden="true" />{agency.owner.phone}</a>}
            </div>
          ) : <p className="text-xl text-stone-700">This is a sample caregiver profile with no owner account.</p>}
          <Link to={`/agencies/${agency.id}`} className={`${btn.secondary} mt-6`}>See what families see</Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-extrabold mb-1">Can families book this caregiver?</h2>
          <p className="text-lg text-stone-700 mb-5">
            {agency.status === "pending_approval" ? "Not yet. This caregiver is waiting for your approval."
              : agency.status === "available" ? "Yes. Families can find and book this caregiver."
              : "No. This caregiver is hidden from families."}
          </p>
          <div className="flex flex-col gap-3">
            {agency.status === "pending_approval" && (
              <button className={btn.approve} disabled={busy} onClick={() => setConfirm("approve")} data-testid="detail-approve"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />Approve this caregiver</button>
            )}
            {agency.status === "unavailable" && (
              <button className={btn.approve} disabled={busy} onClick={() => setConfirm("show")} data-testid="detail-available"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />Show to families again</button>
            )}
            {agency.status === "available" && (
              <button className={btn.danger} disabled={busy} onClick={() => setConfirm("hide")} data-testid="detail-unavailable"><EyeOff className="w-5 h-5" aria-hidden="true" />Hide from families</button>
            )}
            <button className={btn.secondary} disabled={busy} onClick={() => setConfirm(agency.is_verified ? "unverify" : "verify")} data-testid="detail-verify">
              <BadgeCheck className="w-5 h-5" aria-hidden="true" />{agency.is_verified ? "Remove verified badge" : "Give verified badge"}
            </button>
          </div>
        </Card>
      </div>

      <Section title="Bookings" subtitle="Every request this caregiver received, newest first.">
        <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Filter bookings">
          {["all", ...BOOKING_STATUSES].map((s) => {
            const n = s === "all" ? agency.bookings.length : counts[s] || 0;
            const active = filter === s;
            return (
              <button key={s} role="tab" aria-selected={active} onClick={() => setFilter(s)}
                className={`min-h-[48px] px-4 rounded-xl text-lg font-bold border-2 transition ${focusRing} ${active ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-800 border-stone-300 hover:border-stone-500"}`}>
                {s === "all" ? "All" : BOOKING_STATUS[s].label} ({n})
              </button>
            );
          })}
        </div>
        {bookings.length === 0 ? <Card className="p-10 text-center text-xl text-stone-600">No bookings here.</Card> : (
          <div className="space-y-4">{bookings.map((b) => <BookingCard key={b.id} booking={b} onChanged={load} />)}</div>
        )}
      </Section>

      <ConfirmDialog
        open={!!c}
        title={c?.title}
        body={c?.body}
        confirmLabel={c?.label}
        tone={c?.tone}
        busy={busy}
        onConfirm={() => update(c.changes)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default AdminDashboard;
