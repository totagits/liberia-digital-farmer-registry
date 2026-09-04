"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Rel = {
  id: number;
  fromPartyId: string;
  toPartyId: string;
  relationshipType: string;
  roleTitle: string;
  status: string;
};
type Resource = {
  id: number;
  resourceType: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  capacity: string;
  county: string;
  status: string;
};
type Activity = {
  id: number;
  activityType: string;
  programme: string;
  commodity: string;
  volume: number;
  unit: string;
  value: number;
  currency: string;
  counterparty: string;
  activityDate: string;
  status: string;
};
type Doc = {
  id: number;
  documentType: string;
  documentNumber: string;
  issuedBy: string;
  expiryDate: string;
  verificationStatus: string;
  fileName: string;
};
type PartyAudit={id:number;actor:string;action:string;details:string;createdAt:string};
type Party = {
  id: number;
  partyId: string;
  partyType: string;
  legalName: string;
  acronym: string;
  legalForm: string;
  registrationNumber: string;
  taxId: string;
  establishedDate: string;
  representativeName: string;
  phone: string;
  email: string;
  county: string;
  district: string;
  community: string;
  memberCount: number;
  womenMembers: number;
  youthMembers: number;
  primaryCommodity: string;
  verificationStatus: string;
  status: string;
  metadata: Record<string, any>;
  relationships: Rel[];
  resources: Resource[];
  activities: Activity[];
  documents: Doc[];
  audits: PartyAudit[];
};
const types = [
  "Farmer group / informal association",
  "Cooperative",
  "Producer organization",
  "Agribusiness enterprise",
  "Service provider",
  "Supplier",
  "Financial institution",
];
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
    "Fuamah",
    "Jorquelleh",
    "Kokoyah",
    "Panta",
    "Salala",
    "Suakoko",
    "Zota",
  ],
  Gbarpolu: ["Belleh", "Bokomu", "Bopolu", "Gbarma", "Kongba"],
  "Grand Bassa": [
    "District 1",
    "District 2",
    "District 3",
    "District 4",
    "Neekreen",
    "Owensgrove",
    "St. John River",
  ],
  "Grand Cape Mount": ["Garwula", "Gola Konneh", "Porkpa", "Tewor"],
  "Grand Gedeh": ["Gbarzon", "Gbao", "Konobo", "Tchien"],
  "Grand Kru": [
    "Barclayville",
    "Buah",
    "Dorbor",
    "Garraway",
    "Grand Cess Wedabo",
    "Sasstown",
  ],
  Lofa: ["Foya", "Kolahun", "Quardu Gboni", "Salayea", "Voinjama", "Zorzor"],
  Margibi: ["Firestone", "Gibi", "Kakata", "Mambah-Kaba"],
  Maryland: ["Barrobo", "Harper", "Karlway", "Pleebo-Sodoken"],
  Montserrado: ["Careysburg", "Greater Monrovia", "St. Paul River", "Todee"],
  Nimba: [
    "Buu-Yao",
    "Doe",
    "Garr Bain",
    "Gbehlay-Geh",
    "Gbor",
    "Sanniquellie-Mahn",
    "Twan River",
    "Yarmein",
  ],
  "River Cess": [
    "Central River Cess",
    "Doedain",
    "Fen River",
    "Jo River",
    "Norwein",
  ],
  "River Gee": ["Chedepo", "Gbeapo", "Glaro", "Karforh", "Potupo", "Webbo"],
  Sinoe: [
    "Butaw",
    "Dugbe River",
    "Greenville",
    "Jaedae",
    "Juarzon",
    "Kpayan",
    "Sanquin 1",
  ],
};
const commodities = [
  "Rice",
  "Cassava",
  "Maize",
  "Cocoa",
  "Coffee",
  "Oil palm",
  "Rubber",
  "Plantain",
  "Vegetables",
  "Pepper",
  "Carrot",
  "Cucumber",
  "Livestock",
  "Fisheries",
  "Farm services",
  "Multi-commodity",
];

