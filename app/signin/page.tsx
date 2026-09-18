"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  DEMO_USERS,
  DemoUser,
  getActiveDemoUser,
  setActiveDemoUser,
  clearActiveDemoUser,
  completeFirstTimePasswordChange,
  getNewlyRegisteredUsers,
  getStoredUserProfile,
} from "../../lib/demo-users";

export default function SignInPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [customEmail, setCustomEmail] = useState<string>("admin@moa.gov.lr");
  const [customPassword, setCustomPassword] = useState<string>("demo2026");
  const [customRole, setCustomRole] = useState<string>("Ministry administrator");
  const [activeTab, setActiveTab] = useState<"personas" | "form">("personas");
  const [toast, setToast] = useState<string>("");

  // Contextual redirect and access challenge state
  const [targetRedirect, setTargetRedirect] = useState<string>("/dashboard/");
  const [targetDomain, setTargetDomain] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [existingSession, setExistingSession] = useState<DemoUser | null>(null);

  // Newly registered users & Mandatory first-time password change state
  const [registeredUsersList, setRegisteredUsersList] = useState<DemoUser[]>([]);
  const [passwordModalUser, setPasswordModalUser] = useState<DemoUser | null>(null);
  const [currentTempInput, setCurrentTempInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check existing authenticated session
      const active = getActiveDemoUser();
      if (active) {
        setExistingSession(active);
      }

      // Load newly registered users
      const newlyRegistered = getNewlyRegisteredUsers();
      setRegisteredUsersList(newlyRegistered);

      // Parse query params
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");
      const domainParam = params.get("domain") || params.get("title");
      const roleParam = params.get("role") || params.get("recommendedRole");
      const catParam = params.get("cat") || params.get("category");
      const emailParam = params.get("email");
      const tempParam = params.get("temp");

      if (redirectParam) {
        setTargetRedirect(redirectParam);
      }
      if (domainParam) {
        setTargetDomain(domainParam);
      }
      if (roleParam) {
        setTargetRole(roleParam);
        setCustomRole(roleParam);
      }
      if (catParam) {
        setSelectedCategory(catParam);
      }

      if (emailParam) {
        setCustomEmail(emailParam);
        if (tempParam) setCustomPassword(tempParam);
        // Find registered user requiring password change
        const target = newlyRegistered.find(u => u.email.toLowerCase() === emailParam.toLowerCase()) ||
          (getStoredUserProfile(emailParam) as DemoUser | null);
        if (target && (target.mustChangePassword || tempParam)) {
          setPasswordModalUser({
            ...target,
            tempPassword: tempParam || target.tempPassword || target.passwordHint,
          });
          setCurrentTempInput(tempParam || target.tempPassword || target.passwordHint || "");
        }
      }
    }
  }, []);

  const allAvailableUsers = useMemo(() => {
    const combined = [...registeredUsersList, ...DEMO_USERS];
    const seen = new Set<string>();
    const list: DemoUser[] = [];
    for (const u of combined) {
      const key = u.email.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(u);
      }
    }
    return list;
  }, [registeredUsersList]);

  const filteredUsers = allAvailableUsers.filter((u) => {
    const matchesCategory = selectedCategory === "all" || u.category === selectedCategory || (selectedCategory === "producer" && u.isNewlyRegistered);
    const matchesSearch =
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.countyScope.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.dfrId && u.dfrId.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDashboardUrl = (target?: string) => {
    const isGhPages =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/liberia-digital-farmer-registry");
    const prefix = isGhPages ? "/liberia-digital-farmer-registry" : "";

    if (target) {
      let clean = target.trim();
      if (clean.startsWith("/liberia-digital-farmer-registry")) {
        return clean;
      }
      if (!clean.startsWith("/")) {
        clean = "/" + clean;
      }
      if (clean.startsWith("/dashboard#")) {
        clean = clean.replace("/dashboard#", "/dashboard/#");
      } else if (clean === "/dashboard") {
        clean = "/dashboard/";
      }
      return `${prefix}${clean}`;
    }
    return `${prefix}/dashboard/`;
  };

  const getHomeUrl = () => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/liberia-digital-farmer-registry")
    ) {
      return "/liberia-digital-farmer-registry/";
    }
    return "/";
  };

  const handleSignInAs = (user: DemoUser) => {
    if (user.mustChangePassword) {
      setPasswordModalUser(user);
      setCurrentTempInput(user.tempPassword || user.passwordHint || "");
      setPasswordError("");
      return;
    }
    setActiveDemoUser(user);
    setToast(`Credentials verified. Authenticating as ${user.name} (${user.role})…`);
    setTimeout(() => {
      window.location.href = getDashboardUrl(targetRedirect);
    }, 450);
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMail = customEmail.trim().toLowerCase();
    const cleanDigits = customEmail.replace(/[^0-9]/g, "");
    
    // Check if custom sign in matches a newly registered user with pending password change
    const foundReg = allAvailableUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanMail ||
        (cleanDigits && u.phone && u.phone.replace(/[^0-9]/g, "") === cleanDigits) ||
        (u.dfrId && u.dfrId.toLowerCase() === cleanMail)
    );

    if (foundReg && foundReg.mustChangePassword) {
      setPasswordModalUser(foundReg);
      setCurrentTempInput(customPassword || foundReg.tempPassword || "");
      setPasswordError("");
      return;
    }

    const user: DemoUser = foundReg || {
      id: `custom-${Date.now()}`,
      name: customEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role: customRole,
      email: customEmail,
      passwordHint: customPassword,
      institution: customRole.includes("Ministry")
        ? "Ministry of Agriculture"
        : "County Agricultural Directorate",
      countyScope: "National",
      districtScope: "All Districts",
      description: "Custom authenticated session with user-selected credentials.",
      badgeColor: "#22c55e",
      category: "admin",
      avatar: customEmail.slice(0, 2).toUpperCase(),
    };
    setActiveDemoUser(user);
    setToast(`Credentials verified. Authenticating as ${user.name} (${user.role})…`);
    setTimeout(() => {
      window.location.href = getDashboardUrl(targetRedirect);
    }, 450);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwordModalUser) return;

    const expected = (passwordModalUser.tempPassword || passwordModalUser.passwordHint || "").trim();
    if (expected && currentTempInput.trim() !== expected) {
      setPasswordError("The temporary password entered does not match your assigned registration temporary password.");
      return;
    }

    if (newPasswordInput.length < 4) {
      setPasswordError("Your new password or PIN must be at least 4 characters.");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError("The new passwords do not match. Please re-enter.");
      return;
    }

    const updated = completeFirstTimePasswordChange(passwordModalUser.email, newPasswordInput);
    if (updated) {
      setToast(`Password successfully updated! Security requirement cleared. Authenticating as ${updated.name}…`);
      setPasswordModalUser(null);
      setTimeout(() => {
        window.location.href = getDashboardUrl(targetRedirect);
      }, 500);
    } else {
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  return (
    <main className="signin-portal-container">
      {/* Header */}
      <header className="signin-header glass">
        <Link href={getHomeUrl()} className="signin-brand">
          <img
            src="/liberia-digital-farmer-registry/assets/fao-logo.png"
            alt="FAO"
            onError={(e) => {
              e.currentTarget.src = "/assets/fao-logo.png";
            }}
          />
          <div>
            <strong>Digital Farmer Registry</strong>
            <span>Republic of Liberia · Ministry of Agriculture</span>
          </div>
        </Link>
        <div className="signin-header-right">
          <div className="moa-pill">
            <img
              src="/liberia-digital-farmer-registry/assets/moa-logo.png"
              alt="MoA"
              onError={(e) => {
                e.currentTarget.src = "/assets/moa-logo.png";
              }}
            />
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
        <h1>Identity & Access Control Portal</h1>
        <p>
          Liberia DFR enforces role-based access control (RBAC). Anonymous visitors must authenticate with valid credentials or select an authorized officer persona before accessing registry workspaces.
        </p>

        {/* Existing Session Resumption Banner */}
        {existingSession && (
          <div
            style={{
              margin: "18px auto 0",
              maxWidth: "760px",
              padding: "12px 18px",
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: existingSession.badgeColor || "#3b82f6",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {existingSession.avatar}
              </div>
              <div>
                <div style={{ fontSize: "0.74rem", color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
                  Active Session Detected
                </div>
                <div style={{ color: "#ffffff", fontSize: "0.92rem", fontWeight: 600 }}>
                  {existingSession.name} · <span style={{ color: "#86efac", fontWeight: 500 }}>{existingSession.role}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setToast(`Resuming session as ${existingSession.name}…`);
                  setTimeout(() => {
                    window.location.href = getDashboardUrl(targetRedirect);
                  }, 300);
                }}
                style={{
                  background: "#22c55e",
                  color: "#052e16",
                  fontWeight: 700,
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Continue to Workspace →
              </button>
              <button
                onClick={() => {
                  clearActiveDemoUser();
                  setExistingSession(null);
                  setToast("Previous session cleared. Please select or enter new credentials.");
                }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Switch Account
              </button>
            </div>
          </div>
        )}

        {/* Contextual Access Challenge Banner */}
        {(targetDomain || targetRedirect !== "/dashboard/") && (
          <div
            style={{
              margin: "20px auto 0",
              maxWidth: "760px",
              padding: "16px 20px",
              borderRadius: "14px",
              background: "rgba(234, 179, 8, 0.08)",
              border: "1px solid rgba(234, 179, 8, 0.35)",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(234, 179, 8, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.15rem",
                flexShrink: 0,
                border: "1px solid rgba(234, 179, 8, 0.4)",
              }}
            >
              🔒
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#fde047",
                  marginBottom: "4px",
                }}
              >
                <span>● Authentication Challenge</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>Restricted National Asset</span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "#ffffff", fontWeight: 600 }}>
                Credentials Required: Accessing{" "}
                <span style={{ color: "#fef08a" }}>
                  {targetDomain || "Protected Registry Workspace"}
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.45 }}>
                You have requested a direct link to an internal operational domain. Anonymous access is blocked by government security policy. Please select an authorized officer account or submit official credentials below to unlock this view.
              </p>
              {targetRole && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.78rem",
                    background: "rgba(0,0,0,0.35)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Target Role Clearance:</span>
                  <strong style={{ color: "#4ade80" }}>{targetRole}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="signin-toast" style={{ marginTop: "16px" }}>
            <span className="spinner">✓</span> {toast}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="signin-tabs" style={{ marginTop: "24px" }}>
          <button
            className={activeTab === "personas" ? "active" : ""}
            onClick={() => setActiveTab("personas")}
          >
            ◉ Official Officer Personas ({DEMO_USERS.length} Verified Roles)
          </button>
          <button
            className={activeTab === "form" ? "active" : ""}
            onClick={() => setActiveTab("form")}
          >
            ✎ Custom Credentials Login Form
          </button>
        </div>
      </section>

      {activeTab === "personas" ? (
        <section className="personas-section">
          {/* Filter Bar */}
          <div className="filter-bar glass">
            <div className="category-filters">
              {[
                { id: "all", label: "All Clearances" },
                { id: "field", label: "Field & GIS" },
                { id: "admin", label: "Ministry & Architecture" },
                { id: "producer", label: "Producers & Coops" },
                { id: "extension", label: "Advisory & Extension" },
                { id: "oversight", label: "Audits & FAO Oversight" },
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
                placeholder="Filter by officer name, role, or county…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="personas-grid">
            {filteredUsers.map((user) => {
              const isRecommended =
                targetRole &&
                user.role.toLowerCase().includes(targetRole.toLowerCase());

              return (
                <article
                  key={user.id}
                  className="persona-card glass"
                  style={
                    isRecommended
                      ? {
                          borderColor: "#f59e0b",
                          background: "rgba(245, 158, 11, 0.08)",
                          boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
                        }
                      : undefined
                  }
                >
                  {user.isNewlyRegistered && (
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#16a34a",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      ● Newly Registered · Password Change Pending
                    </div>
                  )}

                  {isRecommended && (
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#f59e0b",
                        color: "#451a03",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      ★ Recommended for Requested Workspace
                    </div>
                  )}

                  <div className="card-top">
                    <div className="avatar-circle" style={{ borderColor: user.badgeColor }}>
                      {user.avatar}
                    </div>
                    <div className="user-meta">
                      <h3>{user.name}</h3>
                      <span
                        className="role-tag"
                        style={{
                          color: user.badgeColor,
                          borderColor: `${user.badgeColor}40`,
                          backgroundColor: `${user.badgeColor}15`,
                        }}
                      >
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
                      <small>Official Email / ID</small>
                      <code>{user.dfrId ? `${user.dfrId} (${user.email})` : user.email}</code>
                    </div>
                    <div>
                      <small>{user.mustChangePassword ? "Temporary PIN / Password" : "Credential Key"}</small>
                      <code style={user.mustChangePassword ? { color: "#b91c1c", fontWeight: 700 } : undefined}>
                        {user.passwordHint}
                      </code>
                    </div>
                  </div>

                  <button
                    className="signin-btn"
                    style={{ backgroundColor: user.mustChangePassword ? "#15803d" : user.badgeColor }}
                    onClick={() => handleSignInAs(user)}
                  >
                    {user.mustChangePassword ? "🔑 1st Sign-In · Set Password →" : `Authenticate as ${user.role.split(" ")[0]} →`}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="custom-form-section">
          <form className="custom-signin-card glass" onSubmit={handleCustomSignIn}>
            <h2>Government & Partner Credentials</h2>
            <p>
              Enter your official ministry credentials to authenticate and unlock your designated agricultural workspace.
            </p>

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
              <label>Password / Security Token</label>
              <input
                type="password"
                required
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="••••••••"
              />
              <small className="hint">Demo credentials accept any secure password token.</small>
            </div>

            <div className="form-group">
              <label>Designated Clearance Role</label>
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
              Authenticate & Enter Registry →
            </button>
          </form>
        </section>
      )}

      {/* Footer */}
      <footer className="signin-footer">
        <div>
          <img
            src="/liberia-digital-farmer-registry/assets/liberia-seal.png"
            alt="Republic of Liberia"
            onError={(e) => {
              e.currentTarget.src = "/assets/liberia-seal.png";
            }}
          />
          <strong>Digital Farmer Registry Platform</strong>
        </div>
        <p>
          Government of Liberia · Ministry of Agriculture · Food and Agriculture Organization of the United Nations (FAO)
        </p>
      </footer>

      {/* Mandatory First-Time Password Change Challenge Modal */}
      {passwordModalUser && (
        <div
          className="modal-wrap"
          style={{
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 29, 0.85)",
            backdropFilter: "blur(6px)",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
              border: "2px solid #166534",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "14px",
                marginBottom: "16px",
              }}
            >
              <img
                src="/assets/moa-logo.png"
                alt="MoA"
                style={{ width: "42px", height: "42px", objectFit: "contain" }}
                onError={(e) => {
                  e.currentTarget.src = "/liberia-digital-farmer-registry/assets/moa-logo.png";
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#166534",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  REPUBLIC OF LIBERIA · MINISTRY OF AGRICULTURE
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: "19px", color: "#102c20" }}>
                  Mandatory First-Time Password Change
                </h2>
              </div>
            </div>

            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde047",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#854d0e",
                lineHeight: "1.5",
              }}
            >
              <b>Security Policy Requirement:</b> Welcome to the Liberia DFR platform, <b>{passwordModalUser.name}</b> ({passwordModalUser.dfrId || passwordModalUser.role}). Because your account was created with a temporary password, national security policy requires creating your own confidential permanent password before unlocking your registry profile and services.
            </div>

            {passwordError && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "14px",
                  fontWeight: 600,
                }}
              >
                ⚠️ {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  Assigned Temporary Password / PIN*
                </label>
                <input
                  type="text"
                  required
                  value={currentTempInput}
                  onChange={(e) => setCurrentTempInput(e.target.value)}
                  placeholder="e.g. DFR-BO-8392"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  New Confidential Password or 4-Digit PIN*
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new strong password or PIN"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
                <small style={{ color: "#64748b", fontSize: "10px" }}>
                  Minimum 4 characters or digits. Memorize or save securely.
                </small>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  Confirm New Password / PIN*
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter new password or PIN"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: 0,
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✓ Set Password &amp; Enter Portal →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
