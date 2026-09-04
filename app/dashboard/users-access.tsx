"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { DEMO_USERS, DemoUser, setActiveDemoUser } from "../../lib/demo-users";
import { setActiveRole } from "../../lib/mock-data";

type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  countyScope: string;
  districtScope: string;
  sensitivityCeiling: string;
  status: "Active" | "Suspended" | "Pending activation";
  lastLogin: string;
  isDemo?: boolean;
};

const INITIAL_SYSTEM_USERS: SystemUser[] = DEMO_USERS.map((u, i) => {
  let county = "National";
  let district = "All";
  if (u.role === "County agricultural officer") county = "Nimba";
  else if (u.role === "District agricultural officer") { county = "Bong"; district = "Suakoko"; }
  else if (u.role === "Enumerator") { county = "Montserrado"; district = "Greater Monrovia"; }
  else if (u.role === "Senior enumerator") { county = "Lofa"; district = "Foya"; }
  else if (u.role === "Extension agent") { county = "Grand Bassa"; district = "District 2"; }

  let sensitivity = "Internal";
  if (["Ministry administrator", "System administrator", "Security auditor"].includes(u.role)) {
    sensitivity = "Full Unrestricted";
  } else if (["Verification officer", "GIS officer", "Payment officer"].includes(u.role)) {
    sensitivity = "Confidential";
  } else if (["Enumerator", "Extension agent"].includes(u.role)) {
    sensitivity = "Restricted Field";
  }

  let institution = "Ministry of Agriculture";
  if (["Development-partner user"].includes(u.role)) institution = "FAO of the United Nations";
  else if (["GIS officer"].includes(u.role)) institution = "LISGIS";
  else if (["Cooperative representative"].includes(u.role)) institution = "Cooperative Development Agency";
  else if (["Security auditor", "Independent audit user"].includes(u.role)) institution = "General Auditing Commission";

  return {
    id: `USR-${String(i + 1).padStart(4, "0")}`,
    name: u.name,
    email: u.email,
    role: u.role,
    institution,
    countyScope: county,
    districtScope: district,
    sensitivityCeiling: sensitivity,
    status: "Active",
    lastLogin: "2026-09-03 16:45",
    isDemo: true,
  };
});

const ROLES_LIST = [
  "Ministry administrator",
  "Enumerator",
  "Senior enumerator",
  "County agricultural officer",
  "District agricultural officer",
  "Verification officer",
  "GIS officer",
  "Extension agent",
  "Cooperative representative",
  "Farmer",
  "Program officer",
  "Monitoring and evaluation officer",
  "Data analyst",
  "Development-partner user",
  "Security auditor",
  "System administrator",
  "Read-only oversight user",
  "Independent audit user",
];

const COUNTIES_LIST = [
  "National",
  "Bomi",
  "Bong",
  "Gbarpolu",
  "Grand Bassa",
  "Grand Cape Mount",
  "Grand Gedeh",
  "Grand Kru",
  "Lofa",
  "Margibi",
  "Maryland",
  "Montserrado",
  "Nimba",
  "River Cess",
  "River Gee",
  "Sinoe",
];

const STORAGE_KEY = "dfr_system_users_store_v1";

