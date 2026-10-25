
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api from "./api";
import "./index.css";



import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function AuthPage({ register = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = register ? "/auth/register" : "/auth/login";
      const payload = register
        ? { name, email, password }
        : { email, password };

      const response = await api.post(endpoint, payload);

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  
return (
  <main className="auth-page auth-page-modern">
    <section className="auth-showcase">
      <div className="auth-showcase-brand">
        <span className="brand-mark">L</span>
        <span>LeadFlow</span>
      </div>

      <div className="auth-showcase-content">
        <span className="auth-pill">YOUR SALES WORKSPACE</span>
        <h1>Turn every lead into an opportunity.</h1>
        <p>
          Manage your pipeline, track follow-ups, and build stronger
          customer relationships — all in one place.
        </p>

        <div className="auth-feature">
          <span className="auth-feature-icon">↗</span>
          <div>
            <strong>One clear pipeline</strong>
            <p>Keep every opportunity organized.</p>
          </div>
        </div>

        <div className="auth-feature">
          <span className="auth-feature-icon">✓</span>
          <div>
            <strong>Never miss a follow-up</strong>
            <p>Stay on top of your next action.</p>
          </div>
        </div>
      </div>

      <p className="auth-showcase-footer">
        Simple tools. Better relationships.
      </p>
    </section>

    <section className="auth-form-side">
      <form className="auth-card auth-card-modern" onSubmit={handleSubmit}>
        <div className="auth-mobile-brand">
          <span className="brand-mark">L</span>
          <strong>LeadFlow</strong>
        </div>

        <p className="eyebrow">
          {register ? "GET STARTED" : "WELCOME BACK"}
        </p>

        <h2>{register ? "Create your account" : "Sign in to LeadFlow"}</h2>

        <p className="muted">
          {register
            ? "Create an account to start managing your leads."
            : "Enter your details to access your workspace."}
        </p>

        {register && (
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete={register ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="primary-button auth-submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : register
              ? "Create account →"
              : "Sign in →"}
        </button>

        <p className="switch-auth">
          {register ? "Already have an account?" : "New to LeadFlow?"}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => navigate(register ? "/login" : "/register")}
          >
            {register ? "Sign in" : "Create an account"}
          </button>
        </p>
      </form>
    </section>
  </main>
);

}


function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 5;
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);


  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userRes, statsRes, leadsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/dashboard/stats"),
          api.get("/leads", {
  params: {
    search: search,
    status: statusFilter,
    from: fromDate,
    to: toDate,
    page: page,
    limit: limit,
  },
}),
        ]);

        setUser(userRes.data.user);
        setStats(statsRes.data.stats);
        setLeads(leadsRes.data.leads);
        setPagination(leadsRes.data.pagination);
        console.log("Dashboard stats:", statsRes.data.stats);
        console.log("Dashboard leads:", leadsRes.data.leads);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load dashboard."
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    }

    loadDashboard();
}, [navigate, search, statusFilter, fromDate, toDate, page]);

  
async function handleAddLead(e) {
  e.preventDefault();
  setSaving(true);
  setFormError("");

  const formData = new FormData(e.currentTarget);
  const leadData = Object.fromEntries(formData.entries());

  try {
    await api.post("/leads", leadData);

    const [statsRes, leadsRes] = await Promise.all([
  api.get("/dashboard/stats"),
  api.get("/leads", {
    params: {
      search,
      status: statusFilter,
      from: fromDate,
      to: toDate,
      page,
      limit,
    },
  }),
]);

setStats(statsRes.data.stats);
setLeads(leadsRes.data.leads);
setPagination(leadsRes.data.pagination);
    setShowForm(false);
  } catch (err) {
    setFormError(
      err.response?.data?.message || "Could not save the lead."
    );
  } finally {
    setSaving(false);
  }
}


async function handleUpdateLead(e) {
  e.preventDefault();
  setSaving(true);
  setFormError("");

  const formData = new FormData(e.currentTarget);
  const leadData = Object.fromEntries(formData.entries());

  try {
    await api.put(`/leads/${editingLead.id}`, leadData);

    const [statsRes, leadsRes] = await Promise.all([
  api.get("/dashboard/stats"),
  api.get("/leads", {
    params: {
      search,
      status: statusFilter,
      from: fromDate,
      to: toDate,
      page,
      limit,
    },
  }),
]);

setStats(statsRes.data.stats);
setLeads(leadsRes.data.leads);
setPagination(leadsRes.data.pagination);
    setEditingLead(null);
    setShowForm(false);
  } catch (err) {
    setFormError(
      err.response?.data?.message || "Could not update the lead."
    );
  } finally {
    setSaving(false);
  }
}




async function handleDeleteLead(id) {
  if (!window.confirm("Are you sure you want to delete this lead?")) {
    return;
  }

  setDeletingId(id);
  setError("");

  try {
    await api.delete(`/leads/${id}`);

    const [statsRes, leadsRes] = await Promise.all([
  api.get("/dashboard/stats"),
  api.get("/leads", {
    params: {
      search,
      status: statusFilter,
      from: fromDate,
      to: toDate,
      page,
      limit,
    },
  }),
]);

setStats(statsRes.data.stats);
setLeads(leadsRes.data.leads);
setPagination(leadsRes.data.pagination);
  } catch (err) {
    setError(
      err.response?.data?.message || "Could not delete the lead."
    );
  } finally {
    setDeletingId(null);
  }
}




  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const cards = stats
    ? [
        { label: "Total Leads", value: stats.total_leads },
        { label: "New", value: stats.new_leads },
        { label: "Contacted", value: stats.contacted_leads },
        { label: "Qualified", value: stats.qualified_leads },
        { label: "Converted", value: stats.converted_leads },
        { label: "Lost", value: stats.lost_leads },
      ]
    : [];

    const chartData = stats
  ? [
      { name: "New", value: Number(stats.new_leads) },
      { name: "Contacted", value: Number(stats.contacted_leads) },
      { name: "Qualified", value: Number(stats.qualified_leads) },
      { name: "Converted", value: Number(stats.converted_leads) },
      { name: "Lost", value: Number(stats.lost_leads) },
    ]
  : [];

