"use client";
import {FormEvent,useEffect,useState} from "react";
import { printElementById } from "../../lib/demo-users";
type Data={vouchers:any[];accounts:any[];transactions:any[];access:{currentEmail:string;canVoucher:boolean;canPayment:boolean}};
const voucherRoles=new Set(["Voucher administrator","Input-distribution officer","Ministry administrator","Program officer","County agricultural officer","District agricultural officer"]);
const paymentRoles=new Set(["Payment officer","Ministry administrator","Program officer"]);

export default function Benefits({module,role,notify}:{module:"vouchers"|"payments";role:string;notify:(x:string)=>void}){
  const[data,setData]=useState<Data>({vouchers:[],accounts:[],transactions:[],access:{currentEmail:"",canVoucher:false,canPayment:false}});
  const[modal,setModal]=useState(""); const[selected,setSelected]=useState<any>(null);
  const load=()=>fetch("/api/benefits",{cache:"no-store"}).then(r=>r.json()).then(r=>{if(r)setData({vouchers:Array.isArray(r.vouchers)?r.vouchers:[],accounts:Array.isArray(r.accounts)?r.accounts:[],transactions:Array.isArray(r.transactions)?r.transactions:[],access:r.access||{currentEmail:"tis@totaggroup.com",canVoucher:true,canPayment:true}})}).catch(()=>{});
  useEffect(()=>{load()},[]);
  const manager=module==="vouchers"?Boolean(data?.access?.canVoucher)&&voucherRoles.has(role):Boolean(data?.access?.canPayment)&&paymentRoles.has(role);
  const vchs=Array.isArray(data?.vouchers)?data.vouchers:[];
  const accs=Array.isArray(data?.accounts)?data.accounts:[];
  const txs=Array.isArray(data?.transactions)?data.transactions:[];
  const rows=module==="vouchers"?(manager?vchs:vchs.filter(x=>x.ownerEmail===data?.access?.currentEmail)):(manager?accs:accs.filter(x=>x.ownerEmail===data?.access?.currentEmail));
  const transactions=manager?txs:txs.filter(x=>x.ownerEmail===data?.access?.currentEmail);
  async function send(method:string,body:any){const r=await fetch("/api/benefits",{method,headers:{"content-type":"application/json"},body:JSON.stringify(body)});const j=await r.json();notify(r.ok?"Workflow updated successfully.":j.error||"Action not permitted.");if(r.ok){setModal("");setSelected(null);load()}}
  const submit=(e:FormEvent<HTMLFormElement>,action:string,method="POST")=>{e.preventDefault();send(method,{action,...Object.fromEntries(new FormData(e.currentTarget))})};
  const open=(name:string,item:any=null)=>{setSelected(item);setModal(name)};
  return <div className="benefit-space">
    <section className="benefit-hero"><div><span>{manager?"AUTHORIZED OPERATIONS":"MY BENEFITS"}</span><h2>{module==="vouchers"?(manager?"Voucher issuance & distribution control":"My vouchers and input entitlements"):(manager?"Payment account verification & disbursement control":"My mobile money and payment account")}</h2><p>{module==="vouchers"?(manager?"Issue entitlements and confirm distribution through segregated maker-checker controls.":"View your issued entitlements, collection instructions and receipt history."):(manager?"Verify beneficiary accounts and monitor payment processing.":"Maintain protected payout details, request verification, track payments and report problems.")}</p></div>{(manager&&module==="vouchers")?<button onClick={()=>open("voucher")}>＋ Issue voucher</button>:(!manager&&module==="payments")?<button onClick={()=>open("account")}>＋ Add payout account</button>:(!manager&&module==="vouchers"&&rows.length>0)?<button onClick={()=>open("voucher-issue")}>Report a voucher problem</button>:null}</section>
    {module==="vouchers"?<VoucherTable rows={rows} manager={manager} send={send} open={open}/>:<>
      <article className="panel benefit-table"><header><div><b>{manager?"Beneficiary payout accounts":"My protected payout accounts"}</b><small>Full account numbers are never displayed</small></div>{!manager&&rows.length>0&&<button onClick={()=>open("account")}>＋ Add another account</button>}</header><table><thead><tr><th>DFR ID</th><th>Provider</th><th>Account</th><th>Status</th><th>Permitted actions</th></tr></thead><tbody>{rows.map(a=><tr key={a.id}><td>{a.farmerDfrId}</td><td>{a.provider}<small>{a.accountType}</small></td><td>{a.accountName}<small>{a.accountNumberMasked}</small></td><td>{a.status}</td><td>{manager&&a.status!=="Verified"?<button onClick={()=>send("PATCH",{action:"verify-account",id:a.id,status:"Verified"})}>Verify account</button>:!manager?<div className="benefit-actions"><button onClick={()=>open("edit-account",a)}>Update</button>{!["Verification requested","Verified"].includes(a.status)&&<button onClick={()=>send("PATCH",{action:"request-verification",id:a.id})}>Request verification</button>}</div>:<span>Verified</span>}</td></tr>)}</tbody></table>{!rows.length&&<p className="benefit-empty">No payout account has been added. Add an account to begin verification.</p>}</article>
      <article className="panel benefit-table"><header><div><b>{manager?"Payment transaction monitor":"My payment history and receipts"}</b><small>Programme disbursements, status and failure reasons</small></div>{!manager&&<button onClick={()=>open("payment-issue")}>Report failed or incorrect payment</button>}</header><table><thead><tr><th>Transaction</th><th>Programme</th><th>Amount</th><th>Status</th><th>Receipt / action</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td><code>{t.transactionCode}</code></td><td>{t.programme}</td><td>{t.currency} {Number(t.amount).toFixed(2)}</td><td>{t.status}</td><td>{t.receiptRef?<button onClick={()=>open("receipt",t)}>View receipt</button>:t.failureReason?<><span>{t.failureReason}</span>{!manager&&<button onClick={()=>open("payment-issue",t)}>Report problem</button>}</>:"Processing"}</td></tr>)}</tbody></table>{!transactions.length&&<p className="benefit-empty">No programme payment has been sent to this account. You can still report a missing or expected payment.</p>}</article>
    </>}
    {modal&&<BenefitModal modal={modal} selected={selected} close={()=>{setModal("");setSelected(null)}} submit={submit} send={send} manager={manager}/>}
  </div>
}

