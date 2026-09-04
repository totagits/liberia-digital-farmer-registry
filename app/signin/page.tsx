"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_USERS, DemoUser, setActiveDemoUser } from "../../lib/demo-users";

export default function SignInPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [customEmail, setCustomEmail] = useState<string>("admin@moa.gov.lr");
  const [customPassword, setCustomPassword] = useState<string>("demo2026");
  const [customRole, setCustomRole] = useState<string>("Ministry administrator");
  const [activeTab, setActiveTab] = useState<"personas" | "form">("personas");
  const [toast, setToast] = useState<string>("");

  const filteredUsers = DEMO_USERS.filter((u) => {
    const matchesCategory = selectedCategory === "all" || u.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.countyScope.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDashboardUrl = () => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry")) {
      return "/liberia-digital-farmer-registry/dashboard/";
    }
    return "/dashboard/";
  };

  const getHomeUrl = () => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry")) {
      return "/liberia-digital-farmer-registry/";
    }
    return "/";
  };

  const handleSignInAs = (user: DemoUser) => {
    setActiveDemoUser(user);
    setToast(`Signing in as ${user.name} (${user.role})…`);
    setTimeout(() => {
      window.location.href = getDashboardUrl();
    }, 400);
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const user: DemoUser = {
      id: `custom-${Date.now()}`,
      name: customEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role: customRole,
      email: customEmail,
      passwordHint: customPassword,
      institution: customRole.includes("Ministry") ? "Ministry of Agriculture" : "Agricultural Directorate",
      countyScope: "National",
      districtScope: "All Districts",
      description: "Custom authenticated session with user-selected credentials.",
      badgeColor: "#22c55e",
      category: "admin",
      avatar: customEmail.slice(0, 2).toUpperCase(),
    };
    setActiveDemoUser(user);
    setToast(`Signing in as ${user.name} (${user.role})…`);
    setTimeout(() => {
      window.location.href = getDashboardUrl();
    }, 400);
  };

  return (
    <main className="signin-portal-container">
      {/* Header */}
      <header className="signin-header glass">
        <Link href={getHomeUrl()} className="signin-brand">
          <img src="/liberia-digital-farmer-registry/assets/fao-logo.png" alt="FAO" onError={(e) => { e.currentTarget.src = "/assets/fao-logo.png"; }} />
          <div>
            <strong>Digital Farmer Registry</strong>
            <span>Republic of Liberia · Ministry of Agriculture</span>
          </div>
        </Link>
        <div className="signin-header-right">
          <div className="moa-pill">
            <img src="/liberia-digital-farmer-registry/assets/moa-logo.png" alt="MoA" onError={(e) => { e.currentTarget.src = "/assets/moa-logo.png"; }} />
            <span>Technical Support: FAO</span>
          </div>
          <Link href={getHomeUrl()} className="back-link">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="signin-hero">
        <div className="eyebrow">
          <span></span> National Agriculture Digital Public Infrastructure
        </div>
        <h1>Demonstration & Role Testing Portal</h1>
        <p>
          Select an authenticated demo persona below to test role-governed workflows, or enter custom credentials to explore any of Liberia&apos;s 24 agricultural workspaces.
        </p>

        {toast && (
          <div className="signin-toast">
            <span className="spinner">✓</span> {toast}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="signin-tabs">
          <button
            className={activeTab === "personas" ? "active" : ""}
            onClick={() => setActiveTab("personas")}
          >
            ◉ 1-Click Role Personas ({DEMO_USERS.length} Demo Accounts)
          </button>
          <button
            className={activeTab === "form" ? "active" : ""}
            onClick={() => setActiveTab("form")}
          >
            ✎ Custom Credentials Sign-In
          </button>
        </div>
      </section>

      {activeTab === "personas" ? (
        <section className="personas-section">
          {/* Filter Bar */}
          <div className="filter-bar glass">
            <div className="category-filters">
              {[
                { id: "all", label: "All Roles" },
                { id: "admin", label: "Ministry & Oversight" },
                { id: "field", label: "Field & GIS" },
                { id: "producer", label: "Farmers & Cooperatives" },
                { id: "extension", label: "Advisory & Extension" },
                { id: "oversight", label: "Audit & FAO Oversight" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={selectedCategory === cat.id ? "active" : ""}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Filter by name, role, or county…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="personas-grid">
            {filteredUsers.map((user) => (
              <article key={user.id} className="persona-card glass">
                <div className="card-top">
                  <div className="avatar-circle" style={{ borderColor: user.badgeColor }}>
                    {user.avatar}
                  </div>
                  <div className="user-meta">
                    <h3>{user.name}</h3>
                    <span className="role-tag" style={{ color: user.badgeColor, borderColor: `${user.badgeColor}40`, backgroundColor: `${user.badgeColor}15` }}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <p className="card-desc">{user.description}</p>

                <div className="card-details">
                  <div>
                    <small>Scope</small>
                    <b>{user.countyScope}</b>
                  </div>
                  <div>
                    <small>Institution</small>
                    <b>{user.institution}</b>
                  </div>
                  <div>
                    <small>Demo Email</small>
                    <code>{user.email}</code>
                  </div>
                  <div>
                    <small>Password</small>
                    <code>{user.passwordHint}</code>
                  </div>
                </div>

                <button
                  className="signin-btn"
                  style={{ backgroundColor: user.badgeColor }}
                  onClick={() => handleSignInAs(user)}
                >
                  Sign In as {user.role.split(" ")[0]} →
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="custom-form-section">
          <form className="custom-signin-card glass" onSubmit={handleCustomSignIn}>
            <h2>Custom Demo Sign-In</h2>
            <p>Enter your credentials or choose any role to access the Liberia DFR platform.</p>

            <div className="form-group">
              <label>Official Email Address</label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="officer@moa.gov.lr"
              />
            </div>

            <div className="form-group">
              <label>Password (Any Demo Password)</label>
              <input
                type="password"
                required
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="••••••••"
              />
              <small className="hint">Demo mode accepts any password.</small>
            </div>

            <div className="form-group">
              <label>Assigned Platform Role</label>
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              >
                <option value="Ministry administrator">Ministry Administrator (National Full Access)</option>
                <option value="County agricultural officer">County Agricultural Officer (CAO)</option>
                <option value="District agricultural officer">District Agricultural Officer (DAO)</option>
                <option value="Senior enumerator">Senior Enumerator (Verification & QA)</option>
                <option value="Enumerator">Enumerator (Field Registration & GPS)</option>
                <option value="GIS officer">GIS & Cadastral Officer</option>
                <option value="Cooperative representative">Cooperative Representative</option>
                <option value="Farmer">Farmer (Vouchers, Subsidies & Grievances)</option>
                <option value="Extension agent">Extension & Agronomic Advisory Agent</option>
                <option value="Program officer">Program Officer (Input Subsidies)</option>
                <option value="Development-partner user">Development Partner / FAO Oversight</option>
                <option value="Security auditor">Security Auditor</option>
                <option value="Read-only oversight user">Read-only Oversight</option>
              </select>
            </div>

            <button type="submit" className="submit-custom-btn">
              Enter Liberia DFR Platform →
            </button>
          </form>
        </section>
      )}

      {/* Footer */}
      <footer className="signin-footer">
        <div>
          <img src="/liberia-digital-farmer-registry/assets/liberia-seal.png" alt="Republic of Liberia" onError={(e) => { e.currentTarget.src = "/assets/liberia-seal.png"; }} />
          <strong>Digital Farmer Registry Platform</strong>
        </div>
        <p>
          Government of Liberia · Ministry of Agriculture · Food and Agriculture Organization of the United Nations (FAO)
        </p>
      </footer>
    </main>
  );
}
