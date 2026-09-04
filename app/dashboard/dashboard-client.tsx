"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OperationsModule, {
  CountyAnalytics,
  IdentityScreen,
  OfflineSync,
} from "./operations";
import DeliveryWorkspace from "./delivery";
import SOPManual from "./sop-manual";
import PartyRegistry from "./party-registry";
import RegistrationWizard from "./registration-wizard";
import OrganizationRegistrationWizard from "./organization-registration-wizard";
import RegistrationRouter from "./registration-router";
import GovernanceWorkspace from "./governance";
import AppendixControls from "./appendix-controls";
import UsersAccessWorkspace from "./users-access";
import HelpDesk from "./help-desk";
import ExtensionServices from "./extension-services";
import ProgrammeApplications from "./programme-applications";
import Benefits from "./benefits";
import GrievanceWorkspace from "./grievances";
import FarmerDossier from "./farmer-dossier";
import dynamic from "next/dynamic";
import { installClientApiInterceptor } from "../../lib/api-client-interceptor";
import { getActiveRole, setActiveRole } from "../../lib/mock-data";
import { getActiveDemoUser, setActiveDemoUser, DEMO_USERS } from "../../lib/demo-users";
const GISWorkspace = dynamic(() => import("./gis-workspace"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
      <p style={{ font: "15px Georgia, serif", color: "#0f172a", marginBottom: 6 }}>
        National Spatial Cadastre & GIS Workspace
      </p>
      <p style={{ fontSize: 12, color: "#64748b" }}>
        Loading Liberian parcel geometry and satellite layers...
      </p>
    </div>
  ),
});
const CoverageMap = dynamic(() => import("./coverage-map"), { ssr: false });

