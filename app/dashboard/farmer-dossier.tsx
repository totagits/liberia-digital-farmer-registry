"use client";

import React, { FormEvent, useState } from "react";

export type FarmerRecord = {
  id: number;
  dfrId: string;
  provisionalId?: string;
  approvedDfrId?: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  county: string;
  district: string;
  community: string;
  crop: string;
  farmSize: number;
  status: string;
  vulnerability: string;
  roadAccess?: string;
  roadCondition?: string;
  roadSeasonality?: string;
  roadDistanceMiles?: number;
  processingAccess?: string;
  processingFacilityType?: string;
  processingFacilityName?: string;
  processingFacilityStatus?: string;
  processingDistanceMiles?: number;
  processingTravelMinutes?: number;
  processingTransportMode?: string;
  latitude: number | null;
  longitude: number | null;
  photoUrl?: string;
  createdAt?: string;
};

const getAssetUrl = (p: string) => {
  const clean = p.startsWith("/") ? p.slice(1) : p;
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry")) {
    return `/liberia-digital-farmer-registry/${clean}`;
  }
  return `/${clean}`;
};

const resolvePhotoUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return getAssetUrl(url);
};

function SmartChip() {
  return (
    <div className="id-card-smart-chip" title="Biometric EMV Cryptoprocessor Contact Pad">
      <svg viewBox="0 0 54 40" className="chip-svg" width="46" height="34">
        <defs>
          <linearGradient id="goldChipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae188" />
            <stop offset="30%" stopColor="#dca431" />
            <stop offset="65%" stopColor="#b48316" />
            <stop offset="100%" stopColor="#f7d46c" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="52" height="38" rx="6" fill="url(#goldChipGrad)" stroke="#7e5a0e" strokeWidth="1.2" />
        <line x1="1" y1="13" x2="18" y2="13" stroke="#7e5a0e" strokeWidth="1.1" />
        <line x1="1" y1="27" x2="18" y2="27" stroke="#7e5a0e" strokeWidth="1.1" />
        <line x1="36" y1="13" x2="53" y2="13" stroke="#7e5a0e" strokeWidth="1.1" />
        <line x1="36" y1="27" x2="53" y2="27" stroke="#7e5a0e" strokeWidth="1.1" />
        <line x1="18" y1="1" x2="18" y2="39" stroke="#7e5a0e" strokeWidth="1.1" />
        <line x1="36" y1="1" x2="36" y2="39" stroke="#7e5a0e" strokeWidth="1.1" />
        <rect x="22" y="13" width="10" height="14" rx="2.5" fill="none" stroke="#7e5a0e" strokeWidth="1.1" />
      </svg>
      <span className="nfc-wave-icon" title="Contactless NFC Capable">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#164e2d" strokeWidth="2.5" strokeLinecap="round">
          <path d="M8 17a5 5 0 0 1 0-10" />
          <path d="M12 20a9 9 0 0 1 0-16" />
          <path d="M16 23a13 13 0 0 1 0-22" />
        </svg>
      </span>
    </div>
  );
}

function GuillocheBackground() {
  return (
    <svg className="card-guilloche-canvas" viewBox="0 0 600 380" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="guillochePattern" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 0 18 Q 9 0 18 18 T 36 18" fill="none" stroke="rgba(24, 95, 55, 0.07)" strokeWidth="0.8" />
          <path d="M 18 0 Q 0 9 18 18 T 18 36" fill="none" stroke="rgba(212, 175, 55, 0.08)" strokeWidth="0.8" />
          <circle cx="18" cy="18" r="12" fill="none" stroke="rgba(36, 101, 62, 0.04)" strokeWidth="0.5" strokeDasharray="2,2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#guillochePattern)" />
      <path d="M-20,240 C140,180 320,320 620,220 L620,380 L-20,380 Z" fill="rgba(34, 114, 69, 0.03)" />
      <path d="M-20,210 C150,290 350,170 620,260" fill="none" stroke="rgba(212, 175, 55, 0.22)" strokeWidth="1.2" />
      <path d="M-20,220 C160,300 360,180 620,270" fill="none" stroke="rgba(24, 95, 55, 0.16)" strokeWidth="0.9" />
      <path d="M-20,230 C170,310 370,190 620,280" fill="none" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="0.7" />
    </svg>
  );
}

function HologramSeal() {
  return (
    <div className="id-hologram-medallion" title="Official Holographic Security Medallion">
      <div className="hologram-shimmer">
        <span className="hologram-star">★</span>
        <span className="hologram-title">LIBERIA</span>
        <span className="hologram-code">DFR-SEC</span>
      </div>
    </div>
  );
}

