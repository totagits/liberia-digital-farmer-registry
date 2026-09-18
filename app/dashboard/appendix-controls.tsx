"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
type R=Record<string,any>;const tabs=["Control room","SOP approvals","Data quality","Supervision & audits","Reports","Training & support","Committees","Social protection","Consent & access","Reference & recovery"];
export default function AppendixControls({
  notify,
  initialTab=tabs[0],
  accessOnly=false,
  onNavigate,
  onOpenRegistration,
}:{
  notify:(s:string)=>void;
  initialTab?:string;
  accessOnly?:boolean;
  onNavigate?:(tabName:string)=>void;
  onOpenRegistration?:()=>void;
}){
  const empty={sops:[],rules:[],assessments:[],controls:[],consents:[],indicators:[],assignments:[],farmers:[],access:{capabilities:[]}};
  const[data,setData]=useState<R>(empty),[tab,setTab]=useState(initialTab),[busy,setBusy]=useState(false),[open,setOpen]=useState(false);

  async function load(){
    try{
      const r=await fetch("/api/appendix-controls");
      const body=await r.json();
      if(!r.ok)throw new Error(body.error||"Unable to load access controls");
      setData({...empty,...body,access:{...empty.access,...body.access}});
    }catch(e){
      setData(empty);
      notify(e instanceof Error?e.message:"Unable to load operational controls");
    }
  }
  useEffect(()=>{setTab(initialTab);load()},[initialTab]);

  const grouped=(types:string[])=>data.controls.filter((x:R)=>types.includes(x.controlType));
  const metrics=useMemo(()=>({
    sops:data.sops.filter((x:R)=>x.stage==="APPROVED"||x.stage==="PUBLISHED").length,
    quality:data.assessments.length?Math.round(data.assessments.reduce((a:number,x:R)=>a+x.overallScore,0)/data.assessments.length):0,
    overdue:data.controls.filter((x:R)=>x.dueDate<"2026-08-02"&&!['Completed','Closed','Published'].includes(x.status)).length,
    open:data.controls.filter((x:R)=>!['Completed','Closed','Published'].includes(x.status)).length
  }),[data]);

  async function action(body:R,method="POST"){
    setBusy(true);
    const r=await fetch("/api/appendix-controls",{method,headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    const j=await r.json();
    setBusy(false);
    if(r.ok){
      notify(j.count?`${j.count} registry records assessed against six quality dimensions.`:"Control action saved with accountable audit evidence.");
      setOpen(false);
      load();
    }else notify(j.error||"Action failed");
  }

  function handleControlUpdate(control: R, newStatus: string, evidence?: string) {
    // Instant optimistic update in React state so UI updates in 0ms!
    setData((prev) => ({
      ...prev,
      controls: prev.controls.map((c: R) => (c.id === control.id ? { ...c, status: newStatus, evidence: evidence || c.evidence } : c)),
    }));
    notify(
      newStatus === "Completed"
        ? "Control completed with accountable audit evidence."
        : newStatus === "In progress"
        ? "Control started: task is now In progress (Start button disabled)."
        : "Control reverted to Active status (Start button re-enabled)."
    );
    action({ entity: "control", id: control.id, status: newStatus, evidence: evidence || `Status set to ${newStatus}` }, "PATCH");
  }

  const executionSteps = [
    {
      step: 1,
      title: "Create provisional registration",
      hint: "Launch new farmer registration wizard",
      action: () => {
        if (onOpenRegistration) onOpenRegistration();
        else if (onNavigate) onNavigate("Field Registration");
        notify("Opening Farmer Registration Wizard...");
      },
    },
    {
      step: 2,
      title: "Run automated quality assessment",
      hint: "Screen records on 6 quality dimensions",
      action: () => {
        setTab("Data quality");
        action({ action: "run-quality" });
      },
    },
    {
      step: 3,
      title: "Assign supervision or spot check",
      hint: "Dispatch spot check or supervisory control",
      action: () => {
        setTab("Supervision & audits");
        setOpen(true);
      },
    },
    {
      step: 4,
      title: "Record evidence and reviewer decision",
      hint: "Record supervisory findings and decision notes",
      action: () => {
        setTab("Supervision & audits");
        notify("Showing field supervision & spot checks. Click 'Start' or 'Record completion' on any card.");
      },
    },
    {
      step: 5,
      title: "Issue approved DFR ID",
      hint: "Open registry to verify records and approve DFR IDs",
      action: () => {
        if (onNavigate) onNavigate("Farmer Registry");
        notify("Navigating to Farmer Registry for verification and DFR ID approval.");
      },
    },
    {
      step: 6,
      title: "Generate controlled report",
      hint: "Review indicators and export controlled reports",
      action: () => {
        setTab("Reports");
        notify("Opening Approved Monitoring Indicator Catalogue & Controlled Reports.");
      },
    },
  ];

  return <div className={`a2-space ${accessOnly?"access-space":""}`}>
    <section className="a2-hero panel">
      <div>
        <span>{accessOnly?"Identity, consent and authorization":"Appendix 2 · executable operational framework"}</span>
        <h2>{accessOnly?"Users, Roles & Access Administration":"DFR SOP Operations & Assurance Centre"}</h2>
        <p>{accessOnly?"Manage institutional accounts, geographic scope, data sensitivity, capabilities and consent lifecycles through server-enforced controls.":"From written procedure to assigned control, recorded evidence, institutional decision and measurable result."}</p>
      </div>
      <aside>
        <b>{data.access.institution||"—"}</b>
        <span>{data.access.role||"Authenticated user"}</span>
        <small>{data.access.countyScope||"National"} · {data.access.sensitivityCeiling||"Scoped"}</small>
      </aside>
    </section>
    {!accessOnly&&<nav className="a2-tabs">{tabs.map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t}</button>)}</nav>}
    {tab==="Control room"&&<>
      <div className="metric-grid">
        <K v={`${metrics.sops}/9`} l="Approved SOPs" s="Institutional release gate"/>
        <K v={`${metrics.quality}%`} l="Average quality score" s="Six-dimensional screening"/>
        <K v={String(metrics.open)} l="Open controls" s="Assigned with deadlines"/>
        <K v={String(metrics.overdue)} l="Overdue escalations" s="Requires governance action"/>
      </div>
      <div className="a2-grid">
        <article className="panel a2-path">
          <div className="path-head">
            <h3>Evaluator execution path</h3>
            <small>Click any step to execute the live operational workflow</small>
          </div>
          <div className="path-list">
            {executionSteps.map((s) => (
              <button
                key={s.step}
                type="button"
                className="a2-path-btn"
                onClick={s.action}
                title={`${s.title} — ${s.hint}`}
              >
                <i>{s.step}</i>
                <div className="path-btn-text">
                  <b>{s.title}</b>
                  <small>{s.hint}</small>
                </div>
                <span>{s.step < 6 ? "→" : "✓"}</span>
              </button>
            ))}
          </div>
        </article>
        <article className="panel">
          <Head t="Appendix 2 action queue" s="Priority controls across institutions"/>
          <Cards rows={data.controls.filter((x:R)=>x.priority==="Critical"||x.priority==="High").slice(0,7)} update={handleControlUpdate}/>
        </article>
      </div>
    </>}
    {tab==="SOP approvals"&&<article className="panel registry"><Head t="Operational SOP lifecycle" s="Draft → consultation → institutional review → approval → publication → review"/><div className="sop-ops">{data.sops.map((s:R)=><article key={s.id}><header><code>{s.sopCode} · v{s.version}</code><em>{s.stage.replaceAll("_"," ")}</em></header><h3>{s.title}</h3><p>{s.ownerInstitution} · next review {s.nextReviewDate}</p><div className="approval-track"><span>Required: {s.requiredApprovals.join(", ")}</span><b>Approved: {s.approvals.join(", ")||"None"}</b></div><small>{s.consultationStatus} · {s.commentsOpen} open comments</small><footer><button onClick={()=>action({entity:"sop",id:s.id,approve:true},"PATCH")}>Record institutional approval</button><button onClick={()=>action({entity:"sop",id:s.id,stage:"PUBLISHED",approve:true},"PATCH")}>Publish effective version</button></footer></article>)}</div></article>}
    {tab==="Data quality"&&<><article className="panel registry"><Head t="Configurable quality rules" s="Accuracy, completeness, consistency, timeliness, uniqueness and reliability" action={<button disabled={busy} onClick={()=>action({action:"run-quality"})}>{busy?"Assessing…":"Run quality assessment"}</button>}/><Table heads={["Rule","Dimension","Entity","Expression","Severity","Owner","State"]} rows={data.rules.map((x:R)=>[x.ruleCode,<b>{x.dimension}</b>,x.entityType,<code>{x.expression}</code>,x.severity,x.ownerInstitution,x.enabled?"Enabled":"Disabled"])}/></article><article className="panel registry"><Head t="Assessment results" s="Record-level six-dimensional scores and correction outcomes"/><Table heads={["Subject","Accuracy","Complete","Consistent","Timely","Unique","Reliable","Overall / outcome"]} rows={data.assessments.map((x:R)=>[x.subjectRef,x.accuracy,x.completeness,x.consistency,x.timeliness,x.uniqueness,x.reliability,<b>{x.overallScore}% · {x.outcome}</b>])}/></article></>}
    {tab==="Supervision & audits"&&<ControlPanel title="Field supervision, spot checks and periodic DQA" rows={grouped(["Field supervision","Spot check","Periodic DQA"])} setOpen={setOpen} update={(x,s)=>handleControlUpdate(x, s, `Decision recorded ${new Date().toISOString()}`)}/>} 
    {tab==="Reports"&&<><article className="panel registry"><Head t="Approved monitoring indicator catalogue" s="Versioned definitions, frequency, ownership and disaggregation"/><Table heads={["Indicator","Definition","Calculation","Frequency","Owner","Disaggregation","Value"]} rows={data.indicators.map((x:R)=>[<><b>{x.name}</b><small>{x.indicatorCode}</small></>,x.definition,`${x.numerator} / ${x.denominator}`,x.frequency,x.owner,x.disaggregations,`${x.currentValue} ${x.unit}`])}/></article><ControlPanel title="Scheduled and controlled report releases" rows={grouped(["Scheduled report"])} setOpen={setOpen} update={(x,s)=>handleControlUpdate(x, s, "Reviewer approval and dataset freeze recorded")}/></>} 
    {tab==="Training & support"&&<ControlPanel title="Training, attendance, competency, certification and support" rows={grouped(["Training session","Technical support"])} setOpen={setOpen} update={(x,s)=>handleControlUpdate(x, s, s==="Completed"?"Completion evidence and certificate register updated":"Status decision recorded")}/>} 
    {tab==="Committees"&&<ControlPanel title="National Steering Committee and Technical Working Groups" rows={grouped(["National Steering Committee","Technical Working Group"])} setOpen={setOpen} update={(x,s)=>handleControlUpdate(x, s, "Quorum, resolution and accountable action recorded")}/>} 
    {tab==="Social protection"&&<ControlPanel title="MGCSP referrals and shock-responsive intervention" rows={grouped(["Social-protection referral","Shock response"])} setOpen={setOpen} update={(x,s)=>handleControlUpdate(x, s, "Purpose, minimum-data decision and response status recorded")}/>} 
    {tab==="Consent & access"&&<div className="a2-grid"><article className="panel registry"><Head t="Consent lifecycle" s="Purpose, language, version, evidence and withdrawal"/><Table heads={["Consent","Subject","Version / language","Purposes","Channel","Status","Action"]} rows={data.consents.map((x:R)=>[x.consentCode,x.subjectRef,`${x.version} · ${x.language}`,Array.isArray(x.purposes)?x.purposes.join(", "):String(x.purposes||""),x.channel,x.status,<button disabled={x.status==="Withdrawn"} onClick={()=>action({entity:"consent",id:x.id},"PATCH")}>Withdraw</button>])}/></article><article className="panel registry"><Head t="Server-enforced access assignments" s="Identity, institution, geography, sensitivity and capabilities"/><Table heads={["Account","Role","Institution","Geography","Sensitivity","Status"]} rows={data.assignments.map((x:R)=>[<><b>{x.displayName}</b><small>{x.email}</small></>,x.role,x.institution,`${x.countyScope||"National"} / ${x.districtScope||"All"}`,x.sensitivityCeiling||"Internal",x.status||"Active"])}/></article></div>}
    {tab==="Reference & recovery"&&<ControlPanel title="LISGIS reference data, backup, restoration and credential-gated connectors" rows={grouped(["Reference dataset","Backup run","Restoration test","Government connector"])} setOpen={setOpen} update={(x,s)=>handleControlUpdate(x, s, "Test result, reviewer and timestamp captured")}/>} 
    {open&&<NewControl close={()=>setOpen(false)} save={(b)=>action({action:"create-control",...b})}/>}
  </div>
}