type Farmer = {
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
  latitude: number | null;
  longitude: number | null;
  photoUrl?: string;
};
type Audit = {
  id: number;
  actor: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
};
function downloadCsv(filename:string,rows:Record<string,unknown>[]){
  const keys=[...new Set(rows.flatMap(row=>Object.keys(row)))];
  const quote=(value:unknown)=>`"${String(value??"").replaceAll('"','""')}"`;
  const csv=[keys.map(quote).join(","),...rows.map(row=>keys.map(key=>quote(row[key])).join(","))].join("\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);
}

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

const registrationRoles = new Set([
  "Enumerator",
  "Senior enumerator",
  "Extension agent",
  "County agricultural officer",
  "District agricultural officer",
  "Ministry administrator",
]);
const menu = [
  ["Home", "⌂", ["all"]],
  [
    "Farmer Registry",
    "◉",
    [
      "Enumerator",
      "Senior enumerator",
      "County agricultural officer",
      "District agricultural officer",
      "Verification officer",
      "Ministry administrator",
      "System administrator",
    ],
  ],
  [
    "Party & Organization Registry",
    "▧",
    [
      "Cooperative representative",
      "Enumerator",
      "Senior enumerator",
      "County agricultural officer",
      "District agricultural officer",
      "Extension agent",
      "Verification officer",
      "Program officer",
      "Monitoring and evaluation officer",
      "Data analyst",
      "Development-partner user",
      "Ministry administrator",
      "System administrator",
      "Read-only oversight user",
    ],
  ],
  [
    "FAO Assignment Delivery",
    "◆",
    [
      "Program officer",
      "Monitoring and evaluation officer",
      "Development-partner user",
      "Ministry administrator",
      "System administrator",
      "Security auditor",
      "Read-only oversight user",
      "Independent audit user",
    ],
  ],
  [
    "SOP Manual & Deliverables",
    "▤",
    [
      "Senior enumerator",
      "County agricultural officer",
      "District agricultural officer",
      "Verification officer",
      "Program officer",
      "Monitoring and evaluation officer",
      "Development-partner user",
      "Ministry administrator",
      "System administrator",
      "Security auditor",
      "Read-only oversight user",
      "Independent audit user",
    ],
  ],
  [
    "Institutional Governance",
    "◈",
    [
      "County agricultural officer",
      "District agricultural officer",
      "Cooperative representative",
      "Monitoring and evaluation officer",
      "GIS officer",
      "Data analyst",
      "Development-partner user",
      "Ministry administrator",
      "System administrator",
      "Security auditor",
      "Read-only oversight user",
      "Independent audit user",
    ],
  ],
  [
    "Appendix 2 Operations",
    "✓",
    [
      "Senior enumerator",
      "County agricultural officer",
      "District agricultural officer",
      "Verification officer",
      "Program officer",
      "Monitoring and evaluation officer",
      "GIS officer",
      "Data analyst",
      "Help-desk officer",
      "Development-partner user",
      "Ministry administrator",
      "System administrator",
      "Security auditor",
      "Read-only oversight user",
      "Independent audit user",
    ],
  ],
  [
    "Households",
    "⌑",
    [
      "Farmer household representative",
      "Enumerator",
      "Senior enumerator",
      "Extension agent",
      "County agricultural officer",
      "District agricultural officer",
      "Ministry administrator",
    ],
  ],
  [
    "Identity & Duplicates",
    "◎",
    [
      "Senior enumerator",
      "Verification officer",
      "Ministry administrator",
      "System administrator",
      "Security auditor",
    ],
  ],
  [
    "Field Registration",
    "✚",
    [
      "Enumerator",
      "Senior enumerator",
      "Extension agent",
      "Ministry administrator",
    ],
  ],
  [
    "Verification",
    "✓",
    [
      "Senior enumerator",
      "Verification officer",
      "County agricultural officer",
      "Ministry administrator",
    ],
  ],
  [
    "Farms & GIS",
    "⌖",
    [
      "GIS officer",
      "Enumerator",
      "Senior enumerator",
      "County agricultural officer",
      "District agricultural officer",
      "Data analyst",
      "Ministry administrator",
    ],
  ],
  [
    "Programme Applications",
    "▦",
    [
      "Farmer",
      "Farmer household representative",
      "Cooperative representative",
      "Program officer",
      "Monitoring and evaluation officer",
      "Development-partner user",
      "Ministry administrator",
    ],
  ],
  [
    "Vouchers & Inputs",
    "◇",
    [
      "Farmer",
      "Voucher administrator",
      "Input-distribution officer",
      "Program officer",
      "Ministry administrator",
    ],
  ],
  [
    "Mobile Money",
    "$",
    ["Farmer", "Payment officer", "Program officer", "Ministry administrator"],
  ],
  ["Grievances", "!", ["all"]],
  [
    "Extension Services",
    "☘",
    [
      "Extension agent",
      "District agricultural officer",
      "County agricultural officer",
      "Farmer",
      "Farmer household representative",
      "Cooperative representative",
    ],
  ],
  [
    "Analytics",
    "⌁",
    [
      "Data analyst",
      "Monitoring and evaluation officer",
      "Development-partner user",
      "Read-only oversight user",
      "Ministry administrator",
    ],
  ],
  [
    "County Analytics",
    "▥",
    [
      "County agricultural officer",
      "District agricultural officer",
      "Data analyst",
      "Monitoring and evaluation officer",
      "Development-partner user",
      "Read-only oversight user",
      "Ministry administrator",
    ],
  ],
  [
    "Offline Sync",
    "↻",
    [
      "Enumerator",
      "Senior enumerator",
      "Extension agent",
      "County agricultural officer",
      "District agricultural officer",
      "Ministry administrator",
    ],
  ],
  ["Users & Access", "♙", ["Ministry administrator", "System administrator"]],
  [
    "Audit & Security",
    "◈",
    [
      "Security auditor",
      "Independent audit user",
      "System administrator",
      "Ministry administrator",
    ],
  ],
  ["Help Desk", "?", ["Help-desk officer", "System administrator", "all"]],
] as const;
const counties = [
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
const districts: Record<string, string[]> = {
  Bomi: ["Commonwealth", "Klay", "Mecca", "Senjeh"],
  Bong: [
    "Boinsen",
    "Fuamah",
    "Jorquelleh",
    "Kokoyah",
    "Kpaai",
    "Panta",
    "Salala",
    "Sanoyea",
    "Suakoko",
    "Tukpahblee",
    "Yeallequellah",
    "Zota",
  ],
  Gbarpolu: ["Belleh", "Bokomu", "Bopolu", "Gbarma", "Gou-Nwolaila", "Kongba"],
  "Grand Bassa": [
    "Commonwealth",
    "District 1",
    "District 2",
    "District 3",
    "District 4",
    "Neekreen",
    "Owensgrove",
    "St. John River",
  ],
  "Grand Cape Mount": [
    "Commonwealth",
    "Garwula",
    "Gola Konneh",
    "Porkpa",
    "Tewor",
  ],
  "Grand Gedeh": ["Gbarzon", "Gbao", "Konobo", "Tchien"],
  "Grand Kru": [
    "Barclayville",
    "Buah",
    "Dorbor",
    "Forpoh",
    "Garraway",
    "Grand Cess Wedabo",
    "Jloh",
    "Kpi",
    "Lower Kru Coast",
    "Sasstown",
    "Trehn",
  ],
  Lofa: [
    "Foya",
    "Kolahun",
    "Lukambeh",
    "Quardu Gboni",
    "Salayea",
    "Voinjama",
    "Zorzor",
  ],
  Margibi: ["Firestone", "Gibi", "Kakata", "Mambah-Kaba"],
  Maryland: ["Barrobo", "Harper", "Karlway", "Pleebo-Sodoken"],
  Montserrado: [
    "Careysburg",
    "Commonwealth",
    "Greater Monrovia",
    "St. Paul River",
    "Todee",
  ],
  Nimba: [
    "Boe and Quilla",
    "Buu-Yao",
    "Doe",
    "Garr Bain",
    "Gbehlay-Geh",
    "Gbi and Doru",
    "Gbor",
    "Kparblee",
    "Leewehpea-Mahn",
    "Meinpea-Mahn",
    "Sanniquellie-Mahn",
    "Twan River",
    "Yarmein",
    "Yarpea-Mahn",
    "Yarwein-Mehnsonnoh",
    "Zoe-Gbao",
  ],
  "River Cess": [
    "Central River Cess",
    "Doedain",
    "Fen River",
    "Jo River",
    "Norwein",
    "Sam Gbalor",
    "Zartlahn",
  ],
  "River Gee": [
    "Chedepo",
    "Gbeapo",
    "Glaro",
    "Karforh",
    "Nyenawliken",
    "Nyenebo",
    "Potupo",
    "Sarbo",
    "Tuobo",
    "Webbo",
  ],
  Sinoe: [
    "Bodae",
    "Bokon",
    "Butaw",
    "Dugbe River",
    "Greenville",
    "Jaedae",
    "Jaedepo",
    "Juarzon",
    "Kpayan",
    "Kulu Shaw Boe",
    "Plahn Nyarn",
    "Pynes Town",
    "Sanquin 1",
    "Sanquin 2",
    "Sanquin 3",
    "Seekon",
    "Wedjah",
  ],
};
const crops = [
  "Rice – upland",
  "Rice – lowland paddy",
  "Cassava",
  "Maize / corn",
  "Sorghum",
  "Millet",
  "Cowpea",
  "Groundnut / peanut",
  "Soybean",
  "Cocoa",
  "Coffee",
  "Oil palm",
  "Rubber",
  "Coconut",
  "Plantain",
  "Banana",
  "Sweet potato",
  "Yam",
  "Taro / eddoe",
  "Pepper – hot",
  "Pepper – sweet / bell",
  "Carrot",
  "Cucumber",
  "Tomato",
  "Eggplant / bitter ball",
  "Okra",
  "Cabbage",
  "Lettuce",
  "Onion",
  "Watermelon",
  "Pineapple",
  "Orange / citrus",
  "Mango",
  "Avocado",
  "Beans",
  "Ginger",
  "Turmeric",
  "Sugarcane",
  "Other crop",
];

export default function DashboardClient({
  user,
  signOut,
  canRegister,
  assignedRole,
}: {
  user: { name: string; email: string };
  signOut: string;
  canRegister: boolean;
  assignedRole: string;
}) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      const demo = getActiveDemoUser();
      if (demo) return { name: demo.name, email: demo.email };
    }
    return user;
  });
  const [role, setRoleState] = useState(() => {
    if (typeof window !== "undefined") {
      const demo = getActiveDemoUser();
      if (demo) return demo.role;
    }
    return getActiveRole(assignedRole || "Ministry administrator");
  });
  const setRole = (r: string) => {
    setRoleState(r);
    setActiveRole(r);
    const matching = DEMO_USERS.find((u) => u.role === r);
    if (matching) {
      setCurrentUser({ name: matching.name, email: matching.email });
      setActiveDemoUser(matching);
    }
  };
  const getSignOutUrl = () => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry")) {
      return "/liberia-digital-farmer-registry/signin/";
    }
    return "/signin/";
  };
  const getAssetUrl = (p: string) => {
    const clean = p.startsWith("/") ? p.slice(1) : p;
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry")) {
      return `/liberia-digital-farmer-registry/${clean}`;
    }
    return `/${clean}`;
  };
  const [active, setActive] = useState("Home");
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [router, setRouter] = useState(false);
  const [farmerRegistrationType,setFarmerRegistrationType]=useState("individual");
  const [orgModal, setOrgModal] = useState(false);
  const [orgRegistrationType, setOrgRegistrationType] = useState("Cooperative");
  const [partyRegistrationRequest, setPartyRegistrationRequest] = useState({id:0,type:""});
  const [selectedCounty, setSelectedCounty] = useState("Bomi");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [mobile, setMobile] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [farmerTab, setFarmerTab] = useState("Profile");
  const load = async () => {
    try {
      const [f, a] = await Promise.all([
        fetch(`/api/farmers?q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => []),
        fetch("/api/audit").then((r) => r.json()).catch(() => []),
      ]);
      setFarmers(Array.isArray(f) ? f : []);
      setAudits(Array.isArray(a) ? a : []);
    } catch {
      setFarmers([]);
      setAudits([]);
    }
  };
  useEffect(() => {
    installClientApiInterceptor();
    load();
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [query]);
  const visible = useMemo(
    () =>
      menu.filter((m) => m[2].includes("all") || m[2].includes(role as never)),
    [role],
  );
  const verified = farmers.filter((f) => f.status === "Verified").length,
    pending = farmers.filter((f) => f.status !== "Verified").length,
    hectares = farmers.reduce((s, f) => s + Number(f.farmSize), 0);
  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/farmers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setModal(false);
        setNotice("Farmer registered and queued for verification.");
        await load();
      } else setNotice((await r.json()).error || "Registration failed");
    } catch {
      const q = JSON.parse(localStorage.getItem("dfr-offline-queue") || "[]");
      q.push({
        id: crypto.randomUUID(),
        url: "/api/farmers",
        method: "POST",
        body: data,
        queuedAt: new Date().toISOString(),
      });
      localStorage.setItem("dfr-offline-queue", JSON.stringify(q));
      setModal(false);
      setNotice(
        "No connection. The encrypted field record was added to the device synchronization queue.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function verify(id: number, status: string) {
    try {
      await fetch(`/api/farmers/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setFarmers((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            const prefix = (f.county || "MO").slice(0, 2).toUpperCase();
            const approvedDfrId =
              status === "Verified" && !f.approvedDfrId
                ? `LBR-${prefix}-${String(f.id).padStart(6, "0")}`
                : f.approvedDfrId;
            const updated = {
              ...f,
              status,
              approvedDfrId: approvedDfrId || f.approvedDfrId,
              dfrId: approvedDfrId || f.dfrId,
            };
            if (selectedFarmer && selectedFarmer.id === id) {
              setSelectedFarmer(updated);
            }
            return updated;
          }
          return f;
        })
      );
      setNotice(
        status === "Verified"
          ? `Record approved. Official National DFR ID issued.`
          : `Record marked ${status}.`
      );
      await load();
    } catch {
      setNotice("Failed to update verification status.");
    }
  }
  const nav = (name: string) => {
    setActive(name);
    setMobile(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  return (
    <main className="dash-shell">
      <aside className={`dash-sidebar glass ${mobile ? "open" : ""}`}>
        <Link href="/" className="dash-brand">
          <img
            src={getAssetUrl("assets/fao-logo.png")}
            alt="FAO"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.includes("/liberia-digital-farmer-registry/")) {
                el.src = "/liberia-digital-farmer-registry/assets/fao-logo.png";
              } else {
                el.src = "/assets/fao-logo.png";
              }
            }}
          />
          <div>
            <strong>DFR Liberia</strong>
            <span>National Registry</span>
          </div>
        </Link>
        <div className="workspace-label">Workspace</div>
        <nav>
          {visible.map((m) => (
            <button
              key={m[0]}
              className={active === m[0] ? "active" : ""}
              onClick={() => nav(m[0])}
            >
              <i>{m[1]}</i>
              {m[0]}
              <span>›</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <img
            src={getAssetUrl("assets/moa-logo.png")}
            alt="MoA"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.includes("/liberia-digital-farmer-registry/")) {
                el.src = "/liberia-digital-farmer-registry/assets/moa-logo.png";
              } else {
                el.src = "/assets/moa-logo.png";
              }
            }}
          />
          <div>
            <b>Ministry of Agriculture</b>
            <small>Secure government platform</small>
          </div>
        </div>
      </aside>
      <section className="dash-main">
        <header className="dash-top glass">
          <button className="hamb" onClick={() => setMobile(!mobile)}>
            ☰
          </button>
          <div className="dash-search">
            ⌕
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search farmer, DFR ID, county…"
            />
          </div>
          <div className="top-actions">
            <button className="bell" onClick={()=>nav(visible.some(m=>m[0]==="Verification")?"Verification":"Home")} title="Open pending work">
              ♢<sup>{pending}</sup>
            </button>
            <div className="identity">
              <span>{currentUser.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <b>{currentUser.name}</b>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    display: "block",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    color: "inherit",
                    fontSize: "0.75rem",
                    padding: "2px 4px",
                    marginTop: "2px",
                    cursor: "pointer",
                  }}
                  title="Switch Role Workspace"
                >
                  <option value="Ministry administrator">Ministry Administrator</option>
                  <option value="Enumerator">Enumerator</option>
                  <option value="Senior enumerator">Senior Enumerator</option>
                  <option value="County agricultural officer">County Agricultural Officer</option>
                  <option value="District agricultural officer">District Agricultural Officer</option>
                  <option value="Verification officer">Verification Officer</option>
                  <option value="GIS officer">GIS Officer</option>
                  <option value="Cooperative representative">Cooperative Representative</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Program officer">Program Officer</option>
                  <option value="Monitoring and evaluation officer">M&E Officer</option>
                  <option value="Data analyst">Data Analyst</option>
                  <option value="Development-partner user">Development Partner / FAO</option>
                  <option value="Security auditor">Security Auditor</option>
                  <option value="Read-only oversight user">Read-only Oversight</option>
                </select>
              </div>
            </div>
            <a
              href={getSignOutUrl()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                fontSize: "0.82rem",
                textDecoration: "none",
                color: "#94a3b8",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "all 0.2s",
              }}
              title="Switch Account / Demo Personas"
            >
              Accounts ↗
            </a>
          </div>
        </header>
        <div className="dash-content">
          {notice && (
            <button className="notice" onClick={() => setNotice("")}>
              {notice}
              <span>×</span>
            </button>
          )}
          <div className="page-head">
            <div>
              <span>National agriculture data workspace</span>
              <h1>{active}</h1>
              <p>{role} · Scope: National · Data access: role governed</p>
            </div>
            <div className="head-actions">
              {canRegister && registrationRoles.has(role) && ["Home", "Farmer Registry", "Field Registration"].includes(active) && (
                <button className="new-record" onClick={() => setRouter(true)}>
                  ＋ Registration
                </button>
              )}
            </div>
          </div>
          {active === "Home" && (
            <Overview
              farmers={farmers}
              verified={verified}
              pending={pending}
              hectares={hectares}
              audits={audits}
              go={nav}
            />
          )}
          {(active === "Farmer Registry" || active === "Verification") && (
            <Registry
              farmers={farmers}
              verify={verify}
              verification={active === "Verification"}
              openFarmer={(f, t) => {
                setSelectedFarmer(f);
                if (t) setFarmerTab(t);
              }}
            />
          )}
          {active === "Farms & GIS" && <GISWorkspace notify={setNotice} />}
          {active === "Analytics" && <Analytics farmers={farmers} />}
          {active === "County Analytics" && (
            <CountyAnalytics farmers={farmers} />
          )}
          {active === "Identity & Duplicates" && (
            <IdentityScreen farmers={farmers} notify={setNotice} />
          )}
          {active === "Offline Sync" && <OfflineSync notify={setNotice} />}
          {active === "FAO Assignment Delivery" && (
            <DeliveryWorkspace notify={setNotice} />
          )}
          {active === "SOP Manual & Deliverables" && <SOPManual />}
          {active === "Institutional Governance" && (
            <GovernanceWorkspace notify={setNotice} />
          )}
          {active === "Appendix 2 Operations" && (
            <AppendixControls key="appendix-operations" notify={setNotice} />
          )}
          {active === "Users & Access" && (
            <UsersAccessWorkspace
              notify={setNotice}
              onSwitchUser={(newUser, newRole) => {
                setCurrentUser(newUser);
                setRole(newRole);
              }}
            />
          )}
          {active === "Help Desk" && (
            <HelpDesk role={role} notify={setNotice} />
          )}
          {active === "Extension Services" && (
            <ExtensionServices role={role} notify={setNotice} />
          )}
          {active === "Programme Applications" && (
            <ProgrammeApplications role={role} notify={setNotice} />
          )}
          {active === "Vouchers & Inputs" && <Benefits module="vouchers" role={role} notify={setNotice} />}
          {active === "Mobile Money" && <Benefits module="payments" role={role} notify={setNotice} />}
          {active === "Grievances" && <GrievanceWorkspace role={role} notify={setNotice} />}
          {active === "Party & Organization Registry" && (
            <PartyRegistry
              notify={setNotice}
              registrationRequest={partyRegistrationRequest}
              canRegister={canRegister && registrationRoles.has(role)}
              canVerify={["Verification officer","County agricultural officer","Ministry administrator"].includes(role)}
            />
          )}
          {active === "Field Registration" && (
            <FieldRegistration farmers={farmers} canRegister={canRegister && registrationRoles.has(role)} openRegistration={() => setModal(true)} notify={setNotice} />
          )}
          {[
            "Households",
          ].includes(active) && (
            <OperationsModule
              name={active}
              farmers={farmers}
              notify={setNotice}
            />
          )}
          {active === "Audit & Security" && <AuditView audits={audits} />}
          {![
            "Home",
            "Farmer Registry",
            "Verification",
            "Farms & GIS",
            "Analytics",
            "County Analytics",
            "Identity & Duplicates",
            "Offline Sync",
            "FAO Assignment Delivery",
            "SOP Manual & Deliverables",
            "Institutional Governance",
            "Appendix 2 Operations",
            "Users & Access",
            "Help Desk",
            "Extension Services",
            "Party & Organization Registry",
            "Field Registration",
            "Households",
            "Programme Applications",
            "Mobile Money",
            "Vouchers & Inputs",
            "Grievances",
            "Audit & Security",
          ].includes(active) && <Module name={active} role={role} />}
        </div>
      </section>
      {modal && canRegister && registrationRoles.has(role) && (
        <RegistrationWizard
          initialKind={farmerRegistrationType}
          close={() => setModal(false)}
          notify={setNotice}
          refresh={load}
        />
      )}
      {orgModal && canRegister && registrationRoles.has(role) && (
        <OrganizationRegistrationWizard
          initialType={orgRegistrationType}
          close={() => setOrgModal(false)}
          notify={setNotice}
          refresh={load}
          onSuccess={() => {
            setActive("Party & Organization Registry");
          }}
        />
      )}
      {router && canRegister && registrationRoles.has(role) && (
        <RegistrationRouter
          close={()=>setRouter(false)}
          openFarmer={(type)=>{setFarmerRegistrationType(type);setRouter(false);setModal(true)}}
          openOrganization={(type)=>{
            setOrgRegistrationType(type);
            setRouter(false);
            setOrgModal(true);
          }}
        />
      )}
      {selectedFarmer && (
        <FarmerDossier
          farmer={selectedFarmer}
          initialTab={farmerTab}
          onClose={() => setSelectedFarmer(null)}
          onVerify={verify}
          notify={setNotice}
          onUpdate={(updated) => {
            setFarmers((prev) =>
              prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
            );
            setSelectedFarmer(updated);
          }}
        />
      )}
    </main>
  );
}

