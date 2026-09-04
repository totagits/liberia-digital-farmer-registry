"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Farmer={id:number;dfrId:string;firstName:string;lastName:string;county:string;gender:string;farmSize:number;status:string};
type Row=Record<string,any>;
function exportCounty(rows:Record<string,unknown>[]){const keys=Object.keys(rows[0]||{county:"",farmers:0,women:0,ha:0,verified:0});const q=(v:unknown)=>`"${String(v??"").replaceAll('"','""')}"`;const csv=[keys.join(","),...rows.map(r=>keys.map(k=>q(r[k])).join(","))].join("\n");const u=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));const a=document.createElement("a");a.href=u;a.download="county-registry-analytics.csv";a.click();URL.revokeObjectURL(u)}
const moduleType:Record<string,string>={"Households":"households","Programme Applications":"applications","Mobile Money":"payments","Vouchers & Inputs":"vouchers","Grievances":"grievances"};

export default function OperationsModule({name,farmers,notify}:{name:string;farmers:Farmer[];notify:(x:string)=>void}){
  const type=moduleType[name]; const [rows,setRows]=useState<Row[]>([]); const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false);
  const load=async()=>{const r=await fetch(`/api/operations?type=${type}`).then(x=>x.json());setRows(Array.isArray(r)?r:[])}; useEffect(()=>{if(type)load()},[type]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);const body={type,...Object.fromEntries(new FormData(e.currentTarget))};const r=await fetch("/api/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});setBusy(false);if(r.ok){setOpen(false);notify(`${name} record created successfully.`);load()}else notify("The record could not be created.")}
  async function update(id:number,status:string){await fetch("/api/operations",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({type,id,status})});notify(`Status updated to ${status}.`);load()}
  const counts=useMemo(()=>({total:rows.length,active:rows.filter(r=>["Active","Approved","Verified","Issued","Eligible"].includes(r.status)).length,pending:rows.filter(r=>["Submitted","Pending verification","Open","In review"].includes(r.status)).length}),[rows]);
  return <><div className="metric-grid operation-metrics"><MetricMini label={`Total ${name.toLowerCase()}`} value={counts.total}/><MetricMini label="Active / approved" value={counts.active}/><MetricMini label="Awaiting action" value={counts.pending}/><MetricMini label="Counties represented" value={new Set(rows.map(r=>r.county).filter(Boolean)).size}/></div><article className="panel registry operations-panel"><div className="table-tools"><div><b>{name} management</b><span>Persistent, role-governed records and approval history</span></div><button className="new-record" onClick={()=>setOpen(true)}>＋ New record</button></div><OperationTable type={type} rows={rows} update={update}/></article>{open&&<div className="modal-wrap"><form className="register-modal glass compact-modal" onSubmit={submit}><div className="modal-head"><div><span>Governed workflow</span><h2>New {name} record</h2></div><button type="button" onClick={()=>setOpen(false)}>×</button></div><OperationFields type={type} farmers={farmers}/><div className="modal-actions"><button type="button" onClick={()=>setOpen(false)}>Cancel</button><button disabled={busy}>{busy?"Saving…":"Save record →"}</button></div></form></div>}</>;
}
function MetricMini({label,value}:{label:string,value:number}){return <article className="metric glass"><div><span>{label}</span><strong>{value}</strong><small>Current authorized scope</small></div><i>◈</i></article>}
function FarmerSelect({farmers}:{farmers:Farmer[]}){return <label>Farmer / DFR ID*<select name="farmerDfrId" required>{farmers.map(f=><option value={f.dfrId} key={f.dfrId}>{f.dfrId} · {f.firstName} {f.lastName}</option>)}</select></label>}
function OperationFields({type,farmers}:{type:string;farmers:Farmer[]}){const cs=[...new Set(farmers.map(f=>f.county))];return <div className="form-grid operation-form"><FarmerSelect farmers={farmers}/>{type==="households"&&<><label>Household representative*<input name="representative" required/></label><label>County*<select name="county">{cs.map(c=><option key={c}>{c}</option>)}</select></label><label>Total members*<input name="members" type="number" min="1" required/></label><label>Female members<input name="femaleMembers" type="number" min="0" defaultValue="0"/></label><label>Youth members<input name="youthMembers" type="number" min="0" defaultValue="0"/></label><label>Members with disabilities<input name="disabledMembers" type="number" min="0" defaultValue="0"/></label><label>Dependants<input name="dependants" type="number" min="0" defaultValue="0"/></label></>}{type==="applications"&&<><label>Programme*<select name="programme"><option>Climate-Smart Inputs 2026</option><option>Smallholder Mechanization Support</option><option>Women & Youth Agribusiness Grant</option><option>Cocoa Rehabilitation Support</option><option>Emergency Livelihood Assistance</option></select></label><label>County*<select name="county">{cs.map(c=><option key={c}>{c}</option>)}</select></label><label className="full-field">Requested assistance*<textarea name="requestedSupport" required/></label><label>Eligibility score<input name="eligibilityScore" type="number" min="0" max="100" defaultValue="0"/></label></>}{type==="payments"&&<><label>Provider*<select name="provider"><option>MTN MoMo</option><option>Orange Money</option><option>Commercial bank</option></select></label><label>Account name*<input name="accountName" required/></label><label>Account / mobile number*<input name="accountNumber" required inputMode="numeric"/></label></>}{type==="vouchers"&&<><label>Programme*<input name="programme" required/></label><label>Voucher category*<select name="category"><option>Seed and fertilizer</option><option>Tools and equipment</option><option>Mechanization service</option><option>Veterinary service</option><option>Training service</option></select></label><label>Value*<input name="value" type="number" min="0" step=".01" required/></label><label>Currency<select name="currency"><option>USD</option><option>LRD</option></select></label><label>Expiry date*<input name="expiresAt" type="date" required/></label></>}{type==="grievances"&&<><label>Category*<select name="category"><option>Record correction</option><option>Registration delay</option><option>Eligibility decision</option><option>Voucher or input delivery</option><option>Payment issue</option><option>Staff conduct</option><option>Data privacy</option></select></label><label>Channel*<select name="channel"><option>Help desk</option><option>Call centre</option><option>USSD / SMS</option><option>County office</option><option>Web portal</option></select></label><label>County*<select name="county">{cs.map(c=><option key={c}>{c}</option>)}</select></label><label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Safeguarding</option></select></label><label className="full-field">Description*<textarea name="description" required/></label></>}</div>}
function OperationTable({type,rows,update}:{type:string;rows:Row[];update:(id:number,s:string)=>void}){
  const [selected, setSelected] = useState<Row | null>(null);
  const cols:Record<string,[string,string][]>={households:[["householdId","Household ID"],["representative","Representative"],["farmerDfrId","DFR ID"],["county","County"],["members","Members"],["femaleMembers","Women / girls"],["youthMembers","Youth"],["status","Status"]],applications:[["applicationId","Application"],["farmerDfrId","DFR ID"],["programme","Programme"],["county","County"],["eligibilityScore","Score"],["status","Status"]],payments:[["farmerDfrId","DFR ID"],["provider","Provider"],["accountName","Account name"],["accountNumberMasked","Protected number"],["status","Status"]],vouchers:[["voucherCode","Voucher"],["farmerDfrId","DFR ID"],["category","Entitlement"],["value","Value"],["status","Status"],["expiresAt","Expires"]],grievances:[["ticketId","Ticket"],["farmerDfrId","DFR ID"],["category","Category"],["county","County"],["priority","Priority"],["status","Status"]]};
  const c=cols[type]||[];
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{c.map(x=><th key={x[0]}>{x[1]}</th>)}<th>Workflow</th></tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id}>
                {c.map(x=><td key={x[0]}>{x[0]==="value"?`${r.currency} ${Number(r[x[0]]).toFixed(2)}`:String(r[x[0]]??"")}</td>)}
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {type==="applications"&&r.status!=="Approved"?(
                      <button className="approve" onClick={()=>update(r.id,"Approved")}>Approve</button>
                    ):type==="payments"&&r.status!=="Verified"?(
                      <button className="approve" onClick={()=>update(r.id,"Verified")}>Verify</button>
                    ):type==="grievances"&&r.status!=="Resolved"?(
                      <button className="approve" onClick={()=>update(r.id,"Resolved")}>Resolve</button>
                    ):type==="vouchers"&&r.status==="Issued"?(
                      <button className="approve" onClick={()=>update(r.id,"Redeemed")}>Redeem</button>
                    ):null}
                    <button className="ghost" onClick={()=>setSelected(r)}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="modal-wrap" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null)}}>
          <div className="mini-modal glass" style={{ width: "min(560px, 94vw)", padding: 22 }}>
            <div className="modal-head" style={{ borderBottom: "1px solid #dce5da", paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#617d69", letterSpacing: "0.1em" }}>Record Details</span>
                <h3 style={{ margin: "4px 0", fontFamily: "Georgia, serif" }}>{selected.representative || selected.applicationId || selected.voucherCode || selected.ticketId || selected.farmerDfrId}</h3>
                <small style={{ color: "#78877e" }}>Status: <b style={{ color: "#1b4d32" }}>{selected.status}</b> · County: {selected.county || "National"}</small>
              </div>
              <button type="button" onClick={()=>setSelected(null)} style={{ border: 0, background: "#e8ede6", borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}>×</button>
            </div>
            <div className="profile-grid" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {Object.entries(selected).filter(([k]) => !["id"].includes(k)).map(([key, val]) => (
                <div key={key} style={{ background: "#fff", border: "1px solid #e0e7df", borderRadius: 8, padding: 10 }}>
                  <span style={{ fontSize: "8px", textTransform: "capitalize", color: "#808f86" }}>{key.replace(/([A-Z])/g, " $1")}</span>
                  <b style={{ fontSize: "10px", marginTop: 4, display: "block" }}>{String(val ?? "—")}</b>
                </div>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="button" onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function IdentityScreen({farmers,notify}:{farmers:Farmer[];notify:(x:string)=>void}){const [result,setResult]=useState<any>(null);const [history,setHistory]=useState<Row[]>([]);const load=()=>fetch("/api/operations?type=identity").then(r=>r.json()).then(r=>setHistory(Array.isArray(r)?r:[]));useEffect(load,[]);async function run(e:FormEvent<HTMLFormElement>){e.preventDefault();const b=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/identity-check",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)}).then(x=>x.json());setResult(r);notify("Duplicate screening completed and logged.");load()}return <div className="identity-grid"><form className="panel identity-form" onSubmit={run}><span>Layered identity screening</span><h3>Duplicate detection engine</h3><p>Screen exact phone identifiers and biographic name similarity against the national index before approval.</p><label>Farmer or pre-registration ID<select name="farmerDfrId"><option>Pre-registration</option>{farmers.map(f=><option key={f.dfrId}>{f.dfrId}</option>)}</select></label><label>Full legal name*<input name="name" required placeholder="Enter first and last name"/></label><label>Mobile number<input name="phone" placeholder="0770 000 000"/></label><button>Run protected screening →</button>{result&&<div className={`risk-card ${result.risk>=70?"high":"low"}`}><b>{result.risk}% risk</b><span>{result.outcome}</span><small>{result.matches.length} possible index match(es)</small></div>}</form><article className="panel registry"><div className="table-tools"><div><b>Screening history</b><span>Every check is retained for audit and review</span></div></div><div className="table-wrap"><table><thead><tr><th>DFR ID</th><th>Method</th><th>Risk</th><th>Outcome</th><th>Timestamp</th></tr></thead><tbody>{history.map(r=><tr key={r.id}><td><code>{r.farmerDfrId}</code></td><td>{r.checkType}</td><td><b>{r.riskScore}%</b></td><td>{r.outcome}</td><td>{r.createdAt}</td></tr>)}</tbody></table></div></article></div>}

export function OfflineSync({notify}:{notify:(x:string)=>void}){const [online,setOnline]=useState(true);const [queue,setQueue]=useState<any[]>([]);const refresh=()=>{setOnline(navigator.onLine);setQueue(JSON.parse(localStorage.getItem("dfr-offline-queue")||"[]"))};useEffect(()=>{refresh();addEventListener("online",refresh);addEventListener("offline",refresh);navigator.serviceWorker?.register("/sw.js");return()=>{removeEventListener("online",refresh);removeEventListener("offline",refresh)}},[]);async function sync(){if(!navigator.onLine)return notify("No network connection. Records remain encrypted on this device.");const left=[];for(const item of queue){try{const r=await fetch(item.url,{method:item.method,headers:{"content-type":"application/json"},body:JSON.stringify(item.body)});if(!r.ok)left.push(item)}catch{left.push(item)}}localStorage.setItem("dfr-offline-queue",JSON.stringify(left));setQueue(left);notify(left.length?`${left.length} record(s) still awaiting synchronization.`:"All field records synchronized successfully.")}return <div className="sync-grid"><article className="panel sync-hero"><div className={`network-orb ${online?"online":"offline"}`}>{online?"✓":"↯"}</div><span>Device connectivity</span><h2>{online?"Online and ready to synchronize":"Working securely offline"}</h2><p>Field records are retained on the device when connectivity is unavailable and sent to the national registry when a trusted connection returns.</p><button onClick={sync}>Synchronize now →</button></article><article className="panel"><div className="panel-head"><div><span>Device queue</span><h3>{queue.length} records awaiting sync</h3></div></div><div className="sync-steps"><div><b>1</b><p><strong>Capture</strong><small>Identity, household, farm and GPS evidence</small></p></div><div><b>2</b><p><strong>Protect</strong><small>Device-local queue and consent history</small></p></div><div><b>3</b><p><strong>Synchronize</strong><small>Retry, conflict detection and server receipt</small></p></div></div><div className="sync-meta"><span>Last successful sync</span><b>{online?new Date().toLocaleString():"Waiting for connection"}</b></div></article></div>}

export function CountyAnalytics({farmers}:{farmers:Farmer[]}){const rows=useMemo(()=>{const cs=[...new Set(farmers.map(f=>f.county))];return cs.map(c=>{const fs=farmers.filter(f=>f.county===c);return {county:c,farmers:fs.length,women:fs.filter(f=>f.gender==="Female").length,ha:fs.reduce((s,f)=>s+Number(f.farmSize),0),verified:fs.filter(f=>f.status==="Verified").length}}).sort((a,b)=>b.farmers-a.farmers)},[farmers]);const max=Math.max(1,...rows.map(r=>r.farmers));return <><div className="metric-grid"><MetricMini label="Counties reporting" value={rows.length}/><MetricMini label="Registered farmers" value={farmers.length}/><MetricMini label="Verified records" value={farmers.filter(f=>f.status==="Verified").length}/><MetricMini label="Women farmers" value={farmers.filter(f=>f.gender==="Female").length}/></div><article className="panel county-analytics"><div className="panel-head"><div><span>National disaggregation</span><h3>County performance and inclusion</h3></div><button onClick={()=>exportCounty(rows)}>Export county report</button></div>{rows.map(r=><div className="county-row" key={r.county}><b>{r.county}</b><i><span style={{width:`${r.farmers/max*100}%`}}/></i><strong>{r.farmers}</strong><small>{r.ha.toFixed(1)} ha · {r.women} women · {r.verified} verified</small></div>)}</article></>}