function SecurityQrCode({ dfrId }: { dfrId: string }) {
  return (
    <div className="id-security-qr-block">
      <div className="security-qr-frame">
        <svg viewBox="0 0 100 100" className="qr-svg-matrix" width="84" height="84">
          <rect width="100" height="100" fill="#ffffff" rx="4" />
          <rect x="6" y="6" width="24" height="24" fill="#0d3b22" rx="3" />
          <rect x="10" y="10" width="16" height="16" fill="#ffffff" rx="2" />
          <rect x="13" y="13" width="10" height="10" fill="#0d3b22" rx="1.5" />
          <rect x="70" y="6" width="24" height="24" fill="#0d3b22" rx="3" />
          <rect x="74" y="10" width="16" height="16" fill="#ffffff" rx="2" />
          <rect x="77" y="13" width="10" height="10" fill="#0d3b22" rx="1.5" />
          <rect x="6" y="70" width="24" height="24" fill="#0d3b22" rx="3" />
          <rect x="10" y="74" width="16" height="16" fill="#ffffff" rx="2" />
          <rect x="13" y="77" width="10" height="10" fill="#0d3b22" rx="1.5" />
          <rect x="72" y="72" width="14" height="14" fill="#0d3b22" rx="2" />
          <rect x="74" y="74" width="10" height="10" fill="#ffffff" rx="1" />
          <rect x="76" y="76" width="6" height="6" fill="#0d3b22" rx="0.5" />
          <line x1="33" y1="18" x2="67" y2="18" stroke="#0d3b22" strokeWidth="2.5" strokeDasharray="3,3" />
          <line x1="18" y1="33" x2="18" y2="67" stroke="#0d3b22" strokeWidth="2.5" strokeDasharray="3,3" />
          <rect x="36" y="8" width="5" height="5" fill="#0d3b22" />
          <rect x="46" y="8" width="5" height="5" fill="#0d3b22" />
          <rect x="58" y="8" width="5" height="5" fill="#0d3b22" />
          <rect x="36" y="24" width="5" height="5" fill="#0d3b22" />
          <rect x="50" y="24" width="5" height="5" fill="#0d3b22" />
          <rect x="60" y="24" width="5" height="5" fill="#0d3b22" />
          <rect x="8" y="36" width="5" height="5" fill="#0d3b22" />
          <rect x="24" y="36" width="5" height="5" fill="#0d3b22" />
          <rect x="8" y="48" width="5" height="5" fill="#0d3b22" />
          <rect x="24" y="56" width="5" height="5" fill="#0d3b22" />
          <rect x="72" y="36" width="5" height="5" fill="#0d3b22" />
          <rect x="86" y="36" width="5" height="5" fill="#0d3b22" />
          <rect x="76" y="48" width="5" height="5" fill="#0d3b22" />
          <rect x="88" y="48" width="5" height="5" fill="#0d3b22" />
          <rect x="36" y="74" width="5" height="5" fill="#0d3b22" />
          <rect x="46" y="74" width="5" height="5" fill="#0d3b22" />
          <rect x="56" y="74" width="5" height="5" fill="#0d3b22" />
          <rect x="40" y="86" width="5" height="5" fill="#0d3b22" />
          <rect x="52" y="86" width="5" height="5" fill="#0d3b22" />
          <rect x="39" y="39" width="22" height="22" fill="#0b381e" rx="4" stroke="#d4af37" strokeWidth="1.5" />
          <text x="50" y="55" fontSize="13" textAnchor="middle" fill="#f8e79b" fontWeight="900" fontFamily="sans-serif">★</text>
        </svg>
      </div>
      <span className="qr-scan-label">SCAN TO VERIFY</span>
      <span className="qr-auth-url">dfr.moa.gov.lr</span>
    </div>
  );
}

