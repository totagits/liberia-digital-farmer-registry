"use client";

import { FormEvent, useState } from "react";

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
  createdAt?: string;
};

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
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
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

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
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
    };
    setFarmer(updated);
    onUpdate?.(updated);
    setEditing(false);
    notify("Farmer profile updated successfully.");
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
            <div className="farmer-avatar">
              <span>{farmer.firstName.charAt(0)}{farmer.lastName.charAt(0)}</span>
              {isVerified && <i className="verified-badge-icon" title="Officially Verified">✓</i>}
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
                  <h3>National Farmer Registry Credential</h3>
                  <p>Official verifiable digital identity card issued under the authority of the Ministry of Agriculture</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-action-primary" onClick={() => window.print()}>
                    🖨️ Print Credential
                  </button>
                  <button
                    className="btn-action-secondary"
                    onClick={() => {
                      const cardData = `REPUBLIC OF LIBERIA - MINISTRY OF AGRICULTURE\nDIGITAL FARMER REGISTRY CREDENTIAL\nFarmer: ${farmer.firstName} ${farmer.lastName}\nDFR ID: ${displayId}\nProvisional: ${provId}\nCounty: ${farmer.county}\nDistrict: ${farmer.district}\nPrimary Crop: ${farmer.crop}\nFarm Size: ${farmer.farmSize} ha\nStatus: ${farmer.status}\nVerification Hash: ${btoa(displayId + farmer.phone)}`;
                      const blob = new Blob([cardData], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `DFR-Certificate-${displayId}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      notify("Certificate data file downloaded.");
                    }}
                  >
                    📥 Download Certificate Slip
                  </button>
                </div>
              </div>

              {/* Physical/Printable Farmer Card Component */}
              <div className="farmer-card-wrapper" id="printable-farmer-card">
                <div className="farmer-card-front glass">
                  <div className="card-top-header">
                    <div className="liberia-crest">
                      <span>🇱🇷</span>
                    </div>
                    <div className="card-titles">
                      <h4>REPUBLIC OF LIBERIA</h4>
                      <h5>MINISTRY OF AGRICULTURE</h5>
                      <span className="card-system-name">DIGITAL FARMER REGISTRY · OFFICIAL CREDENTIAL</span>
                    </div>
                    <div className="card-gov-seal">
                      <span>★ MOA ★</span>
                    </div>
                  </div>

                  <div className="card-body-grid">
                    <div className="card-photo-box">
                      <div className="photo-placeholder">
                        <span>{farmer.firstName.charAt(0)}{farmer.lastName.charAt(0)}</span>
                      </div>
                      <span className="biometric-tag">BIOMETRIC ENROLLED</span>
                    </div>

                    <div className="card-details-fields">
                      <div className="card-field-row">
                        <small>OFFICIAL DFR ID</small>
                        <strong className="card-dfr-id">{displayId}</strong>
                      </div>
                      <div className="card-field-row">
                        <small>FULL NAME</small>
                        <strong>{farmer.firstName.toUpperCase()} {farmer.lastName.toUpperCase()}</strong>
                      </div>
                      <div className="card-grid-2col">
                        <div>
                          <small>COUNTY / DISTRICT</small>
                          <span>{farmer.county} / {farmer.district}</span>
                        </div>
                        <div>
                          <small>GENDER</small>
                          <span>{farmer.gender}</span>
                        </div>
                      </div>
                      <div className="card-grid-2col">
                        <div>
                          <small>PRIMARY COMMODITY</small>
                          <span>{farmer.crop}</span>
                        </div>
                        <div>
                          <small>HOLDING SIZE</small>
                          <span>{farmer.farmSize} Hectares</span>
                        </div>
                      </div>
                      <div className="card-field-row">
                        <small>VERIFICATION STATUS</small>
                        <span className={`status-badge-inline ${farmer.status.toLowerCase().replace(/\s+/g, "-")}`}>
                          {farmer.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="card-qr-box">
                      <div className="mock-qr-code">
                        <div className="qr-inner">
                          <div className="qr-block qb1" />
                          <div className="qr-block qb2" />
                          <div className="qr-block qb3" />
                          <div className="qr-barcode-lines">
                            <span /><span /><span /><span /><span />
                          </div>
                        </div>
                      </div>
                      <small className="qr-verify-text">Scan to Verify Registry Authenticity</small>
                    </div>
                  </div>

                  <div className="card-bottom-footer">
                    <span>Issued under DFR Executive Framework · Authority of the Ministry of Agriculture, Liberia</span>
                    <span className="security-code">SEC-HASH: {displayId.slice(-6)}-2026-REG</span>
                  </div>
                </div>
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