function K({v,l,s}:{v:string;l:string;s:string}){return <article className="metric glass"><div><span>{l}</span><strong>{v}</strong><small>{s}</small></div><i>✓</i></article>}
function Head({t,s,action}:{t:string;s:string;action?:React.ReactNode}){return <div className="table-tools"><div><b>{t}</b><span>{s}</span></div>{action}</div>}
function Table({heads,rows}:{heads:string[];rows:any[][]}){return <div className="table-wrap"><table><thead><tr>{heads.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table></div>}

function Cards({rows,update}:{rows:R[];update:(x:R,s:string,ev?:string)=>void}){
  return <div className="control-cards">
    {rows.map(x=>{
      const isCompleted = x.status === "Completed";
      const isInProgress = x.status === "In progress";
      return (
        <article key={x.id} className={`control-card ${isCompleted ? "completed-card" : isInProgress ? "in-progress-card" : ""}`}>
          <header>
            <code>{x.controlCode}</code>
            <em className={x.priority.toLowerCase()}>{x.priority}</em>
          </header>
          <span>{x.controlType} · {x.institution}</span>
          <h3>{x.title}</h3>
          <p>{x.subjectRef} · {x.county}</p>
          <dl>
            <div><dt>Owner</dt><dd>{x.owner}</dd></div>
            <div><dt>Reviewer</dt><dd>{x.reviewer||"Not assigned"}</dd></div>
            <div><dt>Due</dt><dd>{x.dueDate}</dd></div>
            <div>
              <dt>Status</dt>
              <dd>
                <b className={`status-pill status-${x.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {isCompleted ? "✓ Completed" : isInProgress ? "▶ In progress" : x.status}
                </b>
              </dd>
            </div>
          </dl>
          <small>{Object.entries(x.details||{}).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(", "):v}`).join(" · ")}</small>
          <footer>
            {!isInProgress && !isCompleted && (
              <button 
                type="button" 
                className="ctrl-btn btn-primary-action"
                onClick={()=>update(x,"In progress")}
                title="Start this control task"
              >
                ▶ Start
              </button>
            )}
            {isInProgress && (
              <>
                <button 
                  type="button" 
                  className="ctrl-btn btn-active-status"
                  disabled
                  title="Task is currently running: Start is disabled"
                >
                  ▶ Running (Disabled)
                </button>
                <button 
                  type="button" 
                  className="ctrl-btn btn-pause-action"
                  onClick={()=>update(x,"Active")}
                  title="Pause task and re-enable Start button"
                >
                  ⏸ Pause / Reset
                </button>
              </>
            )}
            {isCompleted && (
              <button 
                type="button" 
                className="ctrl-btn btn-pause-action"
                onClick={()=>update(x,"Active")}
                title="Re-open control to test again"
              >
                ↺ Re-open
              </button>
            )}
            <button 
              type="button" 
              className={`ctrl-btn ${isCompleted ? "btn-completed-status" : "btn-primary-action"}`}
              disabled={isCompleted}
              onClick={()=>update(x,"Completed")}
              title={isCompleted ? "Task is completed" : "Finalize and record completion evidence"}
            >
              {isCompleted ? "✓ Completed" : "Record completion"}
            </button>
          </footer>
        </article>
      );
    })}
  </div>;
}

