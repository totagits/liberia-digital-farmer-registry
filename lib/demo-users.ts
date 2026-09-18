// Pre-configured demo credentials and personas for testing all Liberia DFR user roles

export interface DemoUser {
  id: string;
  name: string;
  role: string;
  email: string;
  passwordHint: string;
  institution: string;
  countyScope: string;
  districtScope: string;
  description: string;
  badgeColor: string;
  category: "admin" | "field" | "extension" | "producer" | "oversight";
  avatar: string;
  photoUrl?: string;
  phone?: string;
  language?: string;
  nin?: string;
  mustChangePassword?: boolean;
  dfrId?: string;
  tempPassword?: string;
  isNewlyRegistered?: boolean;
  registeredAt?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "admin-1",
    name: "Hon. J. Alexander Nuetah",
    role: "Ministry administrator",
    email: "admin@moa.gov.lr",
    passwordHint: "admin2026",
    institution: "Ministry of Agriculture",
    countyScope: "National (15 Counties)",
    districtScope: "All Districts",
    description: "Full national registry authority, policy approval, governance controls, and system-wide administration.",
    badgeColor: "#22c55e",
    category: "admin",
    avatar: "AN",
    phone: "+231 886 512 300",
    language: "English",
    nin: "NIN-LR-100201",
  },
  {
    id: "farmer-1",
    name: "Kollie Flomo",
    role: "Farmer",
    email: "kollie.flomo@farmer.lr",
    passwordHint: "farmer2026",
    institution: "Individual Smallholder Producer",
    countyScope: "Nimba County",
    districtScope: "Sanniquellie-Mahn",
    description: "Registered smallholder cocoa producer. Access e-vouchers, mobile money subsidies, and grievance lodging.",
    badgeColor: "#eab308",
    category: "producer",
    avatar: "KF",
    phone: "+231 770 449 102",
    language: "English / Kpelle",
    nin: "NIN-LR-883921",
  },
  {
    id: "coop-1",
    name: "Fatu Kamara",
    role: "Cooperative representative",
    email: "fatu.kamara@bongricefarmers.lr",
    passwordHint: "coop2026",
    institution: "Bong Central Rice Farmers Association",
    countyScope: "Bong County",
    districtScope: "Suakoko",
    description: "Leads 215 lowland rice producers. Manages collective input requests, tractor rentals, and processing aggregation.",
    badgeColor: "#f97316",
    category: "producer",
    avatar: "FK",
  },
  {
    id: "cao-1",
    name: "Dr. Arthur Bob Karnuah",
    role: "County agricultural officer",
    email: "cao.nimba@moa.gov.lr",
    passwordHint: "nimba2026",
    institution: "MoA County Directorate",
    countyScope: "Nimba County",
    districtScope: "All Nimba Districts",
    description: "County-level agricultural oversight, validation of provisional farmer records, and extension coordination.",
    badgeColor: "#06b6d4",
    category: "admin",
    avatar: "AK",
  },
  {
    id: "dao-1",
    name: "Tambaa Saa",
    role: "District agricultural officer",
    email: "dao.foya@moa.gov.lr",
    passwordHint: "foya2026",
    institution: "MoA District Extension Center",
    countyScope: "Lofa County",
    districtScope: "Foya District",
    description: "Sub-county agricultural officer directly coordinating enumerators, farm spot-checks, and farmer disputes.",
    badgeColor: "#3b82f6",
    category: "admin",
    avatar: "TS",
  },
  {
    id: "sr-enum-1",
    name: "Musu Sirleaf",
    role: "Senior enumerator",
    email: "senior.enumerator@moa.gov.lr",
    passwordHint: "enum2026",
    institution: "MoA National Registry Unit",
    countyScope: "Montserrado & Bomi",
    districtScope: "Greater Monrovia / Careysburg",
    description: "Supervises field enumerators, verifies provisional parcel boundaries, and manages data quality screening.",
    badgeColor: "#a855f7",
    category: "field",
    avatar: "MS",
  },
  {
    id: "enum-1",
    name: "Emmanuel Gaye",
    role: "Enumerator",
    email: "enumerator.bassa@moa.gov.lr",
    passwordHint: "field2026",
    institution: "Field Operations Roster",
    countyScope: "Grand Bassa County",
    districtScope: "District 2 & 3",
    description: "Frontline field agent capturing offline farmer biographics, household surveys, and GPS polygon vertices.",
    badgeColor: "#ec4899",
    category: "field",
    avatar: "EG",
  },
  {
    id: "gis-1",
    name: "Garpue K. Wilson",
    role: "GIS officer",
    email: "gis.officer@moa.gov.lr",
    passwordHint: "spatial2026",
    institution: "National Cartographic & GIS Center",
    countyScope: "National",
    districtScope: "All",
    description: "Validates WGS 84 parcel geometry, analyzes satellite NDVI crop health, resolves overlaps, and issues Map Certificates.",
    badgeColor: "#10b981",
    category: "field",
    avatar: "GW",
  },
  {
    id: "ext-1",
    name: "Dr. John Kerkulah",
    role: "Extension agent",
    email: "extension.bong@moa.gov.lr",
    passwordHint: "advice2026",
    institution: "MoA Central Agricultural Extension Service",
    countyScope: "Bong & Margibi",
    districtScope: "Suakoko / Kakata",
    description: "Conducts on-farm advisory visits, logs pest & disease diagnostics, and connects producers to climate-smart inputs.",
    badgeColor: "#84cc16",
    category: "extension",
    avatar: "JK",
  },
  {
    id: "prog-1",
    name: "Victoria Cooper",
    role: "Program officer",
    email: "programmes@moa.gov.lr",
    passwordHint: "subsidy2026",
    institution: "National Rice & Tree Crop Development Fund",
    countyScope: "National",
    districtScope: "All",
    description: "Manages input subsidy rounds, reviews farmer enrolment cases, scores eligibility, and issues e-vouchers.",
    badgeColor: "#f59e0b",
    category: "admin",
    avatar: "VC",
  },
  {
    id: "fao-1",
    name: "Dr. Bano Mbengue",
    role: "Development-partner user",
    email: "fao.oversight@un.org",
    passwordHint: "fao2026",
    institution: "Food and Agriculture Organization (FAO)",
    countyScope: "National Oversight",
    districtScope: "All",
    description: "FAO Lead Technical Advisor monitoring RFP 137641 contractual deliverables, milestone evidence, and quality acceptance.",
    badgeColor: "#38bdf8",
    category: "oversight",
    avatar: "BM",
  },
  {
    id: "audit-1",
    name: "Sekou Dukuly",
    role: "Security auditor",
    email: "auditor@gac.gov.lr",
    passwordHint: "audit2026",
    institution: "General Auditing Commission (GAC)",
    countyScope: "National Oversight",
    districtScope: "All",
    description: "Independent security auditor verifying cryptographic audit trails, data-sharing protocols, and privacy compliance.",
    badgeColor: "#64748b",
    category: "oversight",
    avatar: "SD",
  },
];