const chartColors = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

  return (
  <main className="dashboard-page dashboard-layout">
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">L</span>
        <span>LeadFlow</span>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        <a className="sidebar-link active" href="#overview">
          <span>▦</span> Overview
        </a>
        <a className="sidebar-link" href="#pipeline">
          <span>◉</span> Sales Pipeline
        </a>
        <a className="sidebar-link" href="#leads">
          <span>☷</span> All Leads
        </a>
      </nav>

      <div className="sidebar-bottom">
        <p className="sidebar-label">ACCOUNT</p>
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="sidebar-user-info">
            <strong>{user?.name || "User"}</strong>
            <span>Lead Manager</span>
          </div>
        </div>

        <button className="outline-button sidebar-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </aside>

    <div className="dashboard-content">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / OVERVIEW</p>
          <h2>Dashboard</h2>
        </div>

        <div className="topbar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span>{user?.name || "User"}</span>
        </div>
      </header>

      <section className="welcome-section" id="overview">
        <p className="eyebrow">LEAD MANAGEMENT</p>
        <h1>Welcome{user?.name ? `, ${user.name}` : ""}!</h1>
        <p className="muted">
          Here's an overview of your sales pipeline.
        </p>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="stats-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.label}>
            <p className="muted">{card.label}</p>
            <h2>{card.value}</h2>
          </article>
        ))}
      </section>

      <section
        className="placeholder-panel chart-panel"
        id="pipeline"
      >
        <h2>Lead Status Distribution</h2>
        <p className="muted">
          Overview of your current sales pipeline.
        </p>

        {chartData.some((item) => item.value > 0) ? (
          <div style={{ width: "100%", height: 320, marginTop: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {chartData
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <Cell
                        key={item.name}
                        fill={
                          chartColors[
                            chartData.findIndex(
                              (entry) => entry.name === item.name
                            )
                          ]
                        }
                      />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="muted">Add leads to see your chart.</p>
        )}
      </section>

      <section className="placeholder-panel" id="leads">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR CONTACTS</p>
            <h2>Recent Leads</h2>
          </div>

          <button
            className="primary-button add-lead-button"
            onClick={() => {
              setFormError("");
              setEditingLead(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "+ Add Lead"}
          </button>
        </div>

        {showForm && (
          <form
            className="lead-form"
            onSubmit={editingLead ? handleUpdateLead : handleAddLead}
          >
            <h3 className="full-width-field">
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </h3>

            <label>
              Lead name *
              <input
                name="name"
                placeholder="Full name"
                defaultValue={editingLead?.name || ""}
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="client@example.com"
                defaultValue={editingLead?.email || ""}
              />
            </label>

            <label>
              Phone
              <input
                name="phone"
                placeholder="Phone number"
                defaultValue={editingLead?.phone || ""}
              />
            </label>

            <label>
              Company
              <input
                name="company"
                placeholder="Company name"
                defaultValue={editingLead?.company || ""}
              />
            </label>

            <label>
              Service interested
              <input
                name="service_interested"
                placeholder="e.g. Website Development"
                defaultValue={editingLead?.service_interested || ""}
              />
            </label>

            <label>
              Status
              <select
                name="status"
                defaultValue={editingLead?.status || "New"}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </label>

            <label>
              Follow-up date
              <input
                name="follow_up_date"
                type="date"
                defaultValue={
                  editingLead?.follow_up_date?.slice(0, 10) || ""
                }
              />
            </label>

            <label className="full-width-field">
              Notes
              <textarea
                name="notes"
                placeholder="Add notes about this lead"
                rows={3}
                defaultValue={editingLead?.notes || ""}
              />
            </label>

            {formError && (
              <p className="error full-width-field">{formError}</p>
            )}

            <div className="full-width-field">
              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingLead
                    ? "Update Lead"
                    : "Save Lead"}
              </button>
            </div>
          </form>
        )}

        <div className="lead-filters">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          <label>
            From date
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <label>
            To date
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        {leads.length === 0 ? (
          <p className="muted">
            No leads found. Add your first lead soon.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.company || "—"}</td>
                    <td>{lead.service_interested || "—"}</td>
                    <td>
                      <span
                        className={`status-badge status-${lead.status.toLowerCase()}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      {lead.follow_up_date
                        ? new Date(
                            lead.follow_up_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLead(lead);
                            setFormError("");
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === lead.id}
                          onClick={() => handleDeleteLead(lead.id)}
                        >
                          {deletingId === lead.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <p className="muted">
              Page {pagination.page} of {pagination.totalPages}
              {" · "}
              {pagination.total} leads
            </p>

            <div>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        LeadFlow · Lead Management System
      </footer>
    </div>
  </main>
);
}


function ProtectedDashboard() {
  return localStorage.getItem("token")
    ? <Dashboard />
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