export default function PartyRegistry({
  notify,
  registrationRequest,
  canRegister,
  canVerify,
}: {
  notify: (s: string) => void;
  registrationRequest: {id:number;type:string};
  canRegister: boolean;
  canVerify: boolean;
}) {
  const [rows, setRows] = useState<Party[]>([]),
    [selected, setSelected] = useState<Party | null>(null),
    [modal, setModal] = useState(false),
    [step, setStep] = useState(1),
    [tab, setTab] = useState("Profile"),
    [workspaceTab, setWorkspaceTab] = useState("Organizations"),
    [type, setType] = useState(""),
    [q, setQ] = useState(""),
    [county, setCounty] = useState("Bomi"),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(false),
    [add, setAdd] = useState<"relationship" | "resource" | "activity" | "document" | null>(
      null,
    ),
    [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(()=>{
    if(!registrationRequest.id)return;
    const mapped=registrationRequest.type==="Farmer group"?"Farmer group / informal association":registrationRequest.type==="Agribusiness"?"Agribusiness enterprise":registrationRequest.type;
    setDraft({partyType:mapped});
    setStep(1);
    setModal(true);
  },[registrationRequest.id]);
  const load = async () => {
    const r = await fetch(
      `/api/parties?${type ? `type=${encodeURIComponent(type)}&` : ""}q=${encodeURIComponent(q)}`,
    ).then((x) => x.json());
    setRows(Array.isArray(r) ? r : []);
    if (selected) {
      const n = r.find((x: Party) => x.partyId === selected.partyId);
      if (n) setSelected(n);
    }
  };
  useEffect(() => {
    load();
  }, [type]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);
  const stats = useMemo(
    () => ({
      entities: rows.length,
      members: rows.reduce((s, r) => s + r.memberCount, 0),
      women: rows.reduce((s, r) => s + r.womenMembers, 0),
      verified: rows.filter((r) => r.verificationStatus === "Verified").length,
    }),
    [rows],
  );
  const displayRows=useMemo(()=>{
    const duplicateIds=new Set(rows.filter((r,i)=>rows.some((x,j)=>i!==j&&((r.registrationNumber&&r.registrationNumber===x.registrationNumber)||r.legalName.trim().toLowerCase()===x.legalName.trim().toLowerCase()))).map(r=>r.partyId));
    if(workspaceTab==="Duplicate review")return rows.filter(r=>duplicateIds.has(r.partyId));
    if(workspaceTab==="Verification queue")return rows.filter(r=>r.verificationStatus!=="Verified");
    if(workspaceTab==="Compliance alerts")return rows.filter(r=>r.documents.some(d=>d.expiryDate&&new Date(d.expiryDate)<new Date())||!r.registrationNumber);
    if(workspaceTab==="Farms & facilities")return rows.filter(r=>r.resources.length>0);
    if(workspaceTab==="Production & markets")return rows.filter(r=>r.activities.length>0);
    return rows;
  },[rows,workspaceTab]);
  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = {
      ...draft,
      ...Object.fromEntries(new FormData(e.currentTarget)),
      county,
    };
    const r = await fetch("/api/parties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const b = await r.json();
    setBusy(false);
    if (!r.ok) {
      notify(b.error || "Registration failed");
      return;
    }
    setModal(false);
    setStep(1);
    setDraft({});
    notify(`${b.partyId} created and queued for verification.`);
    await load();
  }
  async function verify(status: string) {
    if (!selected) return;
    await fetch("/api/parties", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        partyId: selected.partyId,
        verificationStatus: status,
      }),
    });
    notify(`Organization marked ${status}.`);
    await load();
  }
  async function addRecord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected || !add) return;
    const body = {
      ...Object.fromEntries(new FormData(e.currentTarget)),
      partyId: selected.partyId,
      recordType: add,
    };
    const r = await fetch("/api/parties/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      notify(`${add} saved to ${selected.partyId}.`);
      setAdd(null);
      await load();
    }
  }
  async function editProfile(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!selected)return;
    const body={partyId:selected.partyId,...Object.fromEntries(new FormData(e.currentTarget))};
    const r=await fetch("/api/parties",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    if(!r.ok){notify((await r.json()).error||"Profile update failed.");return}
    setEditing(false);notify(`${selected.partyId} profile updated with audit evidence.`);await load();
  }
  function exportOrganizations(){
    const header=["Organization ID","Type","Legal name","Registration number","Tax ID","County","District","Members","Commodity","Verification"];
    const lines=[header,...displayRows.map(r=>[r.partyId,r.partyType,r.legalName,r.registrationNumber,r.taxId,r.county,r.district,String(r.memberCount),r.primaryCommodity,r.verificationStatus])];
    const csv=lines.map(row=>row.map(v=>`"${String(v||"").replaceAll('"','""')}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`dfr-organizations-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);notify("Authorized organization view exported.");
  }
  return (
    <div className="party-workspace">
      <div className="party-summary">
        <article>
          <span>Registered entities</span>
          <b>{stats.entities}</b>
          <small>
            Across {new Set(rows.map((r) => r.county)).size} counties
          </small>
        </article>
        <article>
          <span>Linked membership</span>
          <b>{stats.members.toLocaleString()}</b>
          <small>{stats.women.toLocaleString()} women members</small>
        </article>
        <article>
          <span>Verified profiles</span>
          <b>{stats.verified}</b>
          <small>
            {rows.length ? Math.round((stats.verified / rows.length) * 100) : 0}
            % approval rate
          </small>
        </article>
        <article>
          <span>Managed resources</span>
          <b>{rows.reduce((s, r) => s + r.resources.length, 0)}</b>
          <small>Farms, facilities & equipment</small>
        </article>
      </div>
      <nav className="party-workspace-tabs" aria-label="Organization registry workspaces">
        {["Organizations","Verification queue","Duplicate review","Compliance alerts","Farms & facilities","Production & markets"].map(x=>{const duplicateCount=rows.filter((r,i)=>rows.some((y,j)=>i!==j&&((r.registrationNumber&&r.registrationNumber===y.registrationNumber)||r.legalName.trim().toLowerCase()===y.legalName.trim().toLowerCase()))).length;const count=x==="Organizations"?rows.length:x==="Verification queue"?rows.filter(r=>r.verificationStatus!=="Verified").length:x==="Duplicate review"?duplicateCount:x==="Compliance alerts"?rows.filter(r=>r.documents.some(d=>d.expiryDate&&new Date(d.expiryDate)<new Date())||!r.registrationNumber).length:x==="Farms & facilities"?rows.reduce((s,r)=>s+r.resources.length,0):rows.reduce((s,r)=>s+r.activities.length,0);return <button key={x} className={workspaceTab===x?"active":""} onClick={()=>setWorkspaceTab(x)}>{x}<b>{count}</b></button>})}
      </nav>
      <article className="panel party-index">
        <div className="party-toolbar">
          <div>
            <span>Unified Party and Organization Registry</span>
            <h3>Organizations, households and service actors</h3>
          </div>
          <div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ID, name, county…"
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All entity types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button className="secondary-party-action" onClick={exportOrganizations}>↓ Export view</button>
            {canRegister && <button onClick={()=>{setDraft({});setStep(1);setModal(true)}}>＋ Register organization</button>}
          </div>
        </div>
        <div className="entity-cards">
          {displayRows.map((r) => (
            <button
              key={r.partyId}
              onClick={() => {
                setSelected(r);
                setTab("Profile");
              }}
            >
              <i>
                {r.partyType.includes("Cooperative")
                  ? "CO"
                  : r.partyType.includes("Agribusiness")
                    ? "AB"
                    : r.partyType.includes("Producer")
                      ? "PO"
                      : r.partyType.includes("Service")
                        ? "SP"
                        : "FG"}
              </i>
              <div>
                <b>{r.legalName}</b>
                <span>
                  {r.partyId} · {r.partyType}
                </span>
                <small>
                  {r.county} / {r.district} · {r.memberCount} members ·{" "}
                  {r.primaryCommodity}
                </small>
              </div>
              <em
                className={
                  r.verificationStatus === "Verified" ? "verified" : "pending"
                }
              >
                {r.verificationStatus}
              </em>
              <strong>›</strong>
            </button>
          ))}
          {!displayRows.length&&<div className="party-empty-state"><i>{workspaceTab==="Organizations"?"OR":workspaceTab.slice(0,2).toUpperCase()}</i><div><h3>{workspaceTab==="Organizations"?"No organization profile has been registered":`No records in ${workspaceTab.toLowerCase()}`}</h3><p>{workspaceTab==="Organizations"?"Create a persistent organization profile to begin managing members, officers, certification, farms, facilities, production, programmes and transactions.":"This governed queue will populate from organization profiles and their linked records."}</p></div>{canRegister&&workspaceTab==="Organizations"&&<button onClick={()=>{setDraft({});setStep(1);setModal(true)}}>Register first organization</button>}</div>}
        </div>
      </article>
      {modal && (
        <div className="modal-wrap">
          <form
            className="party-wizard glass"
            onSubmit={register}
            onChange={(e) => {
              const x = e.target as
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLTextAreaElement;
              if (x.name) setDraft((d) => ({ ...d, [x.name]: x.value }));
            }}
          >
            <header>
              <div>
                <span>Register once, use many times</span>
                <h2>New party or organization</h2>
              </div>
              <button type="button" onClick={() => setModal(false)}>
                ×
              </button>
            </header>
            <div className="wizard-steps">
              {[
                "Entity type",
                "Legal identity",
                "Location",
                "Structure",
                "Review",
              ].map((s, i) => (
                <i
                  className={
                    step === i + 1 ? "active" : step > i + 1 ? "done" : ""
                  }
                  key={s}
                >
                  <b>{step > i + 1 ? "✓" : i + 1}</b>
                  {s}
                </i>
              ))}
            </div>
            {step === 1 && (
              <section>
                <h3>What are you registering?</h3>
                <p>
                  This choice determines governance, compliance and verification
                  rules.
                </p>
                <div className="type-grid">
                  {types.map((t) => (
                    <label key={t}>
                      <input type="radio" name="partyType" value={t} defaultChecked={draft.partyType===t} required />
                      <b>{t}</b>
                      <span>{typeHelp(t)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}
            {step === 2 && (
              <section>
                <h3>Legal identity and compliance</h3>
                <div className="form-grid">
                  <label>
                    Legal or recognized name*
                    <input name="legalName" required />
                  </label>
                  <label>
                    Acronym
                    <input name="acronym" />
                  </label>
                  <label>
                    Legal form*
                    <select name="legalForm" required>
                      <option>Informal / community-based</option>
                      <option>Registered cooperative</option>
                      <option>Association / NGO</option>
                      <option>Company limited by shares</option>
                      <option>Business name / sole proprietor</option>
                      <option>Public institution</option>
                    </select>
                  </label>
                  <label>
                    Registration number
                    <input name="registrationNumber" />
                  </label>
                  <label>
                    Tax identification number
                    <input name="taxId" />
                  </label>
                  <label>
                    Date established
                    <input name="establishedDate" type="date" />
                  </label>
                </div>
                <TypeSpecificCompliance type={draft.partyType||""}/>
              </section>
            )}
            {step === 3 && (
              <section>
                <h3>Representative and operating location</h3>
                <div className="form-grid">
                  <label>
                    Authorized representative*
                    <input name="representativeName" required />
                  </label>
                  <label>
                    Phone*
                    <input name="phone" required />
                  </label>
                  <label>
                    Email
                    <input name="email" type="email" />
                  </label>
                  <label>
                    County*
                    <select
                      name="county"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                    >
                      {counties.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    District*
                    <select name="district">
                      {(districts[county] || []).map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Community / town*
                    <input name="community" required />
                  </label>
                </div>
                <TypeSpecificStructure type={draft.partyType||""}/>
              </section>
            )}
            {step === 4 && (
              <section>
                <h3>Membership, governance and economic profile</h3>
                <div className="form-grid">
                  <label>
                    Total members / employees
                    <input name="memberCount" type="number" min="0" />
                  </label>
                  <label>
                    Women members
                    <input name="womenMembers" type="number" min="0" />
                  </label>
                  <label>
                    Youth members
                    <input name="youthMembers" type="number" min="0" />
                  </label>
                  <label>
                    Primary commodity*
                    <select name="primaryCommodity">
                      {commodities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Governance body
                    <input
                      name="governanceBody"
                      placeholder="Board, management committee…"
                    />
                  </label>
                  <label>
                    Core services
                    <input
                      name="services"
                      placeholder="Aggregation, processing, inputs…"
                    />
                  </label>
                  <label className="wide">
                    Facilities and operating capacity
                    <textarea
                      name="facilitySummary"
                      placeholder="Processing units, warehouses, offices, equipment…"
                    />
                  </label>
                </div>
              </section>
            )}
            {step === 5 && (
              <section className="wizard-review">
                <h3>Consent and submission</h3>
                <div>
                  <b>Verification pathway</b>
                  <span>
                    Duplicate screening → document review → field verification →
                    authorized approval
                  </span>
                </div>
                <div>
                  <b>Persistent relationships</b>
                  <span>
                    After creation, link members, officers, households, farms,
                    parcels, facilities, equipment, programmes and transactions.
                  </span>
                </div>
                <label>
                  <input type="checkbox" required /> I confirm authority to
                  submit this entity record and consent to authorized registry
                  processing.
                </label>
              </section>
            )}
            <footer>
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
              >
                ← Back
              </button>
              {step < 5 ? (
                <button type="button" onClick={() => setStep(step + 1)}>
                  Continue →
                </button>
              ) : (
                <button disabled={busy}>
                  {busy ? "Creating…" : "Create persistent profile"}
                </button>
              )}
            </footer>
          </form>
        </div>
      )}
      {selected && (
        <div
          className="drawer-wrap"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setSelected(null);
          }}
        >
          <aside className="party-drawer">
            <header>
              <div>
                <span>{selected.partyType}</span>
                <h2>{selected.legalName}</h2>
                <p>
                  {selected.partyId} · {selected.county}
                </p>
              </div>
              <button onClick={() => setSelected(null)}>×</button>
            </header>
            <div className="drawer-status">
              <span
                className={
                  selected.verificationStatus === "Verified"
                    ? "verified"
                    : "pending"
                }
              >
                {selected.verificationStatus}
              </span>
              {canVerify&&<button onClick={() => verify("Verified")}>Verify</button>}
              {canVerify&&<button onClick={() => verify("Needs correction")}>Return</button>}
              {canRegister&&<button onClick={()=>setEditing(true)}>Edit profile</button>}
            </div>
            <nav>
              {[
                "Profile",
                "Members & officers",
                "Assets",
                "Production & markets",
                "Documents",
                "Programmes & services",
                "Audit history",
              ].map((t) => (
                <button
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                  key={t}
                >
                  {t}
                </button>
              ))}
            </nav>
            <section>{detailTab(selected, tab, setAdd, canRegister)}</section>
          </aside>
        </div>
      )}
      {add && selected && (
        <div className="modal-wrap">
          <form className="mini-modal glass" onSubmit={addRecord}>
            <header>
              <h3>Add {add}</h3>
              <button type="button" onClick={() => setAdd(null)}>
                ×
              </button>
            </header>
            {add === "relationship" && (
              <>
                <label>
                  Related party / DFR ID
                  <input name="toPartyId" required />
                </label>
                <label>
                  Relationship
                  <select name="relationshipType">
                    <option>Member</option>
                    <option>Officer</option>
                    <option>Board member</option>
                    <option>Household representative</option>
                    <option>Service provider</option>
                    <option>Programme participant</option>
                  </select>
                </label>
                <label>
                  Role / title
                  <input name="roleTitle" />
                </label>
              </>
            )}
            {add === "resource" && (
              <>
                <label>
                  Resource type
                  <select name="resourceType">
                    <option>Farm / parcel</option>
                    <option>Facility</option>
                    <option>Equipment</option>
                    <option>Processing unit</option>
                    <option>Warehouse</option>
                    <option>Office</option>
                  </select>
                </label>
                <label>
                  Name
                  <input name="name" required />
                </label>
                <label>
                  Category
                  <input name="category" />
                </label>
                <label>
                  Quantity
                  <input name="quantity" type="number" step="any" />
                </label>
                <label>
                  Unit / capacity
                  <input name="capacity" />
                </label>
                <label>
                  County
                  <input name="county" defaultValue={selected.county} />
                </label>
              </>
            )}
            {add === "activity" && (
              <>
                <label>
                  Activity
                  <select name="activityType">
                    <option>Production</option>
                    <option>Market transaction</option>
                    <option>Programme participation</option>
                    <option>Service received</option>
                    <option>Voucher redemption</option>
                    <option>Input distribution</option>
                    <option>Payment transaction</option>
                  </select>
                </label>
                <label>
                  Commodity
                  <input name="commodity" />
                </label>
                <label>Programme / service<input name="programme" /></label>
                <label>Counterparty<input name="counterparty" /></label>
                <label>
                  Volume
                  <input name="volume" type="number" step="any" />
                </label>
                <label>
                  Unit
                  <input name="unit" />
                </label>
                <label>
                  Value
                  <input name="value" type="number" step="any" />
                </label>
                <label>
                  Date
                  <input name="activityDate" type="date" required />
                </label>
                <label>Status<select name="status"><option>Recorded</option><option>Pending verification</option><option>Verified</option><option>Completed</option></select></label>
              </>
            )}
            {add === "document"&&<><label>Document type<select name="documentType"><option>CDA certificate</option><option>Business registration</option><option>Tax clearance</option><option>Operating licence</option><option>Constitution / bylaws</option><option>Board resolution</option><option>Sector accreditation</option><option>Other compliance document</option></select></label><label>Document / certificate number<input name="documentNumber"/></label><label>Issued by<input name="issuedBy"/></label><label>Issue date<input name="issueDate" type="date"/></label><label>Expiry date<input name="expiryDate" type="date"/></label><label>File reference<input name="fileName" placeholder="Approved repository filename or reference"/></label></>}
            <footer>
              <button type="button" onClick={() => setAdd(null)}>
                Cancel
              </button>
              <button>Save record</button>
            </footer>
          </form>
        </div>
      )}
      {editing&&selected&&<div className="modal-wrap"><form className="mini-modal glass" onSubmit={editProfile}><header><h3>Edit organization profile</h3><button type="button" onClick={()=>setEditing(false)}>×</button></header><label>Legal / recognized name<input name="legalName" defaultValue={selected.legalName} required/></label><label>Authorized representative<input name="representativeName" defaultValue={selected.representativeName}/></label><label>Phone<input name="phone" defaultValue={selected.phone}/></label><label>Email<input name="email" type="email" defaultValue={selected.email}/></label><label>Primary commodity<input name="primaryCommodity" defaultValue={selected.primaryCommodity}/></label><footer><button type="button" onClick={()=>setEditing(false)}>Cancel</button><button>Save governed update</button></footer></form></div>}
    </div>
  );
}
function typeHelp(t: string) {
  if (t.includes("Cooperative"))
    return "Membership, board, bylaws, capital and shared assets";
  if (t.includes("Agribusiness"))
    return "Ownership, registration, facilities, capacity and markets";
  if (t.includes("Producer"))
    return "Member organizations, commodities and aggregation services";
  if (t.includes("Financial"))
    return "Licensed provider, accounts and payment services";
  if (t.includes("programme"))
    return "Programme owner, coverage, eligibility and service cycles";
  return "Membership, leadership, location and economic activities";
}
function TypeSpecificCompliance({type}:{type:string}){
  if(type==="Cooperative")return <div className="type-specific-panel"><h4>CDA registration and certification</h4><div className="form-grid"><label>CDA certificate number*<input name="cdaCertificateNumber" required/></label><label>Certificate status<select name="certificationStatus"><option>Pending validation</option><option>Provisional</option><option>Active</option><option>Expired</option></select></label><label>Certificate issue date<input name="certificateIssueDate" type="date"/></label><label>Certificate expiry date<input name="certificateExpiryDate" type="date"/></label></div></div>;
  if(type==="Agribusiness enterprise"||type==="Supplier"||type==="Service provider")return <div className="type-specific-panel"><h4>Business licences and operating compliance</h4><div className="form-grid"><label>MoCI business licence number*<input name="businessLicenseNumber" required/></label><label>Licence expiry date<input name="businessLicenseExpiry" type="date"/></label><label>Sector permit / accreditation<input name="sectorPermit"/></label><label>Permit issuing authority<input name="permitAuthority"/></label></div></div>;
  if(type==="Financial institution")return <div className="type-specific-panel"><h4>Financial-sector authorization</h4><div className="form-grid"><label>Central Bank licence number*<input name="cbLLicenseNumber" required/></label><label>Licence category<select name="financialLicenseCategory"><option>Commercial bank</option><option>Rural community finance institution</option><option>Microfinance institution</option><option>Mobile money operator / PSP</option><option>Credit union</option></select></label><label>SWIFT / institution code<input name="institutionCode"/></label><label>Licence expiry date<input name="financialLicenseExpiry" type="date"/></label></div></div>;
  return <div className="type-specific-panel"><h4>Constitution and recognition</h4><div className="form-grid"><label>Constitution / bylaws reference<input name="constitutionReference"/></label><label>Recognizing authority<input name="recognizingAuthority" placeholder="MoA, county, district or community authority"/></label></div></div>;
}
function TypeSpecificStructure({type}:{type:string}){
  if(type==="Cooperative"||type==="Producer organization"||type.includes("group"))return <div className="type-specific-panel"><h4>Membership and governance controls</h4><div className="form-grid"><label>Board / executive officers<input name="boardMembers" type="number" min="0"/></label><label>Households represented<input name="householdsRepresented" type="number" min="0"/></label><label>General assembly frequency<select name="assemblyFrequency"><option>Monthly</option><option>Quarterly</option><option>Biannual</option><option>Annual</option></select></label><label>Member register maintained<select name="memberRegisterStatus"><option>Yes — current</option><option>Yes — requires update</option><option>No</option></select></label></div></div>;
  return <div className="type-specific-panel"><h4>Operational capacity</h4><div className="form-grid"><label>Permanent employees<input name="employees" type="number" min="0"/></label><label>Service counties<input name="serviceCounties" placeholder="List counties separated by commas"/></label><label>Processing / storage capacity<input name="processingCapacity"/></label><label>Active service points<input name="servicePoints" type="number" min="0"/></label></div></div>;
}
function detailTab(
  p: Party,
  tab: string,
  setAdd: (x: "relationship" | "resource" | "activity" | "document") => void,
  canRegister: boolean,
) {
  if (tab === "Profile")
    return (
      <div className="profile-grid">
        <Info l="Legal form" v={p.legalForm} />
        <Info l="Registration no." v={p.registrationNumber || "Not recorded"} />
        <Info l="Tax ID" v={p.taxId || "Not recorded"} />
        <Info l="Representative" v={p.representativeName} />
        <Info l="Contact" v={`${p.phone} ${p.email}`} />
        <Info l="Location" v={`${p.community}, ${p.district}, ${p.county}`} />
        <Info
          l="Membership"
          v={`${p.memberCount} total · ${p.womenMembers} women · ${p.youthMembers} youth`}
        />
        <Info l="Primary commodity" v={p.primaryCommodity} />
        <Info l="Governance body" v={String(p.metadata?.governance||"Not recorded")} />
        <Info l="Operating capacity" v={String(p.metadata?.processingCapacity||p.metadata?.facilitySummary||"Not recorded")} />
      </div>
    );
  if (tab === "Members & officers")
    return (
      <RecordList
        title="Linked people, households and organizations"
        action={canRegister ? () => setAdd("relationship") : undefined}
        rows={p.relationships.map((x) => [
          x.relationshipType,
          x.toPartyId,
          x.roleTitle || x.status,
        ])}
      />
    );
  if (tab === "Assets")
    return (
      <RecordList
        title="Farms, parcels, facilities and equipment"
        action={canRegister ? () => setAdd("resource") : undefined}
        rows={p.resources.map((x) => [
          x.resourceType,
          x.name,
          `${x.quantity || ""} ${x.unit || x.capacity} · ${x.status}`,
        ])}
      />
    );
  if (tab === "Production & markets")
    return (
      <RecordList
        title="Production, aggregation and market records"
        action={canRegister ? () => setAdd("activity") : undefined}
        rows={p.activities.map((x) => [
          x.activityType,
          x.commodity || x.programme,
          `${x.volume} ${x.unit} · ${x.currency} ${x.value.toLocaleString()}`,
        ])}
      />
    );
  if (tab === "Documents")
    return (
      <RecordList
        title="Registration, tax, bylaws and certification"
        action={canRegister?()=>setAdd("document"):undefined}
        rows={p.documents.map((x) => [
          x.documentType,
          x.documentNumber,
          `${x.verificationStatus}${x.expiryDate?` · expires ${x.expiryDate}`:""}`,
        ])}
      />
    );
  if(tab==="Audit history")return <RecordList title="Organization-specific audit evidence" rows={(p.audits||[]).map(x=>[x.action,x.actor,`${x.createdAt} · ${x.details}`])}/>;
  return (
    <RecordList
      title="Programmes, services, vouchers and transactions"
      action={canRegister ? () => setAdd("activity") : undefined}
      rows={p.activities
        .filter(
          (x) =>
            x.programme ||
            x.activityType.includes("Programme") ||
            x.activityType.includes("Service"),
        )
        .map((x) => [x.activityType, x.programme, x.status])}
    />
  );
}
function Info({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <span>{l}</span>
      <b>{v}</b>
    </div>
  );
}
function RecordList({
  title,
  rows,
  action,
}: {
  title: string;
  rows: string[][];
  action?: () => void;
}) {
  return (
    <div className="record-list">
      <header>
        <h3>{title}</h3>
        {action && <button onClick={action}>＋ Add record</button>}
      </header>
      {rows.length ? (
        rows.map((r, i) => (
          <div key={i}>
            <i>{r[0].slice(0, 2).toUpperCase()}</i>
            <p>
              <b>{r[1]}</b>
              <span>
                {r[0]} · {r[2]}
              </span>
            </p>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <b>No linked records yet</b>
          <span>
            Add the first authorized record to this persistent profile.
          </span>
        </div>
      )}
    </div>
  );
}