function VoucherTable({rows,manager,send,open}:{rows:any[];manager:boolean;send:(m:string,b:any)=>void;open:(n:string,i?:any)=>void}){
  return <article className="panel benefit-table">
    <header>
      <div>
        <b>{manager?"Authorized voucher register":"Entitlements assigned to me"}</b>
        <small>Farmers cannot issue or self-redeem vouchers</small>
      </div>
    </header>
    <table>
      <thead>
        <tr>
          <th>Voucher</th>
          <th>Programme / entitlement</th>
          <th>Value</th>
          <th>Collection</th>
          <th>Status</th>
          <th>Permitted action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(v=>(
          <tr key={v.id}>
            <td>
              <code>{v.voucherCode}</code>
              <small>{v.farmerDfrId}</small>
            </td>
            <td>
              {v.programme}
              <small>{v.category}</small>
            </td>
            <td>{v.currency} {Number(v.value).toFixed(2)}</td>
            <td>
              {v.distributionSite}
              <small>{v.appointmentAt||`Expires ${v.expiresAt}`}</small>
            </td>
            <td>
              <span className={`voucher-status-pill ${v.status === "Redeemed" ? "pill-redeemed" : "pill-issued"}`}>
                {v.status === "Redeemed" ? "✓ Redeemed" : "● Issued"}
              </span>
            </td>
            <td>
              <div className="voucher-actions-cell">
                {manager && v.status === "Issued" && (
                  <button 
                    type="button" 
                    className="voucher-action-btn voucher-btn-confirm"
                    onClick={()=>send("PATCH",{action:"redeem",voucherCode:v.voucherCode})}
                    title="Confirm physical input distribution to beneficiary"
                  >
                    Confirm distribution
                  </button>
                )}
                {!manager && v.status === "Redeemed" && !v.receiptAcknowledged && (
                  <button 
                    type="button" 
                    className="voucher-action-btn voucher-btn-ack"
                    onClick={()=>send("PATCH",{action:"acknowledge",voucherCode:v.voucherCode})}
                    title="Acknowledge receipt of distributed inputs"
                  >
                    Acknowledge receipt
                  </button>
                )}
                <button 
                  type="button" 
                  className="voucher-action-btn voucher-btn-view"
                  onClick={()=>open("voucher-details", v)}
                  title="View complete official voucher docket and details"
                >
                  View details
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {!rows.length&&<div className="benefit-empty">
      <b>No voucher is currently assigned to this account.</b>
      <small>If your programme application was approved, notify the voucher team so they can investigate the missing entitlement.</small>
      {!manager&&<button onClick={()=>open("voucher-issue",{category:"Approved but voucher not issued"})}>I was approved but no voucher was issued</button>}
    </div>}
  </article>
}

function BenefitModal({modal,selected,close,submit,send,manager}:{modal:string;selected:any;close:()=>void;submit:(e:FormEvent<HTMLFormElement>,a:string,m?:"POST"|"PATCH")=>void;send?:(m:string,b:any)=>void;manager?:boolean}){
  if(modal==="voucher-details" && selected) {
    const isRedeemed = selected.status === "Redeemed";
    return (
      <div className="modal-wrap">
        <section id="printable-voucher-docket" className="register-modal glass compact-modal voucher-detail-card" style={{ maxWidth: "680px", width: "100%" }}>
          <div className="modal-head" style={{ borderBottom: "1px solid #dce8df", paddingBottom: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/assets/moa-logo.png" alt="MoA" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
              <div>
                <span style={{ color: "#166534", fontWeight: 800, fontSize: "11px", letterSpacing: "0.08em" }}>
                  REPUBLIC OF LIBERIA · MINISTRY OF AGRICULTURE
                </span>
                <h2 style={{ margin: "2px 0 0 0", fontSize: "20px", color: "#102c20" }}>Official Input Voucher Docket</h2>
              </div>
            </div>
            <button type="button" onClick={close} style={{ cursor: "pointer" }}>×</button>
          </div>

          <div style={{ background: isRedeemed ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "linear-gradient(135deg, #f0fdfa, #ccfbf1)", border: `1px solid ${isRedeemed ? "#86efac" : "#99f6e4"}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <small style={{ textTransform: "uppercase", fontSize: "10px", color: "#047857", fontWeight: 700, letterSpacing: "0.05em" }}>VOUCHER REFERENCE</small>
              <div style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 800, color: "#065f46" }}>{selected.voucherCode}</div>
              <div style={{ fontSize: "12px", color: "#047857", marginTop: "2px" }}>Beneficiary DFR ID: <b>{selected.farmerDfrId}</b></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, background: isRedeemed ? "#16a34a" : "#0284c7", color: "#ffffff" }}>
                {isRedeemed ? "✓ REDEEMED / DISTRIBUTED" : "● ISSUED / PENDING PICKUP"}
              </span>
              <div style={{ fontSize: "11px", color: "#0f766e", marginTop: "4px" }}>
                {isRedeemed ? `Redeemed on ${selected.redeemedAt || "14-Sep-2026"}` : `Expires ${selected.expiresAt}`}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Programme</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>{selected.programme}</div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginTop: "12px" }}>Entitlement / Input Package</div>
              <div style={{ fontSize: "13px", color: "#0f766e", fontWeight: 600, marginTop: "4px" }}>{selected.category}</div>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Authorized Subsidy Value</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#15803d", marginTop: "4px" }}>{selected.currency} {Number(selected.value).toFixed(2)}</div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginTop: "12px" }}>Designated Distribution Depot</div>
              <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, marginTop: "4px" }}>{selected.distributionSite}</div>
            </div>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px", fontSize: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div><span style={{ color: "#64748b" }}>Assigned Account:</span> <b>{selected.ownerEmail}</b></div>
            <div><span style={{ color: "#64748b" }}>Collection Window:</span> <b>{selected.appointmentAt || "Standard Depot Hours"}</b></div>
            <div><span style={{ color: "#64748b" }}>Issue Timestamp:</span> <b>{selected.createdAt || "2026-09-02"}</b></div>
            <div><span style={{ color: "#64748b" }}>Receipt Acknowledged:</span> <b>{selected.receiptAcknowledged ? "✓ Yes (By Farmer)" : isRedeemed ? "Pending Farmer Confirmation" : "Pending Distribution"}</b></div>
          </div>

          <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
            <button type="button" onClick={close} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
              Close
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              {manager && selected.status === "Issued" && send && (
                <button
                  type="button"
                  style={{ background: "#15803d", color: "#ffffff", border: 0, padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                  onClick={() => {
                    send("PATCH", { action: "redeem", voucherCode: selected.voucherCode });
                    close();
                  }}
                >
                  ✓ Confirm Distribution
                </button>
              )}
              {!manager && isRedeemed && !selected.receiptAcknowledged && send && (
                <button
                  type="button"
                  style={{ background: "#15803d", color: "#ffffff", border: 0, padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                  onClick={() => {
                    send("PATCH", { action: "acknowledge", voucherCode: selected.voucherCode });
                    close();
                  }}
                >
                  ✓ Acknowledge Receipt
                </button>
              )}
              <button
                type="button"
                onClick={() => printElementById("printable-voucher-docket", `Voucher-Docket-${selected.voucherCode}`)}
                style={{ background: "#0f766e", color: "#ffffff", border: 0, padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
              >
                🖨 Print / Save Docket
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if(modal==="receipt")return <div className="modal-wrap"><section id="printable-receipt-docket" className="register-modal glass compact-modal receipt-card"><div className="modal-head"><div><span>Official payment record</span><h2>Payment receipt</h2></div><button onClick={close}>×</button></div><dl><div><dt>Transaction</dt><dd>{selected.transactionCode}</dd></div><div><dt>Programme</dt><dd>{selected.programme}</dd></div><div><dt>Amount</dt><dd>{selected.currency} {Number(selected.amount).toFixed(2)}</dd></div><div><dt>Status</dt><dd>{selected.status}</dd></div><div><dt>Receipt reference</dt><dd>{selected.receiptRef}</dd></div><div><dt>Processed</dt><dd>{selected.processedAt||selected.createdAt}</dd></div></dl><div className="modal-actions"><button onClick={close}>Close</button><button onClick={()=>printElementById("printable-receipt-docket", `Payment-Receipt-${selected.transactionCode}`)}>Print / save receipt</button></div></section></div>;
  const edit=modal==="edit-account";const action=edit?"update-account":["voucher-issue","payment-issue"].includes(modal)?"issue":modal;
  return <div className="modal-wrap"><form className="register-modal glass compact-modal" onSubmit={e=>submit(e,action,edit?"PATCH":"POST")}><div className="modal-head"><div><span>Identity-protected workflow</span><h2>{modal==="voucher"?"Issue voucher":modal==="account"?"Add payout account":edit?"Update payout account":modal==="payment-issue"?"Report payment problem":"Report voucher problem"}</h2></div><button type="button" onClick={close}>×</button></div><div className="form-grid">
    {modal==="voucher"&&<><label>Beneficiary email*<input name="ownerEmail" type="email" required/></label><label>DFR ID*<input name="farmerDfrId" required/></label><label>Programme*<input name="programme" required/></label><label>Entitlement*<input name="category" required/></label><label>Value*<input name="value" type="number" required/></label><label>Currency<select name="currency"><option>USD</option><option>LRD</option></select></label><label>Expiry*<input name="expiresAt" type="date" required/></label><label>Distribution site*<input name="distributionSite" required/></label></>}
    {(modal==="account"||edit)&&<><input type="hidden" name="id" value={selected?.id||""}/>{!edit&&<label>DFR ID*<input name="farmerDfrId" required/></label>}<label>Provider*<select name="provider" defaultValue={selected?.provider||"MTN Mobile Money"}><option>MTN Mobile Money</option><option>Orange Money</option><option>Commercial bank</option></select></label><label>Account holder*<input name="accountName" defaultValue={selected?.accountName||""} required/></label><label>New mobile/account number*<input name="accountNumber" required/><small>Re-entry is required; the stored number remains masked.</small></label></>}
    {(modal==="voucher-issue"||modal==="payment-issue")&&<><input type="hidden" name="subjectType" value={modal==="payment-issue"?"Payment":"Voucher"}/><label>{modal==="payment-issue"?"Transaction / programme reference":"Voucher / programme reference"}<input name="subjectRef" defaultValue={selected?.transactionCode||""} placeholder={modal==="payment-issue"?"Enter if available":"Enter voucher code or programme name"}/></label><label>Problem category*<select name="category" defaultValue={selected?.category}>{modal==="payment-issue"?<><option>Expected payment missing</option><option>Payment failed</option><option>Incorrect amount</option><option>Wrong recipient account</option><option>Duplicate payment</option></>:<><option>Approved but voucher not issued</option><option>Voucher not received</option><option>Wrong entitlement</option><option>Distribution problem</option><option>Expired voucher</option></>}</select></label><label className="full-field">Description*<textarea name="description" required/></label></>}
  </div><div className="modal-actions"><button type="button" onClick={close}>Cancel</button><button>Submit →</button></div></form></div>;
}