function ControlPanel({title,rows,setOpen,update}:{title:string;rows:R[];setOpen:(x:boolean)=>void;update:(x:R,s:string)=>void}){return <article className="panel registry"><Head t={title} s="Persistent assignments, evidence, decisions and audit history" action={<button onClick={()=>setOpen(true)}>＋ New control</button>}/><Cards rows={rows} update={update}/></article>}
function NewControl({close,save}:{close:()=>void;save:(x:R)=>void}){function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();save(Object.fromEntries(new FormData(e.currentTarget)))}return <div className="modal-wrap"><form className="register-modal glass compact-modal" onSubmit={submit}><div className="modal-head"><div><span>Appendix 2 operational control</span><h2>Create accountable action</h2></div><button type="button" onClick={close}>×</button></div><div className="form-grid"><label>Control type<select name="controlType">{["Field supervision","Spot check","Periodic DQA","Scheduled report","Training session","Technical support","National Steering Committee","Technical Working Group","Social-protection referral","Shock response","Reference dataset","Backup run","Restoration test","Government connector"].map(x=><option key={x}>{x}</option>)}</select></label><label>Institution<select name="institution"><option>MOA</option><option>MGCSP</option><option>CDA</option><option>LISGIS</option><option>LOCAL</option></select></label><label className="full-field">Title*<input name="title" required/></label><label>Subject reference<input name="subjectRef"/></label><label>County<input name="county" defaultValue="National"/></label><label>Owner<input name="owner" required/></label><label>Reviewer<input name="reviewer"/></label><label>Due date<input name="dueDate" type="date" required/></label><label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Critical</option></select></label><label className="full-field">Notes<textarea name="notes"/></label></div><div className="modal-actions"><button type="button" onClick={close}>Cancel</button><button>Create control →</button></div></form></div>}
