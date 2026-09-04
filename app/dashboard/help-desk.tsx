"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Msg={id:number;authorName:string;authorRole:string;message:string;visibility:string;createdAt:string};
type Ticket={ticketCode:string;subject:string;category:string;description:string;priority:string;sensitivity:string;status:string;county:string;requesterName:string;requesterRole:string;assignedTeam:string;assignedTo:string;slaHours:number;dueAt:string;resolution:string;satisfaction:number;createdAt:string;messages:Msg[]};
type Article={articleCode:string;title:string;category:string;audience:string;summary:string;content:string};
const categories=["Account / access","Registration / data correction","Offline synchronization","GIS / mapping","Programme / voucher","Mobile money / payment","Privacy / consent","Grievance / safeguarding","Technical error","Training / how-to"];
const counties=["National","Bomi","Bong","Gbarpolu","Grand Bassa","Grand Cape Mount","Grand Gedeh","Grand Kru","Lofa","Margibi","Maryland","Montserrado","Nimba","River Cess","River Gee","Sinoe"];
const statuses=["Open","Acknowledged","In progress","Waiting for user","Resolved","Closed"];

export default function HelpDesk({role,notify,onNavigate}:{role:string;notify:(s:string)=>void;onNavigate?:(w:string)=>void}){
  const [data,setData]=useState<{tickets:Ticket[];articles:Article[];access:{canManage:boolean;role:string}}>({tickets:[],articles:[],access:{canManage:false,role}});
  const [tab,setTab]=useState("mine");
  const [modal,setModal]=useState(false);
  const [articleModal,setArticleModal]=useState(false);
  const [generateModal,setGenerateModal]=useState(false);
  const [selected,setSelected]=useState<Ticket|null>(null);
  const [query,setQuery]=useState("");
  const [busy,setBusy]=useState(false);

  const [articleDraft, setArticleDraft] = useState<Partial<Article>>({
    articleCode: "",
    title: "",
    category: "Field Operations",
    audience: "All users",
    summary: "",
    content: "",
  });

  const load=async()=>{
    const r=await fetch("/api/help-desk");
    const j=await r.json();
    if(r.ok){
      setData(j);
      setSelected(s=>s?j.tickets.find((t:Ticket)=>t.ticketCode===s.ticketCode)||null:null);
    }
  };
  useEffect(()=>{load()},[]);

  const mine=data.tickets.filter(t=>!data.access.canManage||tab!=="mine"||t.requesterRole===role);
  const filtered=mine.filter(t=>(t.ticketCode+t.subject+t.category+t.requesterName).toLowerCase().includes(query.toLowerCase()));
  const open=data.tickets.filter(t=>!["Resolved","Closed"].includes(t.status)).length;
  const overdue=data.tickets.filter(t=>!["Resolved","Closed"].includes(t.status)&&new Date(t.dueAt)<new Date()).length;
  const resolved=data.tickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length;

  async function create(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    const body=Object.fromEntries(new FormData(e.currentTarget));
    const r=await fetch("/api/help-desk",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,requesterRole:role})});
    const j=await r.json();
    setBusy(false);
    if(r.ok){
      setModal(false);
      notify(`Support request ${j.ticketCode} submitted.`);
      await load();
    }else notify(j.error||"Request failed");
  }

  async function submitArticle(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    const r=await fetch("/api/help-desk",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({action:"create-article",...articleDraft}),
    });
    const j=await r.json();
    setBusy(false);
    if(r.ok){
      setArticleModal(false);
      setGenerateModal(false);
      notify(`Knowledge article ${j.articleCode || articleDraft.articleCode} published.`);
      setArticleDraft({ articleCode: "", title: "", category: "Field Operations", audience: "All users", summary: "", content: "" });
      await load();
    } else {
      notify(j.error || "Failed to publish article");
    }
  }

  async function deleteArticle(articleCode:string){
    if (!confirm(`Are you sure you want to remove article ${articleCode}?`)) return;
    setBusy(true);
    const r=await fetch("/api/help-desk",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({action:"delete-article",articleCode}),
    });
    setBusy(false);
    if(r.ok){
      notify(`Article ${articleCode} removed.`);
      await load();
    } else notify("Failed to delete article");
  }

  async function action(body:Record<string,unknown>,method="PATCH"){
    setBusy(true);
    const r=await fetch("/api/help-desk",{method,headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    const j=await r.json();
    setBusy(false);
    if(!r.ok)notify(j.error||"Action failed");
    else{notify("Help Desk record updated.");await load();}
  }

  const policyTemplates = [
    {
      name: "Data Privacy & Farmer Consent Safeguards",
      code: "KB-POL-01",
      category: "Data Privacy / Safeguarding",
      audience: "All users",
      title: "Mandatory Farmer Informed Consent & Biometric Safeguarding Standards",
      summary: "Executive compliance rules on obtaining informed consent in local languages, safeguarding biometric photos, and prohibiting commercial data resale.",
      content: "1. Prior to recording farmer data or taking photographs, enumerators must read the vernacular consent declaration in English, Kpelle, or Bassa.\n2. Farmers have an absolute right to refuse facial photography without loss of agricultural advisory.\n3. All smallholder identity data is held in public trust; any officer found selling or sharing registry data with third parties faces immediate termination and referral for criminal prosecution under the Liberia Data Protection Act 2024.\n4. Farmers may inspect and request corrections to their holding data free of charge.",
    },
    {
      name: "Cadastral Boundary Mapping & GPS Accuracy SOP",
      code: "KB-POL-02",
      category: "GIS / mapping",
      audience: "Enumerators",
      title: "Field GPS Parcel Perimeter Traversal & Ground Truth Quality Standard",
      summary: "Technical criteria for boundary digitizing, maximum permissible HDOP error, and customary land boundary certification.",
      content: "1. Enumerators must physically walk the boundary perimeter with the farmer or community elder. Remote desktop digitizing without ground inspection is strictly penalized.\n2. Device GPS horizontal accuracy must be 5 meters or better before recording vertices.\n3. When boundaries border neighboring holdings or wetlands, obtain verbal confirmation from adjacent landowners to prevent tenure conflicts.\n4. Complete and save parcel polygons offline; upload when reaching cellular connectivity.",
    },
    {
      name: "E-Voucher Anti-Diversion & Merchant Redemption Protocol",
      code: "KB-POL-03",
      category: "Programme / voucher",
      audience: "Input Agro-dealers",
      title: "Authorized Input Voucher Dual-Factor Redemption & Merchant Fraud Controls",
      summary: "Verification protocols for agro-dealers to validate smallholder QR cards, verify SMS tokens, and dispense certified seeds and fertilizers.",
      content: "1. Request the farmer's physical DFR ID card or SMS confirmation slip.\n2. Scan the secure QR code using the DFR Dealer Portal app.\n3. Enter the 6-digit one-time token sent to the farmer's registered phone number.\n4. Inspect input inventory: dispense ONLY certified seed (ECOWAS certified) and registered NPK fertilizers.\n5. Confirm handover in the portal immediately. Selling subsidized foundation inputs at market rates triggers automatic vendor license revocation.",
    },
    {
      name: "Frontline Enumerator & Extension Agent Code of Conduct",
      code: "KB-POL-04",
      category: "Training / how-to",
      audience: "Extension agents",
      title: "Frontline Professional Ethics, Neutrality & Zero-Fee Policy",
      summary: "Mandatory code of conduct prohibiting extortion, solicitation of transport fees, and ensuring equitable service across all smallholders.",
      content: "1. Registration and advisory services are 100% FREE for all Liberian farmers. Demanding 'gas money', gifts, or a percentage of harvest is gross misconduct.\n2. Treat all smallholders with dignity regardless of gender, ethnic group, or land tenure status.\n3. Report any observed agricultural pest outbreak (e.g. Fall Armyworm, Rice Blast) within 24 hours using the Outbreak Broadcast tool.\n4. Maintain neutral, accountable records and adhere strictly to Civil Service Commission regulations.",
    },
  ];

  return (
    <div className="hd-space">
      <section className="hd-hero panel">
        <div>
          <span>National user support centre</span>
          <h2>Help Desk & Service Assurance</h2>
          <p>Submit, monitor and resolve operational support requests with accountable ownership, SLA controls and a complete conversation history.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={()=>setModal(true)}>＋ New support request</button>
          {onNavigate && data.access.canManage && (
            <button
              onClick={() => onNavigate("Institutional Governance")}
              style={{
                background: "#f8fafc",
                color: "#166534",
                border: "1.5px solid #86efac",
                fontWeight: 700,
                cursor: "pointer",
                padding: "10px 16px",
                borderRadius: "8px",
              }}
            >
              🏛 Platform Policy Studio ↗
            </button>
          )}
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric"><div><span>Active requests</span><strong>{open}</strong><small>Awaiting action or response</small></div><i>◌</i></article>
        <article className="metric"><div><span>SLA overdue</span><strong>{overdue}</strong><small>Requires immediate escalation</small></div><i>!</i></article>
        <article className="metric"><div><span>Resolved</span><strong>{resolved}</strong><small>Closed-loop support</small></div><i>✓</i></article>
        <article className="metric"><div><span>Guidance articles</span><strong>{data.articles.length}</strong><small>Published self-service answers</small></div><i>?</i></article>
      </div>

      <div className="hd-tabs">
        <button className={tab==="mine"?"active":""} onClick={()=>setTab("mine")}>My requests</button>
        {data.access.canManage&&<button className={tab==="queue"?"active":""} onClick={()=>setTab("queue")}>Support queue</button>}
        <button className={tab==="knowledge"?"active":""} onClick={()=>setTab("knowledge")}>Knowledge base ({data.articles.length})</button>
        <input placeholder="Search tickets or guidance…" value={query} onChange={e=>setQuery(e.target.value)}/>
      </div>

      {tab==="knowledge" ? (
        <div>
          {/* Knowledge Base Admin Actions Bar */}
          <div
            className="panel"
            style={{
              padding: "18px 24px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
            }}
          >
            <div>
              <b style={{ fontSize: "1.05rem", color: "#0f172a", display: "block" }}>
                Official Operational Knowledge Base &amp; Field Job Aids
              </b>
              <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                Step-by-step guidance for smallholders, enumerators, extension agents, and institutional partners.
              </span>
            </div>
            {data.access.canManage && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setArticleDraft({
                      articleCode: `KB-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
                      title: "",
                      category: "Field Operations",
                      audience: "All users",
                      summary: "",
                      content: "",
                    });
                    setArticleModal(true);
                  }}
                  style={{
                    background: "#166534",
                    color: "#ffffff",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(22,101,52,0.25)",
                  }}
                >
                  ＋ Author Knowledge Article
                </button>
                <button
                  onClick={() => setGenerateModal(true)}
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    border: "1.5px solid #fde68a",
                    cursor: "pointer",
                  }}
                >
                  ⚡ Generate Guidance from Policy
                </button>
              </div>
            )}
          </div>

          <section className="hd-kb">
            {data.articles
              .filter(a=>(a.title+a.category+a.summary+(a.audience||"")).toLowerCase().includes(query.toLowerCase()))
              .map(a=>(
                <article className="panel" key={a.articleCode} style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "#0284c7" }}>{a.category}</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                        {a.audience || "All users"}
                      </span>
                      {data.access.canManage && (
                        <button
                          onClick={() => deleteArticle(a.articleCode)}
                          title="Delete article"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "14px",
                            padding: "2px 6px",
                          }}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 style={{ color: "#0f172a", margin: "4px 0 8px", fontSize: "1.05rem" }}>{a.title}</h3>
                  <p style={{ color: "#334155", fontSize: "0.88rem", lineHeight: 1.4 }}>{a.summary}</p>
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ color: "#166534", fontWeight: 700, cursor: "pointer" }}>Read step-by-step guidance</summary>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", marginTop: 8, border: "1px solid #e2e8f0" }}>
                      <p style={{ color: "#0f172a", fontSize: "0.85rem", whiteSpace: "pre-line", margin: 0, lineHeight: 1.5 }}>
                        {a.content}
                      </p>
                    </div>
                  </details>
                  <small style={{ display: "block", marginTop: 10, color: "#64748b", fontWeight: 600 }}>
                    <code>{a.articleCode}</code> · Audience: {a.audience}
                  </small>
                </article>
              ))}
          </section>
        </div>
      ) : (
        <section className="panel registry">
          <div className="table-tools">
            <div>
              <b>{tab==="queue"?"National support queue":"My support requests"}</b>
              <span>{filtered.length} accountable service records</span>
            </div>
            <button onClick={()=>setModal(true)}>＋ Submit request</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Request</th>
                  <th>Priority / SLA</th>
                  <th>Ownership</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t=>(
                  <tr key={t.ticketCode}>
                    <td>
                      <code style={{ color: "#0369a1", fontWeight: 700 }}>{t.ticketCode}</code>
                      <small style={{ display: "block", color: "#64748b" }}>{new Date(t.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <b style={{ color: "#0f172a" }}>{t.subject}</b>
                      <small style={{ display: "block", color: "#64748b" }}>{t.category} · {t.county}</small>
                    </td>
                    <td>
                      <span className={`hd-priority ${t.priority.toLowerCase()}`}>{t.priority}</span>
                      <small className={new Date(t.dueAt)<new Date()&&!['Resolved','Closed'].includes(t.status)?"late":""}>
                        Due {new Date(t.dueAt).toLocaleString()}
                      </small>
                    </td>
                    <td>
                      <b>{t.assignedTeam}</b>
                      <small style={{ display: "block", color: "#64748b" }}>{t.assignedTo}</small>
                    </td>
                    <td><span className="status">{t.status}</span></td>
                    <td>
                      <button className="approve" onClick={()=>setSelected(t)}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="hd-empty">
                <b>No support requests found</b>
                <p>Submit a request and the Help Desk will issue a traceable ticket number immediately.</p>
                <button onClick={()=>setModal(true)}>New support request</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MODAL 1: NEW TICKET REQUEST */}
      {modal && (
        <div className="modal-wrap enrollment-overlay" style={{zIndex:10000}} onMouseDown={e=>{if(e.currentTarget===e.target)setModal(false)}}>
          <form className="enrollment-wizard ext-wizard" style={{maxWidth:860}} onSubmit={create}>
            <header>
              <div>
                <span>♢ &nbsp; ACCOUNTABLE USER &amp; REGISTRY SUPPORT</span>
                <h2>New Support &amp; Technical Request</h2>
                <p>Submit operational inquiries, data corrections, and system support tickets with tracked SLA resolution.</p>
              </div>
              <b>Help Desk Intake</b>
              <button type="button" onClick={()=>setModal(false)} aria-label="Close modal">×</button>
            </header>
            <main>
              <section className="enroll-panel">
                <h3>Support Classification &amp; Priority</h3>
                <div className="enroll-grid three">
                  <label>Category*
                    <select name="category" required>{categories.map(x=><option key={x}>{x}</option>)}</select>
                  </label>
                  <label>Priority*
                    <select name="priority"><option>Normal</option><option>Low</option><option>High</option><option>Critical</option></select>
                  </label>
                  <label>County
                    <select name="county">{counties.map(x=><option key={x}>{x}</option>)}</select>
                  </label>
                  <label>Preferred Channel
                    <select name="channel"><option>In-platform</option><option>Phone callback</option><option>Email follow-up</option></select>
                  </label>
                  <label>Sensitivity Level
                    <select name="sensitivity"><option>Internal</option><option>Restricted personal data</option><option>Highly restricted</option></select>
                  </label>
                </div>
                <div style={{marginTop:14}}>
                  <label className="full-label">Subject Line*
                    <input name="subject" required placeholder="Briefly describe the operational or technical issue"/>
                  </label>
                </div>
              </section>
              <section className="identity-panel">
                <h3>Request Details &amp; Affected References</h3>
                <label className="full-label">Issue Details &amp; Error Description*
                  <textarea name="description" rows={4} required placeholder="What happened, what were you trying to do, and what farmer DFR ID, voucher code, or reference is affected? Never submit passwords or PINs."/>
                </label>
              </section>
            </main>
            <footer>
              <button type="button" onClick={()=>setModal(false)}>Cancel</button>
              <button type="submit" className="submit-registration" disabled={busy}>{busy?"Submitting…":"Submit Support Request →"}</button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 2: AUTHOR / PUBLISH KNOWLEDGE ARTICLE */}
      {articleModal && (
        <div className="modal-wrap enrollment-overlay" style={{zIndex:10000}} onMouseDown={e=>{if(e.currentTarget===e.target)setArticleModal(false)}}>
          <form className="enrollment-wizard ext-wizard" style={{maxWidth:860}} onSubmit={submitArticle}>
            <header>
              <div>
                <span>♢ &nbsp; KNOWLEDGE BASE &amp; OPERATIONAL JOB AIDS</span>
                <h2>Author &amp; Publish Knowledge Article</h2>
                <p>Create self-service guides, operational checklists, and technical answers for field enumerators and farmers.</p>
              </div>
              <b>Article Authoring</b>
              <button type="button" onClick={()=>setArticleModal(false)} aria-label="Close modal">×</button>
            </header>
            <main>
              <section className="enroll-panel">
                <h3>Article Classification &amp; Target Audience</h3>
                <div className="enroll-grid three">
                  <label>Article Code*
                    <input
                      required
                      value={articleDraft.articleCode}
                      onChange={e=>setArticleDraft(d=>({...d,articleCode:e.target.value}))}
                      placeholder="KB-005"
                    />
                  </label>
                  <label>Category*
                    <select
                      value={articleDraft.category}
                      onChange={e=>setArticleDraft(d=>({...d,category:e.target.value}))}
                    >
                      {categories.map(x=><option key={x}>{x}</option>)}
                      <option>Field Operations</option>
                      <option>Registration & Identity</option>
                      <option>Benefits & Inputs</option>
                      <option>Data Privacy & Safeguards</option>
                    </select>
                  </label>
                  <label>Target Audience*
                    <select
                      value={articleDraft.audience}
                      onChange={e=>setArticleDraft(d=>({...d,audience:e.target.value}))}
                    >
                      <option>All users</option>
                      <option>Enumerators</option>
                      <option>Extension agents</option>
                      <option>Input Agro-dealers</option>
                      <option>Farmers / Citizens</option>
                      <option>County Verification Officers</option>
                      <option>Support staff</option>
                    </select>
                  </label>
                </div>
                <div style={{marginTop:14}}>
                  <label className="full-label">Article Title*
                    <input
                      required
                      value={articleDraft.title}
                      onChange={e=>setArticleDraft(d=>({...d,title:e.target.value}))}
                      placeholder="e.g. How to verify smallholder consent before biometric registration"
                    />
                  </label>
                </div>
              </section>

              <section className="identity-panel">
                <h3>Executive Summary &amp; Step-by-Step Guidance</h3>
                <label className="full-label" style={{ marginBottom: 14 }}>
                  Summary (Brief 1–2 sentence overview)*
                  <input
                    required
                    value={articleDraft.summary}
                    onChange={e=>setArticleDraft(d=>({...d,summary:e.target.value}))}
                    placeholder="Clear takeaway explaining when and why to use this procedure."
                  />
                </label>
                <label className="full-label">
                  Detailed Operational Guidance (Steps, prerequisites, and precautions)*
                  <textarea
                    rows={6}
                    required
                    value={articleDraft.content}
                    onChange={e=>setArticleDraft(d=>({...d,content:e.target.value}))}
                    placeholder="1. Step one instructions...&#10;2. Step two instructions...&#10;3. Precautions and mandatory checks..."
                  />
                </label>
              </section>
            </main>
            <footer>
              <button type="button" onClick={()=>setArticleModal(false)}>Cancel</button>
              <button type="submit" className="submit-registration" disabled={busy}>
                {busy ? "Publishing..." : "Publish to Knowledge Base →"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* MODAL 3: GENERATE GUIDANCE FROM STATUTORY POLICY */}
      {generateModal && (
        <div className="modal-wrap enrollment-overlay" style={{zIndex:10000}} onMouseDown={e=>{if(e.currentTarget===e.target)setGenerateModal(false)}}>
          <div className="enrollment-wizard ext-wizard" style={{maxWidth:860, background: "#ffffff"}}>
            <header>
              <div>
                <span>⚡ &nbsp; AUTOMATED STATUTORY POLICY-TO-GUIDANCE GENERATOR</span>
                <h2>Generate Guidance from Policy Framework</h2>
                <p>Select an approved national policy to automatically synthesize an operational field job aid for the Knowledge Base.</p>
              </div>
              <b style={{ background: "#fef3c7", color: "#92400e" }}>Policy Synthesis</b>
              <button type="button" onClick={()=>setGenerateModal(false)} aria-label="Close modal">×</button>
            </header>
            <main>
              <section className="enroll-panel">
                <h3>Select Governing Policy or Standard Operating Procedure</h3>
                <div style={{ display: "grid", gap: "12px", marginTop: 12 }}>
                  {policyTemplates.map((p) => (
                    <div
                      key={p.code}
                      style={{
                        padding: "14px 18px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 700, textTransform: "uppercase" }}>
                          {p.category} · Audience: {p.audience}
                        </span>
                        <h4 style={{ margin: "3px 0 4px", fontSize: "0.95rem", color: "#0f172a" }}>{p.title}</h4>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569" }}>{p.summary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setArticleDraft({
                            articleCode: p.code,
                            title: p.title,
                            category: p.category,
                            audience: p.audience,
                            summary: p.summary,
                            content: p.content,
                          });
                          setGenerateModal(false);
                          setArticleModal(true);
                        }}
                        style={{
                          padding: "8px 16px",
                          background: "#166534",
                          color: "#ffffff",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⚡ Use Policy Template →
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </main>
            <footer>
              <button type="button" onClick={()=>setGenerateModal(false)}>Close</button>
            </footer>
          </div>
        </div>
      )}

      {selected && <TicketDrawer ticket={selected} canManage={data.access.canManage} busy={busy} close={()=>setSelected(null)} action={action}/>}
    </div>
  );
}

function TicketDrawer({ticket:t,canManage,busy,close,action}:{ticket:Ticket;canManage:boolean;busy:boolean;close:()=>void;action:(b:Record<string,unknown>,m?:string)=>void}){
  const[msg,setMsg]=useState("");
  const[visibility,setVisibility]=useState("Requester-visible");
  const[state,setState]=useState({status:t.status,assignedTeam:t.assignedTeam,assignedTo:t.assignedTo,priority:t.priority,resolution:t.resolution});
  return (
    <div className="drawer-wrap">
      <aside className="delivery-drawer hd-drawer">
        <header>
          <div>
            <span>{t.category}</span>
            <h2>{t.subject}</h2>
            <code>{t.ticketCode}</code>
          </div>
          <button onClick={close}>×</button>
        </header>
        <section className="hd-ticket-summary">
          <div><b>{t.status}</b><small>Status</small></div>
          <div><b>{t.priority}</b><small>Priority</small></div>
          <div><b>{t.assignedTeam}</b><small>Assigned team</small></div>
          <div><b>{new Date(t.dueAt).toLocaleString()}</b><small>SLA due</small></div>
        </section>
        <section>
          <h3>Request</h3>
          <p>{t.description}</p>
          <small>{t.requesterName} · {t.requesterRole} · {t.county}</small>
        </section>
        <section>
          <h3>Conversation &amp; evidence</h3>
          <div className="hd-thread">
            {t.messages.map(m=>(
              <div key={m.id} className={m.visibility==="Internal"?"internal":""}>
                <b>{m.authorName}</b>
                <span>{m.authorRole} · {m.visibility} · {new Date(m.createdAt).toLocaleString()}</span>
                <p>{m.message}</p>
              </div>
            ))}
          </div>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Add a response or progress update…"/>
          {canManage && (
            <select value={visibility} onChange={e=>setVisibility(e.target.value)}>
              <option>Requester-visible</option>
              <option>Internal</option>
            </select>
          )}
          <button disabled={busy||!msg.trim()} onClick={async()=>{await action({action:"message",ticketCode:t.ticketCode,message:msg,visibility},"POST");setMsg("")}}>
            Add update
          </button>
        </section>
        {canManage ? (
          <section>
            <h3>Support workflow controls</h3>
            <div className="drawer-controls">
              <label>Status
                <select value={state.status} onChange={e=>setState({...state,status:e.target.value})}>
                  {statuses.map(x=><option key={x}>{x}</option>)}
                </select>
              </label>
              <label>Priority
                <select value={state.priority} onChange={e=>setState({...state,priority:e.target.value})}>
                  <option>Low</option><option>Normal</option><option>High</option><option>Critical</option>
                </select>
              </label>
              <label>Assigned team
                <select value={state.assignedTeam} onChange={e=>setState({...state,assignedTeam:e.target.value})}>
                  <option>Help Desk</option>
                  <option>Registry &amp; Data Quality</option>
                  <option>GIS &amp; Mapping</option>
                  <option>Programmes &amp; Payments</option>
                  <option>Infrastructure &amp; Security</option>
                  <option>Institutional Governance</option>
                </select>
              </label>
              <label>Assigned officer
                <input value={state.assignedTo} onChange={e=>setState({...state,assignedTo:e.target.value})}/>
              </label>
              <label className="wide">Resolution
                <textarea value={state.resolution} onChange={e=>setState({...state,resolution:e.target.value})} placeholder="Required before resolving"/>
              </label>
            </div>
            <button disabled={busy} onClick={()=>action({ticketCode:t.ticketCode,...state})}>Save workflow decision</button>
          </section>
        ) : (
          <section>
            <h3>After resolution</h3>
            {["Resolved","Closed"].includes(t.status) ? (
              <>
                <button onClick={()=>action({ticketCode:t.ticketCode,action:"reopen"})}>Reopen request</button>
                <p>Rate this resolution: {[1,2,3,4,5].map(n=><button className="hd-star" key={n} onClick={()=>action({ticketCode:t.ticketCode,action:"rate",satisfaction:n})}>{n<=t.satisfaction?"★":"☆"}</button>)}</p>
              </>
            ) : (
              <p>Your request is being tracked. Add a reply above whenever the support team asks for clarification.</p>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}