export default function UsersAccessWorkspace({
  notify,
  onSwitchUser,
}: {
  notify: (s: string) => void;
  onSwitchUser?: (user: { name: string; email: string }, role: string) => void;
}) {
  const [users, setUsers] = useState<SystemUser[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_SYSTEM_USERS;
  });

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [countyFilter, setCountyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      } catch {}
    }
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase()) ||
        u.role.toLowerCase().includes(q.toLowerCase()) ||
        u.institution.toLowerCase().includes(q.toLowerCase()) ||
        u.countyScope.toLowerCase().includes(q.toLowerCase());

      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchCounty = countyFilter === "all" || u.countyScope === countyFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;

      return matchQ && matchRole && matchCounty && matchStatus;
    });
  }, [users, q, roleFilter, countyFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "Active").length,
      suspended: users.filter((u) => u.status === "Suspended").length,
      rolesCount: new Set(users.map((u) => u.role)).size,
    };
  }, [users]);

  function toggleStatus(userId: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "Active" ? "Suspended" : "Active";
          notify(`User account ${u.name} (${u.email}) is now ${newStatus}.`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  }

  function handleSwitchPersona(u: SystemUser) {
    setActiveRole(u.role);
    const demo = DEMO_USERS.find((d) => d.email === u.email) || {
      name: u.name,
      email: u.email,
      role: u.role,
      description: u.institution,
    };
    setActiveDemoUser(demo);
    if (onSwitchUser) {
      onSwitchUser({ name: u.name, email: u.email }, u.role);
    }
    notify(`Switched active session to persona: ${u.name} (${u.role})`);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  }

  function handleCreateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const role = String(fd.get("role") || "Enumerator");
    const institution = String(fd.get("institution") || "Ministry of Agriculture");
    const countyScope = String(fd.get("countyScope") || "National");
    const districtScope = String(fd.get("districtScope") || "All");
    const sensitivityCeiling = String(fd.get("sensitivityCeiling") || "Internal");

    if (!name || !email) {
      notify("Please provide both name and email.");
      return;
    }

    const newUser: SystemUser = {
      id: `USR-${String(users.length + 1).padStart(4, "0")}`,
      name,
      email,
      role,
      institution,
      countyScope,
      districtScope,
      sensitivityCeiling,
      status: "Active",
      lastLogin: "Never",
      isDemo: false,
    };

    setUsers((prev) => [newUser, ...prev]);
    setModal(false);
    notify(`User account ${name} successfully provisioned with role ${role}.`);
  }

  return (
    <div className="users-access-workspace" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner */}
      <section
        className="panel"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, #184128 0%, #1e5233 100%)",
          color: "#fff",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#a4c4a0",
              fontWeight: 700,
              display: "block",
              marginBottom: 4,
            }}
          >
            NATIONAL REGISTRY SECURITY & GOVERNANCE
          </span>
          <h2 style={{ fontSize: 24, margin: "0 0 6px", fontFamily: "Georgia, serif", color: "#fff" }}>
            Users, Roles & Access Control Center
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#d1e3ce", maxWidth: 640 }}>
            Manage administrative credentials, decentralized field personnel, institutional partners, RBAC
            authorizations, geographic jurisdiction, and cryptographic data sensitivity ceilings.
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          style={{
            background: "#48bb78",
            color: "#0f2e1b",
            border: "none",
            fontWeight: 700,
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          ＋ Add System User
        </button>
      </section>

      {/* Metrics Row */}
      <div className="metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <article className="metric glass" style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: 12, color: "#64748b" }}>Provisioned Users</span>
            <strong style={{ fontSize: 24, color: "#1e293b", display: "block" }}>{stats.total}</strong>
            <small style={{ fontSize: 11, color: "#16a34a" }}>All Liberian institutions</small>
          </div>
          <i style={{ fontSize: 22, color: "#24653e" }}>♙</i>
        </article>
        <article className="metric glass" style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: 12, color: "#64748b" }}>Active Accounts</span>
            <strong style={{ fontSize: 24, color: "#16a34a", display: "block" }}>{stats.active}</strong>
            <small style={{ fontSize: 11, color: "#64748b" }}>Authorized login state</small>
          </div>
          <i style={{ fontSize: 22, color: "#16a34a" }}>✓</i>
        </article>
        <article className="metric glass" style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: 12, color: "#64748b" }}>Suspended Accounts</span>
            <strong style={{ fontSize: 24, color: stats.suspended > 0 ? "#dc2626" : "#64748b", display: "block" }}>
              {stats.suspended}
            </strong>
            <small style={{ fontSize: 11, color: "#64748b" }}>Security holds / inactive</small>
          </div>
          <i style={{ fontSize: 22, color: "#dc2626" }}>⊘</i>
        </article>
        <article className="metric glass" style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: 12, color: "#64748b" }}>Distinct System Roles</span>
            <strong style={{ fontSize: 24, color: "#1e293b", display: "block" }}>{stats.rolesCount}</strong>
            <small style={{ fontSize: 11, color: "#2563eb" }}>RBAC governed profiles</small>
          </div>
          <i style={{ fontSize: 22, color: "#2563eb" }}>◈</i>
        </article>
      </div>

      {/* Filter and Search Bar */}
      <article className="panel registry" style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search user by name, email, role, county, institution..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 13,
              }}
            />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>⌕</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}
          >
            <option value="all">All Roles ({ROLES_LIST.length})</option>
            {ROLES_LIST.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}
          >
            <option value="all">All Counties (15 + National)</option>
            {COUNTIES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* User Directory Table */}
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>User Profile</th>
                <th style={{ padding: "10px 12px" }}>System Role & Tier</th>
                <th style={{ padding: "10px 12px" }}>Institution</th>
                <th style={{ padding: "10px 12px" }}>Geographic Jurisdiction</th>
                <th style={{ padding: "10px 12px" }}>Data Clearance</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isActive = u.status === "Active";
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: isActive ? "#dcfce7" : "#fee2e2",
                            color: isActive ? "#166534" : "#991b1b",
                            fontWeight: 700,
                            fontSize: 12,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <b style={{ display: "block", color: "#0f172a" }}>{u.name}</b>
                          <small style={{ color: "#64748b", fontSize: 11 }}>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "#e0f2fe",
                          color: "#0369a1",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#334155" }}>
                      {u.institution}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <b>{u.countyScope}</b>
                      {u.districtScope !== "All" && (
                        <small style={{ display: "block", color: "#64748b", fontSize: 11 }}>
                          {u.districtScope}
                        </small>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <code style={{ fontSize: 11, background: "#f1f5f9", padding: "2px 5px", borderRadius: 3 }}>
                        {u.sensitivityCeiling}
                      </code>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isActive ? "#dcfce7" : "#fee2e2",
                          color: isActive ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleSwitchPersona(u)}
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            borderRadius: 4,
                            padding: "4px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                          title={`Simulate session as ${u.name}`}
                        >
                          Switch Persona ↗
                        </button>
                        <button
                          onClick={() => toggleStatus(u.id)}
                          style={{
                            background: isActive ? "#fef2f2" : "#f0fdf4",
                            color: isActive ? "#b91c1c" : "#166534",
                            border: `1px solid ${isActive ? "#fecaca" : "#bbf7d0"}`,
                            borderRadius: 4,
                            padding: "4px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {isActive ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b" }}>
              No user accounts match the current filter criteria.
            </div>
          )}
        </div>
      </article>

      {/* Role Hierarchy Card */}
      <article className="panel" style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 22 }}>
        <h3 style={{ fontSize: 16, margin: "0 0 6px", fontFamily: "Georgia, serif" }}>
          Liberia National Farmer Registry Security Architecture & Role Taxonomy
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>
          Segregation of duties (SoD) enforced via server-side session checks and cryptographically signed verification tokens.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <b style={{ color: "#1e293b", fontSize: 13, display: "block", marginBottom: 4 }}>1. National Governance & Policy</b>
            <span style={{ fontSize: 11, color: "#64748b" }}>Ministry Administrator, System Administrator</span>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              Full institutional governance, inter-agency data sharing, policy compliance, and audit log inspection.
            </p>
          </div>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <b style={{ color: "#1e293b", fontSize: 13, display: "block", marginBottom: 4 }}>2. Field Enumeration & Capture</b>
            <span style={{ fontSize: 11, color: "#64748b" }}>Senior Enumerator, Enumerator, Extension Agent</span>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              Offline farmer profiling, boundary vertex walk, provisional ID generation, and device-local encrypted queues.
            </p>
          </div>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <b style={{ color: "#1e293b", fontSize: 13, display: "block", marginBottom: 4 }}>3. Decentralized Verification</b>
            <span style={{ fontSize: 11, color: "#64748b" }}>County Agricultural Officer, District Agricultural Officer</span>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              Maker-checker quality approvals, deduplication checks, and official National DFR ID issuance.
            </p>
          </div>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <b style={{ color: "#1e293b", fontSize: 13, display: "block", marginBottom: 4 }}>4. Technical Operations</b>
            <span style={{ fontSize: 11, color: "#64748b" }}>GIS Officer, Voucher Administrator, Payment Officer</span>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              LADM parcel validation, seed/fertilizer subsidy distribution, and Lonestar/Orange mobile money reconciliation.
            </p>
          </div>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <b style={{ color: "#1e293b", fontSize: 13, display: "block", marginBottom: 4 }}>5. Partners & Assurance</b>
            <span style={{ fontSize: 11, color: "#64748b" }}>FAO Oversight, Security Auditor, Independent Audit</span>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              Independent technical audit, immutable log verification, contract delivery milestones, and quality assurance.
            </p>
          </div>
        </div>
      </article>

      {/* Add User Modal */}
      {modal && (
        <div className="modal-wrap" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 1000 }}>
          <form
            className="register-modal glass compact-modal"
            onSubmit={handleCreateUser}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              width: "min(540px, 94vw)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>Security Provisioning</span>
                <h3 style={{ margin: "2px 0 0", fontFamily: "Georgia, serif" }}>Provision New System User</h3>
              </div>
              <button
                type="button"
                onClick={() => setModal(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 16 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Full Legal Name*
                <input name="name" required placeholder="e.g. Samuel K. Toe" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </label>

              <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Official Email Address*
                <input name="email" type="email" required placeholder="e.g. s.toe@moa.gov.lr" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Assigned Role*
                <select name="role" defaultValue="Enumerator" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  {ROLES_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Institution*
                <select name="institution" defaultValue="Ministry of Agriculture" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  <option>Ministry of Agriculture</option>
                  <option>LISGIS</option>
                  <option>MGCSP</option>
                  <option>Cooperative Development Agency</option>
                  <option>FAO of the United Nations</option>
                  <option>General Auditing Commission</option>
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                County Jurisdiction*
                <select name="countyScope" defaultValue="National" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  {COUNTIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                District Jurisdiction
                <input name="districtScope" defaultValue="All" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </label>

              <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600 }}>
                Data Sensitivity Ceiling*
                <select name="sensitivityCeiling" defaultValue="Internal" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  <option value="Restricted Field">Restricted Field (Assigned Community Only)</option>
                  <option value="Internal">Internal (County Scope)</option>
                  <option value="Confidential">Confidential (National Aggregates & PII)</option>
                  <option value="Full Unrestricted">Full Unrestricted (Ministry Administrator / Audit)</option>
                </select>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setModal(false)}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#24653e", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
              >
                Provision Account →
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