export const STORAGE_KEYS = {
  ACTIVE_USER: "dfr_active_user_v1",
  ACTIVE_ROLE: "dfr_active_role_v1",
};

export function getActiveDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function hasActiveUserSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
  } catch {
    return false;
  }
}

export function getDefaultDemoUser(): DemoUser {
  return DEMO_USERS[0];
}

export function setActiveDemoUser(user: DemoUser): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, user.role);
    } catch {}
  }
}

export function clearActiveDemoUser(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    } catch {}
  }
}

export function updateActiveDemoUser(updates: Partial<DemoUser>): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const current = getActiveDemoUser() || getDefaultDemoUser();
    const updated: DemoUser = { ...current, ...updates };
    setActiveDemoUser(updated);

    // Also persist in persistent custom profiles map keyed by id / email
    const PROFILES_KEY = "dfr_user_profiles_v1";
    const profilesRaw = localStorage.getItem(PROFILES_KEY);
    const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
    profiles[updated.id || updated.email] = updated;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return updated;
  } catch {}
  return null;
}

export function getStoredUserProfile(userIdOrEmail: string): Partial<DemoUser> | null {
  if (typeof window === "undefined") return null;
  try {
    const PROFILES_KEY = "dfr_user_profiles_v1";
    const profilesRaw = localStorage.getItem(PROFILES_KEY);
    if (profilesRaw) {
      const profiles = JSON.parse(profilesRaw);
      return profiles[userIdOrEmail] || null;
    }
  } catch {}
  return null;
}

const REGISTERED_USERS_KEY = "dfr_newly_registered_users_v1";

export function getNewlyRegisteredUsers(): DemoUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function provisionRegisteredUser(params: {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  dfrId: string;
  county: string;
  district: string;
  institution?: string;
  category?: "admin" | "field" | "extension" | "producer" | "oversight";
}): { user: DemoUser; tempPassword: string } {
  const code = Math.floor(1000 + Math.random() * 9000);
  const tempPassword = `DFR-${params.county.slice(0, 2).toUpperCase()}-${code}`;
  const effectiveEmail = params.email?.trim() || `${params.dfrId.toLowerCase().replace(/[^a-z0-9]/g, "-")}@farmer.moa.gov.lr`;
  
  const user: DemoUser = {
    id: `reg-${Date.now()}-${params.dfrId}`,
    name: params.name,
    role: params.role || "Farmer",
    email: effectiveEmail,
    passwordHint: tempPassword,
    institution: params.institution || (params.role.includes("Cooperative") ? "Agricultural Cooperative" : "Smallholder Producer"),
    countyScope: `${params.county} County`,
    districtScope: params.district || "Central District",
    description: `Official ${params.role} account registered under ${params.dfrId}. Mandatory first-time password change active.`,
    badgeColor: "#16a34a",
    category: params.category || "producer",
    avatar: params.name.slice(0, 2).toUpperCase(),
    phone: params.phone,
    mustChangePassword: true,
    dfrId: params.dfrId,
    tempPassword,
    isNewlyRegistered: true,
    registeredAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      // 1. Save to newly registered users list
      const existing = getNewlyRegisteredUsers();
      const updatedList = [user, ...existing.filter(u => u.dfrId !== params.dfrId)].slice(0, 30);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));

      // 2. Save into profiles map keyed by id, email, phone, and dfrId
      const PROFILES_KEY = "dfr_user_profiles_v1";
      const profilesRaw = localStorage.getItem(PROFILES_KEY);
      const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
      profiles[user.id] = user;
      profiles[user.email.toLowerCase()] = user;
      if (user.phone) profiles[user.phone.replace(/[^0-9]/g, "")] = user;
      if (user.dfrId) profiles[user.dfrId] = user;
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch {}
  }

  return { user, tempPassword };
}