export default function FarmerDossier({
  farmer: initialFarmer,
  initialTab = "Profile",
  onClose,
  onVerify,
  notify,
  onUpdate,
}: {
  farmer: FarmerRecord;
  initialTab?: string;
  onClose: () => void;
  onVerify: (id: number, status: string) => Promise<void>;
  notify: (msg: string) => void;
  onUpdate?: (updated: FarmerRecord) => void;
}) {
  const [farmer, setFarmer] = useState<FarmerRecord>(initialFarmer);
  const [tab, setTab] = useState(initialTab);
  const [cardSide, setCardSide] = useState<"front" | "back" | "both">("both");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(farmer.photoUrl || "");
  const [editForm, setEditForm] = useState({
    firstName: farmer.firstName,
    lastName: farmer.lastName,
    phone: farmer.phone,
    county: farmer.county,
    district: farmer.district,
    community: farmer.community,
    crop: farmer.crop,
    farmSize: farmer.farmSize,
    vulnerability: farmer.vulnerability,
    photoUrl: farmer.photoUrl || "",
  });

  // Local interactive activity states
  const [members, setMembers] = useState([
    { id: 1, name: `${farmer.lastName} Family Member 1`, relation: "Spouse", gender: farmer.gender === "Male" ? "Female" : "Male", age: 34, role: "Farm Manager" },
    { id: 2, name: `${farmer.lastName} Junior`, relation: "Child / Youth", gender: "Male", age: 19, role: "Field Labor" },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", relation: "Spouse", gender: "Female", age: 25, role: "Laborer" });

  const [vouchers, setVouchers] = useState([
    { id: 1, code: `VOUCH-${farmer.county.slice(0, 2).toUpperCase()}-2026-01`, programme: "FAO Rice & Food Security Initiative 2026", category: "Certified Seed & NPK Fertilizer", value: 175.0, currency: "USD", status: "Issued", expiresAt: "2026-11-30" },
    { id: 2, code: `VOUCH-${farmer.county.slice(0, 2).toUpperCase()}-2026-02`, programme: "MoA Smallholder Mechanization Grant", category: "Tillage & Power Tiller Service", value: 85.0, currency: "USD", status: farmer.status === "Verified" ? "Redeemed" : "Eligible", expiresAt: "2026-10-15" },
  ]);
  const [showAddVoucher, setShowAddVoucher] = useState(false);
  const [newVoucher, setNewVoucher] = useState({ programme: "Climate-Smart Agriculture Support 2026", category: "Tools & Equipment", value: "65.00", currency: "USD", expiresAt: "2026-12-31" });

  const [advisoryLogs, setAdvisoryLogs] = useState([
    { id: 1, date: "2026-08-20", officer: "J. Tamba (District Extension Officer)", type: "On-farm advisory", topic: "Integrated Pest Management & Drainage", observations: "Lowland plot shows good tillering. Water retention level is optimal.", advice: "Apply balanced NPK top dressing; monitor for leaf blast after heavy rains." },
    { id: 2, date: "2026-07-12", officer: "M. Kolleh (Senior Agronomist)", type: "Soil & Crop Inspection", topic: "Nursery Preparation & Row Spacing", observations: "Seedlings healthy. Prepared seedbed meets standard guidelines.", advice: "Maintain 20cm x 20cm row planting for improved yield." },
  ]);
  const [showAddAdvisory, setShowAddAdvisory] = useState(false);
  const [newAdvisory, setNewAdvisory] = useState({ officer: "District Extension Officer", type: "On-farm advisory", topic: "", observations: "", advice: "" });

  const isVerified = farmer.status === "Verified";
  const displayId = farmer.approvedDfrId || farmer.dfrId;
  const provId = farmer.provisionalId || `PROV-${farmer.county.slice(0, 2).toUpperCase()}-${String(farmer.id).padStart(6, "0")}`;

  const handleApprove = async () => {
    setBusy(true);
    try {
      await onVerify(farmer.id, "Verified");
      const prefix = farmer.county.slice(0, 2).toUpperCase();
      const approvedDfrId = farmer.approvedDfrId || `LBR-${prefix}-${String(farmer.id).padStart(6, "0")}`;
      const updated: FarmerRecord = {
        ...farmer,
        status: "Verified",
        approvedDfrId,
        dfrId: approvedDfrId,
      };
      setFarmer(updated);
      onUpdate?.(updated);
      notify(`Farmer ${farmer.firstName} ${farmer.lastName} approved! Official DFR ID: ${approvedDfrId}`);
    } catch {
      notify("Failed to verify record.");
    } finally {
      setBusy(false);
    }
  };

  const handleReturnCorrection = async () => {
    setBusy(true);
    try {
      await onVerify(farmer.id, "Needs correction");
      const updated: FarmerRecord = { ...farmer, status: "Needs correction" };
      setFarmer(updated);
      onUpdate?.(updated);
      notify(`Record returned for correction.`);
    } catch {
      notify("Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setEditForm((prev) => ({ ...prev, photoUrl: dataUrl }));
      setPhotoPreview(dataUrl);
      notify("Photo selected for upload. Click 'Save Changes' to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const updated: FarmerRecord = {
      ...farmer,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      county: editForm.county,
      district: editForm.district,
      community: editForm.community,
      crop: editForm.crop,
      farmSize: Number(editForm.farmSize),
      vulnerability: editForm.vulnerability,
      photoUrl: editForm.photoUrl,
    };
    try {
      await fetch(`/api/farmers/${farmer.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updated),
      });
      setFarmer(updated);
      onUpdate?.(updated);
      setEditing(false);
      notify("Farmer profile and official ID photo updated successfully.");
    } catch {
      setFarmer(updated);
      onUpdate?.(updated);
      setEditing(false);
      notify("Farmer profile updated locally.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddMemberSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newMember.name) return;
    setMembers([
      ...members,
      {
        id: Date.now(),
        name: newMember.name,
        relation: newMember.relation,
        gender: newMember.gender,
        age: Number(newMember.age) || 20,
        role: newMember.role,
      },
    ]);
    setNewMember({ name: "", relation: "Spouse", gender: "Female", age: 25, role: "Laborer" });
    setShowAddMember(false);
    notify("Household member linked to farmer record.");
  };

  const handleAddVoucherSubmit = (e: FormEvent) => {
    e.preventDefault();
    setVouchers([
      ...vouchers,
      {
        id: Date.now(),
        code: `VOUCH-${farmer.county.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        programme: newVoucher.programme,
        category: newVoucher.category,
        value: Number(newVoucher.value) || 50,
        currency: newVoucher.currency,
        status: "Issued",
        expiresAt: newVoucher.expiresAt,
      },
    ]);
    setShowAddVoucher(false);
    notify("Programme voucher allocated to farmer.");
  };

  const handleAddAdvisorySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newAdvisory.topic) return;
    setAdvisoryLogs([
      {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        officer: newAdvisory.officer || "Extension Officer",
        type: newAdvisory.type,
        topic: newAdvisory.topic,
        observations: newAdvisory.observations || "Field surveyed according to protocol.",
        advice: newAdvisory.advice || "Follow recommended agrochemical and fertilizer schedule.",
      },
      ...advisoryLogs,
    ]);
    setNewAdvisory({ officer: "District Extension Officer", type: "On-farm advisory", topic: "", observations: "", advice: "" });
    setShowAddAdvisory(false);
    notify("Extension advisory visit recorded.");
  };

  return (
    <div
      className="drawer-wrap farmer-dossier-wrap"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="delivery-drawer farmer-drawer glass">
        {/* Header */}
        <header className="farmer-dossier-head">
          <div className="farmer-dossier-info">
            <div
              className="farmer-avatar"
              onClick={() => setEditing(true)}
              title="Click to edit profile and upload photo"
              style={{ cursor: "pointer" }}
            >
              {farmer.photoUrl ? (
                <img
                  src={resolvePhotoUrl(farmer.photoUrl)}
                  alt={`${farmer.firstName} ${farmer.lastName}`}
                  className="farmer-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span>{farmer.firstName.charAt(0)}{farmer.lastName.charAt(0)}</span>
              )}
              {isVerified && <i className="verified-badge-icon" title="Officially Verified">✓</i>}
              <span className="avatar-camera-hint" title="Upload/change photo">📷</span>
            </div>
            <div>
              <span className="farmer-pretitle">Republic of Liberia · National Farmer Registry</span>
              <h2>{farmer.firstName} {farmer.lastName}</h2>
              <div className="farmer-id-badges">
                <code className="dfr-code">{displayId}</code>
                <small className="provisional-code">Provisional: {provId}</small>
                <span className={`status-pill ${farmer.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {farmer.status}
                </span>
              </div>
            </div>
          </div>
          <button className="close-drawer-btn" onClick={onClose} title="Close">×</button>
        </header>

        {/* Action Toolbar */}
        <div className="dossier-action-bar">
          {!isVerified ? (
            <>
              <button
                className="btn-action-primary approve"
                onClick={handleApprove}
                disabled={busy}
              >
                {busy ? "Processing Approval..." : "✓ Approve & Issue Official DFR ID"}
              </button>
              <button
                className="btn-action-secondary"
                onClick={handleReturnCorrection}
                disabled={busy}
              >
                ↺ Request Correction
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-action-primary credential-btn"
                onClick={() => setTab("Official ID & Certificate")}
              >
                🪪 View Official ID Card
              </button>
              <button
                className="btn-action-secondary"
                onClick={() => window.print()}
              >
                🖨️ Print Credential
              </button>
            </>
          )}
          <button
            className="btn-action-ghost"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel Editing" : "✎ Edit Profile"}
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="dossier-tabs-nav">
          {[
            "Profile",
            "Farm & Crops",
            "Supply Chain & Logistics",
            "Household & Labor",
            "Subsidies & Vouchers",
            "Extension & Advisory",
            "Official ID & Certificate",
            "Audit Trail",
          ].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Edit Modal Mode */}
        {editing && (
          <section className="dossier-section edit-section">
            <form onSubmit={handleSaveEdit}>
              <h3>Edit Farmer Profile</h3>

              <div className="photo-upload-box" style={{ background: "#f1f6ed", border: "1px dashed #b2cdb0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 88, height: 100, borderRadius: 10, background: "#e0ebe0", border: "2px solid #23653d", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                    {editForm.photoUrl ? (
                      <img src={resolvePhotoUrl(editForm.photoUrl)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 26, fontWeight: 800, color: "#23653d" }}>
                        {editForm.firstName.charAt(0)}{editForm.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <b style={{ display: "block", fontSize: 14, color: "#143e27", marginBottom: 4 }}>
                      Farmer Biometric Photo
                    </b>
                    <p style={{ fontSize: 12, color: "#5a7062", margin: "0 0 10px", lineHeight: 1.4 }}>
                      Upload an official passport-style portrait for the National Credential Card, registry account, and field verification.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <label className="btn-action-primary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, margin: 0, padding: "8px 14px", fontSize: 12 }}>
                        📷 Upload Photo from Device
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                      {editForm.photoUrl && (
                        <button
                          type="button"
                          className="btn-action-secondary"
                          onClick={() => {
                            setEditForm({ ...editForm, photoUrl: "" });
                            setPhotoPreview("");
                          }}
                          style={{ padding: "8px 12px", fontSize: 12, color: "#b91c1c", borderColor: "#fca5a5" }}
                        >
                          🗑️ Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, borderTop: "1px solid #dbe6d8", paddingTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <small style={{ fontSize: 11, color: "#607669", fontWeight: 600 }}>Quick sample photo presets:</small>
                  <button
                    type="button"
                    className="ghost sm"
                    onClick={() => {
                      const url = getAssetUrl("assets/cocoa-farmers.jpg");
                      setEditForm({ ...editForm, photoUrl: url });
                      setPhotoPreview(url);
                    }}
                    style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4 }}
                  >
                    Sample Cocoa Farmer
                  </button>
                  <button
                    type="button"
                    className="ghost sm"
                    onClick={() => {
                      const url = getAssetUrl("assets/rice-farmers.jpg");
                      setEditForm({ ...editForm, photoUrl: url });
                      setPhotoPreview(url);
                    }}
                    style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4 }}
                  >
                    Sample Rice Farmer
                  </button>
                  <button
                    type="button"
                    className="ghost sm"
                    onClick={() => {
                      const url = getAssetUrl("assets/enumerator.jpg");
                      setEditForm({ ...editForm, photoUrl: url });
                      setPhotoPreview(url);
                    }}
                    style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4 }}
                  >
                    Sample Field Officer
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  First Name
                  <input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Last Name
                  <input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </label>
                <label>
                  County
                  <input
                    value={editForm.county}
                    onChange={(e) => setEditForm({ ...editForm, county: e.target.value })}
                    required
                  />
                </label>
                <label>
                  District
                  <input
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Community
                  <input
                    value={editForm.community}
                    onChange={(e) => setEditForm({ ...editForm, community: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Primary Crop
                  <input
                    value={editForm.crop}
                    onChange={(e) => setEditForm({ ...editForm, crop: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Farm Size (hectares)
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.farmSize}
                    onChange={(e) => setEditForm({ ...editForm, farmSize: Number(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Vulnerability Classification
                  <input
                    value={editForm.vulnerability}
                    onChange={(e) => setEditForm({ ...editForm, vulnerability: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-actions" style={{ marginTop: 12 }}>
                <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="approve">Save Changes</button>
              </div>
            </form>
          </section>
        )}

        {/* Tab 1: Biographics & Identity */}
        {tab === "Profile" && (
          <div className="tab-body">
            <section className="dossier-section">
              <h3>National Identity & Civil Information</h3>
              <div className="profile-grid">
                <div>
                  <span>Full Legal Name</span>
                  <b>{farmer.firstName} {farmer.lastName}</b>
                </div>
                <div>
                  <span>Gender</span>
                  <b>{farmer.gender}</b>
                </div>
                <div>
                  <span>Registered Mobile Number</span>
                  <b>{farmer.phone}</b>
                </div>
                <div>
                  <span>National ID / NIR Status</span>
                  <b style={{ color: "#1e6b37" }}>✓ Verified & Linked to NIR Database</b>
                </div>
                <div>
                  <span>Inclusion / Vulnerability</span>
                  <b>{farmer.vulnerability}</b>
                </div>
                <div>
                  <span>Language / Literacy</span>
                  <b>Liberian English / Local Dialect · Functional</b>
                </div>
              </div>
            </section>

            <section className="dossier-section">
              <h3>Geographic Location & Administrative Hierarchy</h3>
              <div className="profile-grid">
                <div>
                  <span>County</span>
                  <b>{farmer.county} County</b>
                </div>
                <div>
                  <span>District</span>
                  <b>{farmer.district} District</b>
                </div>
                <div>
                  <span>Community / Village</span>
                  <b>{farmer.community}</b>
                </div>
                <div>
                  <span>GPS Coordinates</span>
                  <b>
                    {farmer.latitude ? `${farmer.latitude.toFixed(4)}° N, ${farmer.longitude?.toFixed(4)}° W` : "6.4218° N, -9.4285° W"}
                  </b>
                </div>
                <div>
                  <span>Geolocation Accuracy</span>
                  <b>High (±3.4 meters handheld RTK-assisted)</b>
                </div>
                <div>
                  <span>Elevation & Agrozone</span>
                  <b>145m ASL · High-Rainforest Agro-Ecological Zone</b>
                </div>
              </div>
            </section>

            <section className="dossier-section">
              <h3>Enumeration Provenance</h3>
              <div className="profile-grid">
                <div>
                  <span>Registered By</span>
                  <b>enumerator.{farmer.county.toLowerCase().slice(0, 4)}@moa.gov.lr</b>
                </div>
                <div>
                  <span>Enrollment Date</span>
                  <b>{farmer.createdAt || "2026-08-15 10:20:00"}</b>
                </div>
                <div>
                  <span>Consent Agreement</span>
                  <b>Signed Digital Attestation (Appendix 2 Compliant)</b>
                </div>
                <div>
                  <span>Device Verification</span>
                  <b>Encrypted Android Field Tablet #DFR-TAB-042</b>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Farm & Crops */}
        {tab === "Farm & Crops" && (
          <div className="tab-body">
            <section className="dossier-section">
              <h3>Agricultural Holding & Plot Metrics</h3>
              <div className="profile-grid">
                <div>
                  <span>Total Farm Holding Size</span>
                  <b style={{ fontSize: "1.1rem", color: "#165932" }}>{farmer.farmSize} hectares ({(farmer.farmSize * 2.471).toFixed(1)} acres)</b>
                </div>
                <div>
                  <span>Primary Agricultural Commodity</span>
                  <b>{farmer.crop}</b>
                </div>
                <div>
                  <span>Secondary Crops / Intercropping</span>
                  <b>Plantain, Cassava, Hot Pepper, Bitter Ball</b>
                </div>
                <div>
                  <span>Land Tenure / Property Rights</span>
                  <b>Customary Land Ownership (Endorsed by Clan Chief & Land Commission)</b>
                </div>
                <div>
                  <span>Farming System</span>
                  <b>Smallholder Rainfed & Lowland Swampland</b>
                </div>
                <div>
                  <span>Soil Classification</span>
                  <b>Humic Latosols (High organic fertility, well-drained)</b>
                </div>
              </div>
            </section>

            <section className="dossier-section">
              <h3>Livestock & Aquaculture Holdings</h3>
              <div className="profile-grid">
                <div>
                  <span>Small Ruminants (Goats & Sheep)</span>
                  <b>6 heads (Confined shelter system)</b>
                </div>
                <div>
                  <span>Poultry</span>
                  <b>24 local free-range birds</b>
                </div>
                <div>
                  <span>Aquaculture / Fish Ponds</span>
                  <b>None recorded (Eligible for aquaculture extension)</b>
                </div>
                <div>
                  <span>Annual Estimated Production</span>
                  <b>{(farmer.farmSize * 1.8).toFixed(1)} Metric Tons (Estimated seasonal output)</b>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 3: Supply Chain & Logistics */}
        {tab === "Supply Chain & Logistics" && (
          <div className="tab-body">
            <section className="dossier-section">
              <h3>Road Network & Farm-to-Market Access</h3>
              <div className="profile-grid">
                <div>
                  <span>Road Classification</span>
                  <b>{farmer.roadAccess || "Motorable dirt feeder road"}</b>
                </div>
                <div>
                  <span>Road Condition</span>
                  <b>{farmer.roadCondition || "Fair (Graded post-rainy season)"}</b>
                </div>
                <div>
                  <span>Road Seasonality</span>
                  <b>{farmer.roadSeasonality || "Year-round vehicular access"}</b>
                </div>
                <div>
                  <span>Distance to Primary Highway</span>
                  <b>{farmer.roadDistanceMiles || 1.2} miles ({((farmer.roadDistanceMiles || 1.2) * 1.609).toFixed(1)} km)</b>
                </div>
              </div>
            </section>

            <section className="dossier-section">
              <h3>Post-Harvest & Agro-Processing Access</h3>
              <div className="profile-grid">
                <div>
                  <span>Processing Access Option</span>
                  <b>{farmer.processingAccess || "Community cooperative aggregation center"}</b>
                </div>
                <div>
                  <span>Facility Name</span>
                  <b>{farmer.processingFacilityName || `${farmer.county} Agro Hub`}</b>
                </div>
                <div>
                  <span>Facility Type</span>
                  <b>{farmer.processingFacilityType || "Solar dryer, fermentary & mechanical thresher"}</b>
                </div>
                <div>
                  <span>Operating Status</span>
                  <b style={{ color: "#1e6b37" }}>{farmer.processingFacilityStatus || "Operational"}</b>
                </div>
                <div>
                  <span>Distance to Facility</span>
                  <b>{farmer.processingDistanceMiles || 2.5} miles</b>
                </div>
                <div>
                  <span>Travel Time & Transport Mode</span>
                  <b>{farmer.processingTravelMinutes || 20} mins by {farmer.processingTransportMode || "Motorbike"}</b>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 4: Household & Labor */}
        {tab === "Household & Labor" && (
          <div className="tab-body">
            <section className="dossier-section">
              <div className="section-head-between">
                <div>
                  <h3>Household Composition & Agricultural Labor</h3>
                  <p>Family members, dependents, and linked agricultural laborers</p>
                </div>
                <button
                  className="btn-action-primary"
                  onClick={() => setShowAddMember(true)}
                >
                  ＋ Link Household Member
                </button>
              </div>

              {showAddMember && (
                <form className="mini-modal glass" onSubmit={handleAddMemberSubmit} style={{ margin: "14px 0", padding: 14 }}>
                  <h4>Link New Household Member</h4>
                  <div className="form-grid">
                    <label>
                      Full Name*
                      <input
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="e.g. Marie Flomo"
                        required
                      />
                    </label>
                    <label>
                      Relationship*
                      <select
                        value={newMember.relation}
                        onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                      >
                        <option>Spouse</option>
                        <option>Child / Youth</option>
                        <option>Parent / Elderly</option>
                        <option>Sibling</option>
                        <option>Permanent Laborer</option>
                      </select>
                    </label>
                    <label>
                      Gender
                      <select
                        value={newMember.gender}
                        onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                      >
                        <option>Female</option>
                        <option>Male</option>
                      </select>
                    </label>
                    <label>
                      Age
                      <input
                        type="number"
                        value={newMember.age}
                        onChange={(e) => setNewMember({ ...newMember, age: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Farm Role
                      <input
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        placeholder="e.g. Weeding, harvesting"
                      />
                    </label>
                  </div>
                  <div className="modal-actions" style={{ marginTop: 10 }}>
                    <button type="button" onClick={() => setShowAddMember(false)}>Cancel</button>
                    <button type="submit" className="approve">Link Member →</button>
                  </div>
                </form>
              )}

              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relationship</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Agricultural Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td><b>{m.name}</b></td>
                        <td>{m.relation}</td>
                        <td>{m.gender}</td>
                        <td>{m.age} yrs</td>
                        <td><span className="role-tag">{m.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Tab 5: Subsidies & Vouchers */}
        {tab === "Subsidies & Vouchers" && (
          <div className="tab-body">
            <section className="dossier-section">
              <div className="section-head-between">
                <div>
                  <h3>Allocated Vouchers & Programme Subsidies</h3>
                  <p>Digital entitlements, seed allocations, and mechanized service vouchers</p>
                </div>
                <button
                  className="btn-action-primary"
                  onClick={() => setShowAddVoucher(true)}
                >
                  ＋ Allocate Programme Voucher
                </button>
              </div>

              {showAddVoucher && (
                <form className="mini-modal glass" onSubmit={handleAddVoucherSubmit} style={{ margin: "14px 0", padding: 14 }}>
                  <h4>Allocate New Programme Voucher</h4>
                  <div className="form-grid">
                    <label>
                      Programme Title*
                      <input
                        value={newVoucher.programme}
                        onChange={(e) => setNewVoucher({ ...newVoucher, programme: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Entitlement Category*
                      <select
                        value={newVoucher.category}
                        onChange={(e) => setNewVoucher({ ...newVoucher, category: e.target.value })}
                      >
                        <option>Certified Seed & Fertilizer</option>
                        <option>Tools & Equipment</option>
                        <option>Mechanized Tillage & Power Tiller</option>
                        <option>Crop Protection & Pest Control</option>
                        <option>Post-Harvest Solar Drying Kit</option>
                      </select>
                    </label>
                    <label>
                      Voucher Value ($)*
                      <input
                        type="number"
                        step="0.01"
                        value={newVoucher.value}
                        onChange={(e) => setNewVoucher({ ...newVoucher, value: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Expiry Date*
                      <input
                        type="date"
                        value={newVoucher.expiresAt}
                        onChange={(e) => setNewVoucher({ ...newVoucher, expiresAt: e.target.value })}
                        required
                      />
                    </label>
                  </div>
                  <div className="modal-actions" style={{ marginTop: 10 }}>
                    <button type="button" onClick={() => setShowAddVoucher(false)}>Cancel</button>
                    <button type="submit" className="approve">Issue Voucher →</button>
                  </div>
                </form>
              )}

              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Voucher Code</th>
                      <th>Programme</th>
                      <th>Category</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((v) => (
                      <tr key={v.id}>
                        <td><code>{v.code}</code></td>
                        <td><b>{v.programme}</b></td>
                        <td>{v.category}</td>
                        <td><b>{v.currency} {Number(v.value).toFixed(2)}</b></td>
                        <td>
                          <span className={`status-pill ${v.status.toLowerCase()}`}>
                            {v.status}
                          </span>
                        </td>
                        <td>{v.expiresAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="dossier-section">
              <h3>Registered Mobile Money Payout Account</h3>
              <div className="profile-grid">
                <div>
                  <span>Payment Provider</span>
                  <b>Lonestar Cell MTN Mobile Money</b>
                </div>
                <div>
                  <span>Account Status</span>
                  <b style={{ color: "#1e6b37" }}>✓ Biometrically Verified & Active</b>
                </div>
                <div>
                  <span>Masked Account Number</span>
                  <b>+231 88 •••• 923</b>
                </div>
                <div>
                  <span>Direct Transfer Capability</span>
                  <b>Enabled (Instant automated disbursement)</b>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 6: Extension & Advisory */}
        {tab === "Extension & Advisory" && (
          <div className="tab-body">
            <section className="dossier-section">
              <div className="section-head-between">
                <div>
                  <h3>Agronomic Advisory & Extension History</h3>
                  <p>Attributable on-farm visits, soil observations, and pest surveillance</p>
                </div>
                <button
                  className="btn-action-primary"
                  onClick={() => setShowAddAdvisory(true)}
                >
                  ＋ Log Extension Advisory Activity
                </button>
              </div>

              {showAddAdvisory && (
                <form className="mini-modal glass" onSubmit={handleAddAdvisorySubmit} style={{ margin: "14px 0", padding: 14 }}>
                  <h4>Record Field Advisory Visit</h4>
                  <div className="form-grid">
                    <label>
                      Extension Officer Name*
                      <input
                        value={newAdvisory.officer}
                        onChange={(e) => setNewAdvisory({ ...newAdvisory, officer: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Visit Type*
                      <select
                        value={newAdvisory.type}
                        onChange={(e) => setNewAdvisory({ ...newAdvisory, type: e.target.value })}
                      >
                        <option>On-farm advisory</option>
                        <option>Pest & Disease Surveillance</option>
                        <option>Soil Fertility Assessment</option>
                        <option>Farmer Field School Demo</option>
                        <option>Harvest & Post-Harvest Inspection</option>
                      </select>
                    </label>
                    <label className="wide">
                      Advisory Topic / Purpose*
                      <input
                        value={newAdvisory.topic}
                        onChange={(e) => setNewAdvisory({ ...newAdvisory, topic: e.target.value })}
                        placeholder="e.g. Cocoa tree pruning and capsid bug management"
                        required
                      />
                    </label>
                    <label className="wide">
                      Field Observations
                      <textarea
                        value={newAdvisory.observations}
                        onChange={(e) => setNewAdvisory({ ...newAdvisory, observations: e.target.value })}
                        placeholder="Describe observations on crop health, soil moisture, weeds..."
                      />
                    </label>
                    <label className="wide">
                      Official Technical Advice Given
                      <textarea
                        value={newAdvisory.advice}
                        onChange={(e) => setNewAdvisory({ ...newAdvisory, advice: e.target.value })}
                        placeholder="Specific recommendations given to the farmer..."
                      />
                    </label>
                  </div>
                  <div className="modal-actions" style={{ marginTop: 10 }}>
                    <button type="button" onClick={() => setShowAddAdvisory(false)}>Cancel</button>
                    <button type="submit" className="approve">Save Advisory Log →</button>
                  </div>
                </form>
              )}

              <div className="advisory-log-list" style={{ marginTop: 14 }}>
                {advisoryLogs.map((log) => (
                  <article key={log.id} className="advisory-card panel">
                    <div className="advisory-card-top">
                      <div>
                        <b>{log.topic}</b>
                        <small>{log.type} · {log.date} · {log.officer}</small>
                      </div>
                      <span className="status-pill verified">Completed</span>
                    </div>
                    <div className="advisory-content">
                      <p><b>Observations:</b> {log.observations}</p>
                      <p><b>Official Advice:</b> {log.advice}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab 7: Official DFR ID Card & Certificate */}
        {tab === "Official ID & Certificate" && (
          <div className="tab-body">
            <section className="dossier-section credential-preview-section">
              <div className="section-head-between">
                <div>
                  <h3>National Farmer Registry Biometric Credential</h3>
                  <p>Official high-security biometric smart identity card issued under the authority of the Ministry of Agriculture, Republic of Liberia</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div className="id-card-view-pills">
                    <button
                      type="button"
                      className={`id-view-btn ${cardSide === "front" ? "active" : ""}`}
                      onClick={() => setCardSide("front")}
                      title="View front of ID card"
                    >
                      🪪 Front Side
                    </button>
                    <button
                      type="button"
                      className={`id-view-btn ${cardSide === "back" ? "active" : ""}`}
                      onClick={() => setCardSide("back")}
                      title="View back of ID card"
                    >
                      🔄 Back Side
                    </button>
                    <button
                      type="button"
                      className={`id-view-btn ${cardSide === "both" ? "active" : ""}`}
                      onClick={() => setCardSide("both")}
                      title="View both front and back"
                    >
                      📑 Both Sides
                    </button>
                  </div>
                  <button className="btn-action-primary" onClick={() => window.print()}>
                    🖨️ Print Credential (CR80)
                  </button>
                  <button
                    className="btn-action-secondary"
                    onClick={() => {
                      const cardData = `REPUBLIC OF LIBERIA - MINISTRY OF AGRICULTURE\nDIGITAL FARMER REGISTRY (DFR) - OFFICIAL BIOMETRIC CREDENTIAL\n=============================================================\nFarmer Name:        ${farmer.firstName.toUpperCase()} ${farmer.lastName.toUpperCase()}\nOfficial DFR ID:    ${displayId}\nProvisional ID:     ${provId}\nCounty / District:  ${farmer.county} / ${farmer.district}\nCommunity:          ${farmer.community}\nPrimary Commodity:  ${farmer.crop}\nHolding Capacity:   ${farmer.farmSize} Hectares\nGender:             ${farmer.gender}\nRegistration Status:${farmer.status} (Verified)\nIssuance Date:      12 August 2026\nExpiration Date:    11 August 2031\nSmart Chip ID:      LBR-SMART-BIO-${String(farmer.id).padStart(6, "0")}\nBiometric SHA-256:  8F7E4B29A${String(farmer.id).padStart(4, "0")}C71E44910BD3A188C02F5290\nIssuing Authority:  Ministry of Agriculture, Republic of Liberia\nVerification URL:   https://dfr.moa.gov.lr/verify?id=${displayId}\n=============================================================`;
                      const blob = new Blob([cardData], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `DFR-Official-Credential-${displayId}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      notify("Official credential verification slip downloaded.");
                    }}
                  >
                    📥 Download ID Slip
                  </button>
                </div>
              </div>

              {/* Physical/Printable Farmer Card Container */}
              <div className="modern-id-cards-container" id="printable-farmer-card">
                {/* FRONT OF CARD */}
                {(cardSide === "front" || cardSide === "both") && (
                  <div className="modern-smart-card card-front-face">
                    <GuillocheBackground />

                    {/* Watermark Coat of Arms */}
                    <img
                      src={getAssetUrl("assets/liberia-seal.png")}
                      alt=""
                      className="id-card-watermark-seal"
                      aria-hidden="true"
                    />

                    {/* Top Security Banner */}
                    <div className="modern-card-header">
                      <div className="header-seal-round">
                        <img
                          src={getAssetUrl("assets/liberia-seal.png")}
                          alt="Liberia Coat of Arms"
                          className="hdr-seal-img"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.triedFallback) {
                              target.dataset.triedFallback = "true";
                              target.src = "/assets/liberia-seal.png";
                            }
                          }}
                        />
                      </div>
                      <div className="header-center-titles">
                        <span className="hdr-republic-text">REPUBLIC OF LIBERIA</span>
                        <h4 className="hdr-ministry-text">MINISTRY OF AGRICULTURE</h4>
                        <div className="hdr-credential-pill">
                          <span>NATIONAL DIGITAL FARMER REGISTRY · BIOMETRIC CREDENTIAL</span>
                        </div>
                      </div>
                      <div className="header-seal-round">
                        <img
                          src={getAssetUrl("assets/moa-logo.png")}
                          alt="Ministry of Agriculture"
                          className="hdr-moa-img"
                          title="Ministry of Agriculture, Republic of Liberia"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.triedFallback) {
                              target.dataset.triedFallback = "true";
                              target.src = "/assets/moa-logo.png";
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Card Body Columns */}
                    <div className="modern-card-body">
                      {/* Left: Photo + Smart Chip + Biometric indicator */}
                      <div className="modern-card-left-col">
                        <div className="modern-photo-wrapper">
                          <div className="modern-photo-inner">
                            {farmer.photoUrl ? (
                              <img
                                src={resolvePhotoUrl(farmer.photoUrl)}
                                alt={`${farmer.firstName} ${farmer.lastName}`}
                                className="modern-farmer-portrait"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="modern-initials-fallback">
                                <span>{farmer.firstName.charAt(0)}{farmer.lastName.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <span className="photo-gold-corner corner-tl" />
                          <span className="photo-gold-corner corner-tr" />
                          <span className="photo-gold-corner corner-bl" />
                          <span className="photo-gold-corner corner-br" />
                        </div>

                        {/* Gold EMV Chip & NFC */}
                        <div className="chip-and-biometric-row">
                          <SmartChip />
                        </div>
                        <div className="modern-biometric-badge">
                          <span className="bio-live-beacon" />
                          <span>BIOMETRIC CHIP · NFC</span>
                        </div>
                      </div>

                      {/* Middle: Identification & Details */}
                      <div className="modern-card-center-col">
                        <div className="modern-id-pill-banner">
                          <div className="id-pill-label">NATIONAL DFR REGISTRATION NO.</div>
                          <div className="id-pill-number">{displayId}</div>
                        </div>

                        <div className="farmer-name-banner">
                          <small>FARMER FULL LEGAL NAME</small>
                          <h3>{farmer.firstName.toUpperCase()} {farmer.lastName.toUpperCase()}</h3>
                        </div>

                        <div className="modern-specs-grid">
                          <div className="spec-cell">
                            <span className="spec-lbl">COUNTY / DISTRICT</span>
                            <strong className="spec-val">{farmer.county} / {farmer.district}</strong>
                          </div>
                          <div className="spec-cell">
                            <span className="spec-lbl">GENDER</span>
                            <strong className="spec-val">{farmer.gender}</strong>
                          </div>
                          <div className="spec-cell">
                            <span className="spec-lbl">PRIMARY COMMODITY</span>
                            <strong className="spec-val crop-highlight">{farmer.crop}</strong>
                          </div>
                          <div className="spec-cell">
                            <span className="spec-lbl">HOLDING CAPACITY</span>
                            <strong className="spec-val">{farmer.farmSize} Hectares</strong>
                          </div>
                          <div className="spec-cell">
                            <span className="spec-lbl">DATE OF ISSUE</span>
                            <strong className="spec-val date-val">12 AUG 2026</strong>
                          </div>
                          <div className="spec-cell">
                            <span className="spec-lbl">VALID UNTIL</span>
                            <strong className="spec-val date-val">11 AUG 2031 (5 YRS)</strong>
                          </div>
                        </div>

                        <div className="modern-verified-ribbon">
                          <span className="verified-check-shield">✓</span>
                          <span>OFFICIALLY VERIFIED & ENROLLED IN MOA CADASTRE</span>
                        </div>
                      </div>

                      {/* Right: Security Hologram + Scannable QR Code */}
                      <div className="modern-card-right-col">
                        <HologramSeal />
                        <SecurityQrCode dfrId={displayId} />
                      </div>
                    </div>

                    {/* Bottom Micro-Text Border */}
                    <div className="modern-card-bottom-bar">
                      <span className="micro-security-text">
                        REPUBLIC OF LIBERIA • MINISTRY OF AGRICULTURE • OFFICIAL BIOMETRIC CREDENTIAL • ECOWAS COMPLIANT
                      </span>
                      <span className="card-crypto-serial">
                        CHIP-SN: LBR-EMV-{String(farmer.id).padStart(6, "0")}
                      </span>
                    </div>
                  </div>
                )}

                {/* BACK OF CARD */}
                {(cardSide === "back" || cardSide === "both") && (
                  <div className="modern-smart-card card-back-face">
                    <GuillocheBackground />

                    {/* Watermark Coat of Arms */}
                    <img
                      src={getAssetUrl("assets/liberia-seal.png")}
                      alt=""
                      className="id-card-watermark-seal"
                      aria-hidden="true"
                    />

                    {/* Magnetic / Optical Stripe */}
                    <div className="magstripe-header">
                      <div className="magstripe-track">
                        <span className="magstripe-thread" />
                        <span className="magstripe-thread thread-2" />
                      </div>
                      <div className="magstripe-holo-indicator">
                        <span>LBR-DFR-2026</span>
                      </div>
                    </div>

                    {/* Card Back Main Content */}
                    <div className="card-back-content">
                      <div className="back-notice-box">
                        <p>
                          This credential is the official biometric property of the Republic of Liberia, issued by the Ministry of Agriculture under the National Digital Farmer Registry Executive Framework. It provides verifiable qualification for agricultural input subsidies, extension advisory, and cadastre parcel recognition.
                        </p>
                        <p className="sub-notice">
                          If found, please return to any County Agricultural Office (CAO) or CARI Central Research Complex, Suakoko, Bong County, Liberia.
                        </p>
                      </div>

                      {/* Contact & Verification Hotlines */}
                      <div className="back-hotline-row">
                        <div>
                          <small>REGISTRY HELPDESK</small>
                          <b>+231 77 000 DFR1 (3371)</b>
                        </div>
                        <div>
                          <small>OFFICIAL PORTAL</small>
                          <b>dfr.moa.gov.lr</b>
                        </div>
                        <div>
                          <small>SMS LOOKUP</small>
                          <b>Text DFR {displayId} to 4040</b>
                        </div>
                      </div>

                      {/* Signatures & Biometric Hash Row */}
                      <div className="back-signatures-grid">
                        <div className="signature-box">
                          <div className="sign-pen-script minister-sig">J. Alexander Nuetah</div>
                          <div className="sign-divider" />
                          <small>HON. MINISTER OF AGRICULTURE</small>
                          <span className="sign-auth-label">ISSUING AUTHORITY</span>
                        </div>
                        <div className="signature-box">
                          <div className="sign-pen-script farmer-sig">
                            {farmer.firstName} {farmer.lastName}
                          </div>
                          <div className="sign-divider" />
                          <small>CARDHOLDER SIGNATURE</small>
                          <span className="sign-auth-label">VERIFIED HOLDER</span>
                        </div>
                        <div className="back-bio-seal">
                          <div className="gold-stamp-circle">
                            <span className="stamp-star">★</span>
                            <span className="stamp-text">MOA</span>
                            <span className="stamp-text-sub">SEAL</span>
                          </div>
                        </div>
                      </div>

                      {/* Cryptographic SHA-256 Hash Row */}
                      <div className="back-crypto-hash-bar">
                        <span className="hash-code">
                          SHA256: 8F7E4B29A{String(farmer.id).padStart(4, "0")}C71E44910BD3A188C02F5290
                        </span>
                        <span className="prov-ref">PROV: {provId}</span>
                      </div>

                      {/* Machine Readable Zone (MRZ TD1 format - 3 lines) */}
                      <div className="back-mrz-box">
                        <div className="mrz-line">
                          {`I<LBR${String(farmer.id).padStart(6, "0")}8<<<<<<<<<<<<<<<<<<`}
                        </div>
                        <div className="mrz-line">
                          {`2608124${farmer.gender === "Female" ? "F" : "M"}3108115LBR<<<<<<<<<<<8`}
                        </div>
                        <div className="mrz-line">
                          {`${(farmer.lastName.toUpperCase() + "<<" + farmer.firstName.toUpperCase() + "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<").slice(0, 30)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Tab 8: Audit Trail */}
        {tab === "Audit Trail" && (
          <div className="tab-body">
            <section className="dossier-section">
              <h3>Immutable Registration & Verification Audit Trail</h3>
              <div className="audit-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot success" />
                  <div className="timeline-content">
                    <b>Official DFR ID Issued</b>
                    <small>{farmer.status === "Verified" ? "Approved and signed by Verification Officer" : "Pending final approval decision"}</small>
                    <span>Attributed Actor: verification.officer@moa.gov.lr</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot success" />
                  <div className="timeline-content">
                    <b>Identity & Duplicate Screening Passed</b>
                    <small>Biometric & biographic deduplication index returned 0 risk conflicts</small>
                    <span>System: Automated Deduplication Engine</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot success" />
                  <div className="timeline-content">
                    <b>Geotagged Parcel & Field Capture Recorded</b>
                    <small>Handheld boundary coordinates authenticated at community level</small>
                    <span>Coordinates: {farmer.latitude || 6.42}°, {farmer.longitude || -9.43}°</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot success" />
                  <div className="timeline-content">
                    <b>Field Enumeration Record Created</b>
                    <small>Initial farmer registration collected via mobile field tablet</small>
                    <span>Enumerator ID: ENUM-{farmer.county.slice(0, 2).toUpperCase()}-482</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
