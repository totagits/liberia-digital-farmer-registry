"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";

const LIBERIA_COUNTIES = [
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

const PREFERRED_LANGUAGES = [
  "English",
  "English / Kpelle",
  "English / Bassa",
  "English / Mano",
  "English / Gio (Dan)",
  "English / Loma",
  "English / Kru",
  "English / Grebo",
  "English / Vai",
];

interface AccountProfileModalProps {
  user: {
    name: string;
    email: string;
    photoUrl?: string;
    phone?: string;
    county?: string;
    district?: string;
    language?: string;
    bio?: string;
    nin?: string;
    id?: string;
  };
  role: string;
  onClose: () => void;
  onSave: (updated: {
    name: string;
    email: string;
    photoUrl?: string;
    phone?: string;
    county?: string;
    district?: string;
    language?: string;
    bio?: string;
  }) => void;
}

export default function AccountProfileModal({
  user,
  role,
  onClose,
  onSave,
}: AccountProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "+231 770 449 102");
  const [county, setCounty] = useState(user.county || (role === "Farmer" ? "Nimba" : "National"));
  const [district, setDistrict] = useState(user.district || (role === "Farmer" ? "Sanniquellie-Mahn" : "Central District"));
  const [language, setLanguage] = useState(user.language || (role === "Farmer" ? "English / Kpelle" : "English"));
  const [bio, setBio] = useState(
    user.bio ||
      (role === "Farmer"
        ? "Smallholder cocoa and lowland rice producer in Sanniquellie-Mahn. Registered beneficiary for national input e-vouchers."
        : "Official account on the Liberia Digital Farmer Registry platform.")
  );
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user.photoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size exceeds 5MB. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setPhotoUrl(result);
      }
    };
    reader.onerror = () => {
      setPhotoError("Failed to read image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onSave({
        name: name.trim() || user.name,
        email: email.trim() || user.email,
        phone: phone.trim(),
        county,
        district: district.trim(),
        language,
        bio: bio.trim(),
        photoUrl: photoUrl || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = (name || "User")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="modal-wrap account-profile-overlay"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <form
        className="account-profile-dialog"
        onSubmit={handleSubmit}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            flexShrink: 0,
            background: "#0e3120",
            color: "#ffffff",
            padding: "16px 24px",
            borderBottom: "4px solid #22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                color: "#86efac",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              ♢ &nbsp; NATIONAL DIGITAL FARMER REGISTRY — ACCOUNT SETTINGS
            </span>
            <h2 style={{ margin: "4px 0 2px", fontSize: "1.45rem", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
              My Account &amp; Profile Information
            </h2>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.8rem" }}>
              Update your contact details, mobile money number for input subsidies, and personal biometric profile photo.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span
              style={{
                background: "#166534",
                border: "1px solid #4ade80",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {role}
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: "#22c55e",
                color: "#052e16",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Save all changes"
            >
              {isSubmitting ? "Saving…" : "💾 Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "none",
                color: "#ffffff",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                fontSize: "18px",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              ×
            </button>
          </div>
        </header>

        <main style={{ padding: "22px 24px", flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
            {/* SECTION 1: PROFILE PHOTO / BIOMETRIC AVATAR */}
            <section
              style={{
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "22px",
                display: "flex",
                gap: "24px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative" }}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    style={{
                      width: "92px",
                      height: "92px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #22c55e",
                      boxShadow: "0 4px 14px rgba(22, 101, 52, 0.2)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "92px",
                      height: "92px",
                      borderRadius: "50%",
                      background: "#ddebcd",
                      color: "#166534",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "2rem",
                      fontWeight: 800,
                      border: "3px solid #bbf7d0",
                    }}
                  >
                    {initials}
                  </div>
                )}
                {photoUrl && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "#22c55e",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      fontSize: "12px",
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid #ffffff",
                    }}
                    title="Photo verified"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: "240px" }}>
                <b style={{ display: "block", fontSize: "1.05rem", color: "#0f172a", marginBottom: "4px" }}>
                  Account Profile Photo
                </b>
                <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "#475569", lineHeight: 1.4 }}>
                  Upload a clear facial portrait. This photo is displayed in your platform header, used for field extension officer verification visits, and verified during agro-dealer input distributions.
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "#166534",
                      color: "#ffffff",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    📷 Upload New Photo
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        background: "#fff",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {photoError && (
                  <span style={{ display: "block", color: "#ef4444", fontSize: "0.78rem", marginTop: "6px" }}>
                    {photoError}
                  </span>
                )}
              </div>
            </section>

            {/* SECTION 2: EDITABLE USER INFORMATION */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: "1.05rem",
                  color: "#0f172a",
                  fontFamily: "Georgia, serif",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                Personal &amp; Contact Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  Full Legal Name*
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kollie Flomo"
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  Contact Phone Number (Mobile Money / SMS)*
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+231 770 449 102"
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                  <small style={{ fontWeight: 400, color: "#64748b", fontSize: "0.74rem" }}>
                    Used for SMS one-time OTP vouchers and Mobile Money payments.
                  </small>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  Email Address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kollie.flomo@farmer.lr"
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  Primary County of Residence / Operations*
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="National">National (All Counties)</option>
                    {LIBERIA_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c} County
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  District / Community
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Sanniquellie-Mahn"
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  Preferred Language for SMS &amp; Advisory
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    {PREFERRED_LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  Profile Summary / Farming Activity Notes
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief description of your smallholder farming activities, crops, or operational responsibilities..."
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "0.88rem",
                      color: "#0f172a",
                      background: "#ffffff",
                      fontFamily: "inherit",
                    }}
                  />
                </label>
              </div>
            </section>

            {/* SECTION 3: PROTECTED GOVERNANCE CREDENTIALS */}
            <section
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
                padding: "18px 20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <b style={{ fontSize: "0.92rem", color: "#166534" }}>
                  🔒 Official National Registry Credentials (Safeguarded)
                </b>
                <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                  Government Verified
                </span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "#166534", lineHeight: 1.4 }}>
                Statutory identity fields are bound to National Identification Registry (NIR) civil records. To update protected credentials, please submit an official correction request via the Help Desk.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
                  <small style={{ display: "block", color: "#64748b", fontSize: "0.72rem" }}>National Identification (NIR / NIN)</small>
                  <strong style={{ color: "#0f172a", fontSize: "0.88rem" }}>{user.nin || "NIN-LR-883921"}</strong>
                </div>
                <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
                  <small style={{ display: "block", color: "#64748b", fontSize: "0.72rem" }}>DFR Account Identifier</small>
                  <strong style={{ color: "#0f172a", fontSize: "0.88rem" }}>{user.id ? `LBR-USR-${user.id}` : "LBR-USR-0418"}</strong>
                </div>
                <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
                  <small style={{ display: "block", color: "#64748b", fontSize: "0.72rem" }}>Assigned Platform Role</small>
                  <strong style={{ color: "#166534", fontSize: "0.88rem" }}>{role}</strong>
                </div>
              </div>
            </section>
          </main>

        <footer
          style={{
            flexShrink: 0,
            position: "sticky",
            bottom: 0,
            zIndex: 40,
            padding: "14px 24px",
            background: "#ffffff",
            borderTop: "2px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#ffffff",
              color: "#334155",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "#166534",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "11px 26px",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 10px rgba(22, 101, 52, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isSubmitting ? "Saving Changes…" : "💾 Save Account Changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}