export function completeFirstTimePasswordChange(identifier: string, newPassword: string): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const PROFILES_KEY = "dfr_user_profiles_v1";
    const profilesRaw = localStorage.getItem(PROFILES_KEY);
    const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
    
    // Find target
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, "");
    const targetUser: DemoUser | undefined = 
      profiles[cleanId] || 
      profiles[identifier] || 
      (cleanDigits ? profiles[cleanDigits] : undefined) ||
      getNewlyRegisteredUsers().find(u => u.email.toLowerCase() === cleanId || u.dfrId === identifier || (u.phone && u.phone.replace(/[^0-9]/g, "") === cleanDigits));

    if (!targetUser) return null;

    const updatedUser: DemoUser = {
      ...targetUser,
      passwordHint: newPassword,
      mustChangePassword: false,
      isNewlyRegistered: false,
    };

    // Update in profiles
    profiles[updatedUser.id] = updatedUser;
    profiles[updatedUser.email.toLowerCase()] = updatedUser;
    if (updatedUser.phone) profiles[updatedUser.phone.replace(/[^0-9]/g, "")] = updatedUser;
    if (updatedUser.dfrId) profiles[updatedUser.dfrId] = updatedUser;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

    // Update in newly registered list
    const registered = getNewlyRegisteredUsers().map(u => u.dfrId === updatedUser.dfrId ? updatedUser : u);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));

    // Set as active session
    setActiveDemoUser(updatedUser);
    return updatedUser;
  } catch {
    return null;
  }
}

/**
 * Universal print helper for official registry documents:
 * Voucher Dockets, Advisory Slips, Payment Receipts, and Certificates.
 *
 * It renders the printable element in an isolated invisible iframe and triggers print.
 * This guarantees 100% reliable print previews regardless of parent CSS, scrolling, or browser caching.
 */
export function printElementById(elementId: string, title = "Official Registry Document") {
  if (typeof window === "undefined") return;
  const target = document.getElementById(elementId);
  if (!target) {
    window.print();
    return;
  }

  const contentHtml = target.outerHTML;
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "960px";
  iframe.style.height = "1200px";
  iframe.style.border = "none";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    iframe.remove();
    return;
  }

  const baseHref = window.location.origin + (window.location.pathname.startsWith("/liberia-digital-farmer-registry") ? "/liberia-digital-farmer-registry/" : "/");

  const styles = `
    @page { margin: 8mm 10mm; size: auto; }
    *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body {
      background: #ffffff !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
    }
    .register-modal, .voucher-detail-card, .receipt-card, .ext-wizard, .enrollment-wizard, #printable-registration-slip, #printable-org-certificate, .official-registration-slip {
      max-width: 100% !important;
      width: 100% !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border: 1.5px solid #166534 !important;
      border-radius: 8px !important;
      padding: 18px 22px !important;
      margin: 0 auto !important;
      box-sizing: border-box !important;
    }
    .cert-frame {
      border: 3px double #166534;
      padding: 20px;
      border-radius: 8px;
      margin: 10px 0;
      background: #fafdfb;
    }
    .modal-head {
      border-bottom: 1px solid #dce8df;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-head h2 { margin: 2px 0 0 0; font-size: 20px; color: #102c20; }
    .ext-wizard header {
      background: #10182d !important;
      color: #ffffff !important;
      border-radius: 6px 6px 0 0 !important;
      padding: 16px 20px !important;
    }
    .ext-wizard header h2 { color: #ffffff !important; margin: 4px 0 !important; }
    .ext-wizard header span { color: #ffc400 !important; font-weight: 800 !important; font-size: 11px !important; }
    .ext-wizard header p { color: #dce4f0 !important; margin: 0 !important; }
    .identity-panel, .enroll-panel {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 14px;
      background: #f8fafc;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-size: 13px; }
    dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0; padding: 12px 0; }
    dl > div { border: 1px solid #dce7df; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
    dt { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    dd { margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #0f172a; }
    img { max-width: 100%; height: auto; }
  `;

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><base href="${baseHref}" /><title>${title}</title><meta charset="utf-8" /><style>${styles}</style></head><body>${contentHtml}</body></html>`);
  doc.close();

  // Wait briefly for layout and any images to paint before opening print preview
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }
  }, 400);
}