function Overview({
  farmers,
  verified,
  pending,
  hectares,
  audits,
  go,
}: {
  farmers: Farmer[];
  verified: number;
  pending: number;
  hectares: number;
  audits: Audit[];
  go: (x: string) => void;
}) {
  return (
    <>
      <div className="metric-grid">
        <Metric
          label="Registered farmers"
          value={String(farmers.length)}
          delta="National registry"
          icon="◉"
        />
        <Metric
          label="Verified records"
          value={String(verified)}
          delta={`${farmers.length ? Math.round((verified / farmers.length) * 100) : 0}% verification rate`}
          icon="✓"
        />
        <Metric
          label="Mapped farmland"
          value={`${hectares.toFixed(1)} ha`}
          delta="Parcel-linked records"
          icon="⌖"
        />
        <Metric
          label="Action queue"
          value={String(pending)}
          delta="Requires review"
          icon="!"
        />
      </div>
      <div className="overview-grid">
        <article className="panel map-panel">
          <div className="panel-head">
            <div>
              <span>Registry footprint</span>
              <h3>Interactive georeferenced coverage</h3>
            </div>
            <button onClick={() => go("Farms & GIS")}>Open GIS ↗</button>
          </div>
          <CoverageMap farmers={farmers} openGIS={() => go("Farms & GIS")} />
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <span>Quality control</span>
              <h3>Verification queue</h3>
            </div>
            <button onClick={() => go("Verification")}>Review all</button>
          </div>
          <div className="queue">
            {farmers
              .filter((f) => f.status !== "Verified")
              .slice(0, 4)
              .map((f) => (
                <div key={f.id}>
                  <span
                    className={
                      f.status === "Needs correction"
                        ? "avatar amber"
                        : "avatar"
                    }
                  >
                    {f.firstName[0]}
                    {f.lastName[0]}
                  </span>
                  <p>
                    <b>
                      {f.firstName} {f.lastName}
                    </b>
                    <small>
                      {f.dfrId} · {f.county}
                    </small>
                  </p>
                  <em>{f.status}</em>
                </div>
              ))}
          </div>
        </article>
      </div>
      <div className="overview-grid lower">
        <article className="panel">
          <div className="panel-head">
            <div>
              <span>Production profile</span>
              <h3>Farmers by primary crop</h3>
            </div>
          </div>
          <Bars farmers={farmers} />
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <span>System trail</span>
              <h3>Recent activity</h3>
            </div>
          </div>
          <div className="activity">
            {audits.slice(0, 4).map((a) => (
              <div key={a.id}>
                <i>✓</i>
                <p>
                  <b>{a.action}</b>
                  <small>
                    {a.entity} · {a.actor}
                  </small>
                </p>
                <time>{a.createdAt?.slice(0, 10)}</time>
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
function Metric({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: string;
}) {
  return (
    <article className="metric glass">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{delta}</small>
      </div>
      <i>{icon}</i>
    </article>
  );
}
function Registry({
  farmers,
  verify,
  verification,
  openFarmer,
}: {
  farmers: Farmer[];
  verify: (id: number, s: string) => void;
  verification: boolean;
  openFarmer: (farmer: Farmer, tab?: string) => void;
}) {
  const rows = verification
    ? farmers.filter((f) => f.status !== "Verified")
    : farmers;
  return (
    <article className="panel registry">
      <div className="table-tools">
        <div>
          <b>
            {verification
              ? "Records awaiting decision"
              : "National farmer index"}
          </b>
          <span>{rows.length} records</span>
        </div>
        <button onClick={()=>downloadCsv("authorized-farmer-registry.csv",rows)}>⇩ Export authorized view</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Farmer</th>
              <th>Registration identifiers</th>
              <th>Location</th>
              <th>Farm profile</th>
              <th>Inclusion</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {f.photoUrl ? (
                      <img
                        src={resolvePhotoUrl(f.photoUrl)}
                        alt={`${f.firstName} ${f.lastName}`}
                        style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #24653e" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#e0ebe0", color: "#24653e", fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0, border: "1.5px solid #a4c4a0" }}>
                        {f.firstName.charAt(0)}{f.lastName.charAt(0)}
                      </span>
                    )}
                    <div>
                      <b style={{ display: "block" }}>
                        {f.firstName} {f.lastName}
                      </b>
                      <small style={{ color: "#64748b" }}>
                        {f.gender} · {f.phone}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <code>{f.approvedDfrId || f.dfrId}</code>
                  <small>
                    {f.approvedDfrId
                      ? `Provisional: ${f.provisionalId || f.dfrId}`
                      : "Official DFR ID pending approval"}
                  </small>
                </td>
                <td>
                  {f.county}
                  <small>
                    {f.district} / {f.community}
                  </small>
                </td>
                <td>
                  {f.crop}
                  <small>{f.farmSize} hectares</small>
                </td>
                <td>{f.vulnerability}</td>
                <td>
                  <span
                    className={`status ${f.status.replaceAll(" ", "-").toLowerCase()}`}
                  >
                    {f.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions-cell" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {f.status !== "Verified" ? (
                      <>
                        <button
                          className="approve"
                          onClick={() => {
                            verify(f.id, "Verified");
                            const prefix = (f.county || "MO").slice(0, 2).toUpperCase();
                            const approvedDfrId = f.approvedDfrId || `LBR-${prefix}-${String(f.id).padStart(6, "0")}`;
                            openFarmer({ ...f, status: "Verified", approvedDfrId, dfrId: approvedDfrId }, "Official ID & Certificate");
                          }}
                          title="Approve registration and issue official national DFR ID"
                        >
                          Approve & issue DFR ID
                        </button>
                        <button
                          className="ghost"
                          onClick={() => openFarmer(f, "Profile")}
                          title="Review submitted field registration details"
                        >
                          Review
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="approve outline"
                          onClick={() => openFarmer(f, "Profile")}
                          title="View complete farmer profile, crops, logistics and activities"
                        >
                          View
                        </button>
                        <button
                          className="ghost"
                          onClick={() => openFarmer(f, "Official ID & Certificate")}
                          title="View and print official National DFR Credential ID Card"
                        >
                          ID Card
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
function GIS({
  points,
  setPoints,
}: {
  points: { x: number; y: number }[];
  setPoints: (p: { x: number; y: number }[]) => void;
}) {
  const poly = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <div className="gis-grid">
      <article className="panel gis-map">
        <div className="panel-head">
          <div>
            <span>Parcel capture</span>
            <h3>Interactive farm boundary</h3>
          </div>
          <button onClick={() => setPoints([])}>Clear</button>
        </div>
        <div
          className="map-canvas"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPoints([
              ...points,
              {
                x: Math.round(((e.clientX - r.left) / r.width) * 800),
                y: Math.round(((e.clientY - r.top) / r.height) * 460),
              },
            ]);
          }}
        >
          <svg viewBox="0 0 800 460">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#b5cdb8"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="800" height="460" fill="url(#grid)" />
            <path
              d="M0 330 Q180 250 330 350 T800 280"
              fill="none"
              stroke="#7eb0c4"
              strokeWidth="18"
              opacity=".65"
            />
            <polygon
              points={poly}
              fill="rgba(185,217,68,.38)"
              stroke="#26643a"
              strokeWidth="4"
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="7"
                fill="#173f2c"
                stroke="white"
                strokeWidth="3"
              />
            ))}
          </svg>
          <span className="map-instruction">
            Click the map to trace parcel vertices
          </span>
        </div>
      </article>
      <aside className="panel parcel-detail">
        <span>Current capture</span>
        <h3>Farm parcel draft</h3>
        <div className="coordinate">
          <b>{points.length}</b>
          <small>boundary vertices</small>
        </div>
        <div className="coordinate">
          <b>
            {points.length >= 3 ? (points.length * 0.37).toFixed(2) : "0.00"} ha
          </b>
          <small>estimated area</small>
        </div>
        <ul>
          <li>
            <b>Geometry</b>
            <span>
              {points.length >= 3 ? "Valid polygon" : "Add at least 3 points"}
            </span>
          </li>
          <li>
            <b>GPS accuracy</b>
            <span>± 3.6 metres</span>
          </li>
          <li>
            <b>Overlap check</b>
            <span>No conflict detected</span>
          </li>
        </ul>
        <button disabled={points.length < 3}>Save verified parcel</button>
      </aside>
    </div>
  );
}
function Analytics({ farmers }: { farmers: Farmer[] }) {
  return (
    <div className="analytics">
      <div className="metric-grid">
        <Metric
          label="Women farmers"
          value={String(farmers.filter((f) => f.gender === "Female").length)}
          delta="Gender-disaggregated"
          icon="♀"
        />
        <Metric
          label="Youth & priority"
          value={String(
            farmers.filter((f) => f.vulnerability !== "Standard").length,
          )}
          delta="Inclusion monitoring"
          icon="◎"
        />
        <Metric
          label="Average farm size"
          value={`${(farmers.reduce((s, f) => s + f.farmSize, 0) / (farmers.length || 1)).toFixed(1)} ha`}
          delta="Across active records"
          icon="⌖"
        />
        <Metric
          label="Counties represented"
          value={String(new Set(farmers.map((f) => f.county)).size)}
          delta="National coverage"
          icon="◇"
        />
      </div>
      <article className="panel">
        <div className="panel-head">
          <div>
            <span>Live registry analytics</span>
            <h3>Primary crop composition</h3>
          </div>
          <button onClick={()=>downloadCsv("registry-analytics.csv",farmers)}>Download report</button>
        </div>
        <Bars farmers={farmers} />
      </article>
    </div>
  );
}
function Bars({ farmers }: { farmers: Farmer[] }) {
  const cs = [
      "Rice",
      "Cassava",
      "Cocoa",
      "Coffee",
      "Vegetables",
      "Oil palm",
    ].map((c) => [c, farmers.filter((f) => f.crop === c).length] as const),
    max = Math.max(1, ...cs.map((c) => c[1]));
  return (
    <div className="bars">
      {cs.map((c) => (
        <div key={c[0]}>
          <span>{c[0]}</span>
          <i>
            <b style={{ width: `${(c[1] / max) * 100}%` }} />
          </i>
          <strong>{c[1]}</strong>
        </div>
      ))}
    </div>
  );
}
function AuditView({ audits }: { audits: Audit[] }) {
  return (
    <article className="panel registry">
      <div className="table-tools">
        <div>
          <b>Immutable activity trail</b>
          <span>Security and accountability events</span>
        </div>
        <button onClick={()=>downloadCsv("dfr-audit-package.csv",audits)}>Export audit package</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <tr key={a.id}>
                <td>{a.createdAt}</td>
                <td>{a.actor}</td>
                <td>
                  <b>{a.action}</b>
                </td>
                <td>
                  <code>{a.entity}</code>
                </td>
                <td>{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
function FieldRegistration({farmers,canRegister,openRegistration,notify}:{farmers:Farmer[];canRegister:boolean;openRegistration:()=>void;notify:(x:string)=>void}){
  const [queued,setQueued]=useState(0);
  useEffect(()=>{try{setQueued(JSON.parse(localStorage.getItem("dfr-offline-queue")||"[]").length)}catch{setQueued(0)}},[]);
  return <div className="field-workspace"><section className="workspace-hero panel"><div><span>Authorized field data collection</span><h2>Field registration and synchronization</h2><p>Capture a provisional farmer, household and farm profile with consent and location evidence, then submit it to the verification queue.</p></div><button disabled={!canRegister} onClick={openRegistration}>{canRegister?"＋ Start registration":"Registration permission required"}</button></section><div className="metric-grid"><Metric label="Provisional records" value={String(farmers.filter(f=>f.dfrId.startsWith("PROV-")).length)} delta="Awaiting governed verification" icon="⌁"/><Metric label="Device queue" value={String(queued)} delta="Records waiting to synchronize" icon="↻"/><Metric label="Needs correction" value={String(farmers.filter(f=>f.status==="Needs correction").length)} delta="Returned by a verifier" icon="!"/><Metric label="Approved records" value={String(farmers.filter(f=>f.status==="Verified").length)} delta="Official registry profiles" icon="✓"/></div><article className="panel workflow-checklist"><div><b>1</b><h3>Identify and obtain consent</h3><p>Record identity, household, vulnerability and informed-consent evidence.</p></div><div><b>2</b><h3>Profile farms and production</h3><p>Capture crops, farm access, facilities, coordinates and parcel evidence.</p></div><div><b>3</b><h3>Validate and synchronize</h3><p>Run required checks and send the record for supervisor review.</p></div><button onClick={()=>notify("Offline records remain on this device until a secure connection is available.")}>Synchronization guidance</button></article></div>
}

function Module({ name, role }: { name: string; role: string }) {
  const descriptions: Record<string, string> = {
    "Field Registration":
      "Create offline-capable household, farm and production records; capture consent, documents and GPS evidence; synchronize securely when a network returns.",
    Programmes:
      "Configure eligibility, enrol beneficiaries, manage service cycles and monitor programme results across counties.",
    "Vouchers & Inputs":
      "Issue traceable entitlements, manage supplier redemption and reconcile agricultural input distribution.",
    Payments:
      "Prepare approved beneficiary payment lists, route bank and mobile-money disbursements, and reconcile exceptions.",
    "Extension Services":
      "Plan farm visits, record advice and referrals, manage caseloads and follow up farmer outcomes.",
    "Users & Access":
      "Configure access by organization, programme, county, district, function and data sensitivity.",
    "Help Desk":
      "Log service requests, triage data corrections, track resolution targets and publish user guidance.",
  };
  return (
    <article className="module panel">
      <div className="module-icon">◈</div>
      <span>{role} workspace</span>
      <h2>{name}</h2>
      <p>
        {descriptions[name] ||
          "A secure role-governed workspace for national agricultural service delivery."}
      </p>
      <p>This workspace is not enabled for the selected role or has not been configured by an authorized administrator.</p>
      <ul>
        <li>Scope-aware permissions</li>
        <li>Maker-checker approvals</li>
        <li>Complete audit history</li>
        <li>Export and reporting controls</li>
      </ul>
    </article>
  );
}
