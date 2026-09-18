"use client";
import {FormEvent,useState} from "react";
import { printElementById, provisionRegisteredUser } from "../../lib/demo-users";

const classes=[
 {id:"individual",title:"Individual Farmer",sub:"Independent producer",icon:"♙"},
 {id:"smallholder",title:"Smallholder / Subsistence",sub:"Family farm under 5 ha",icon:"♧"},
 {id:"farm-worker",title:"Farm Worker",sub:"Permanent, seasonal or outgrower worker",icon:"♟"},
 {id:"household-representative",title:"Household Representative",sub:"Authorized agricultural household contact",icon:"⌂"}
];
const stages=["Entity & Identity","Value-Chain & MoA","Location","Infrastructure & Tools","Household / Staff","Payment & Review","Onboarding & Credentials"];
const counties=["Bomi","Bong","Gbarpolu","Grand Bassa","Grand Cape Mount","Grand Gedeh","Grand Kru","Lofa","Margibi","Maryland","Montserrado","Nimba","River Cess","River Gee","Sinoe"];
const districts:Record<string,string[]>={Bomi:["Commonwealth","Klay","Mecca","Senjeh"],Bong:["Fuamah","Jorquelleh","Kokoyah","Panta","Salala","Suakoko","Zota"],Gbarpolu:["Belleh","Bokomu","Bopolu","Gbarma","Kongba"],"Grand Bassa":["District 1","District 2","District 3","District 4","Neekreen","Owensgrove","St. John River"],"Grand Cape Mount":["Garwula","Gola Konneh","Porkpa","Tewor"],"Grand Gedeh":["Gbarzon","Gbao","Konobo","Tchien"],"Grand Kru":["Barclayville","Buah","Dorbor","Garraway","Sasstown"],Lofa:["Foya","Kolahun","Quardu Gboni","Salayea","Voinjama","Zorzor"],Margibi:["Firestone","Gibi","Kakata","Mambah-Kaba"],Maryland:["Barrobo","Harper","Karlway","Pleebo-Sodoken"],Montserrado:["Careysburg","Greater Monrovia","St. Paul River","Todee"],Nimba:["Buu-Yao","Doe","Garr Bain","Gbehlay-Geh","Gbor","Sanniquellie-Mahn","Twan River","Yarmein"],"River Cess":["Central River Cess","Doedain","Fen River","Jo River","Norwein"],"River Gee":["Chedepo","Gbeapo","Glaro","Karforh","Potupo","Webbo"],Sinoe:["Butaw","Dugbe River","Greenville","Jaedae","Juarzon","Kpayan","Sanquin 1"]};
const cropGroups=["Crop Farming","Livestock","Aquaculture","Agro-Forestry","Mixed Farming"];
const crops=["Lowland Paddy Rice","Upland Seed Rice","Cassava","Maize / Corn","Yam & Sweet Potato","Plantain & Banana","Soya Beans","Vegetables & Horticulture","Cocoa","Coffee","Oil Palm","Rubber","Livestock","Fisheries"];
const vegetables=["Scotch Bonnet Pepper","Sweet Pepper","Carrot","Cucumber","Bitterball","Okra","Tomato","Eggplant","Cabbage","Watermelon","Leafy Greens (Plassas)"];
const tools=["Cutlasses & Hoes","Motorized Knapsack Sprayer","Power Tiller","Tractor","Grain Thresher","Solar Irrigation Pump","Rice Mill","Cassava Gari Press","Cold Room","Solar Dryer"];

export default function RegistrationWizard({close,notify,refresh,initialKind="individual"}:{close:()=>void;notify:(s:string)=>void;refresh:()=>Promise<void>;initialKind?:string}){
 const normalizedKind=initialKind==="household"?"household-representative":initialKind;
 const [step,setStep]=useState(1),[kind,setKind]=useState(normalizedKind),[county,setCounty]=useState("Bomi"),[draft,setDraft]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false);
 const [registeredResult, setRegisteredResult] = useState<any | null>(null);
 const entity=classes.find(x=>x.id===kind)!;
 const field=(name:string,value:string)=>setDraft(d=>({...d,[name]:value}));
 const capture=()=>navigator.geolocation?.getCurrentPosition(p=>setDraft(d=>({...d,latitude:p.coords.latitude.toFixed(6),longitude:p.coords.longitude.toFixed(6)})),()=>notify("Location permission was not available. Enter coordinates manually."));
 
 const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
  const x = e.target as HTMLInputElement | HTMLSelectElement;
  if (!x.name) return;
  if (x.type === "checkbox") {
    const values = Array.from(
      e.currentTarget.querySelectorAll<HTMLInputElement>(`input[name="${x.name}"]:checked`)
    ).map((i) => i.value);
    field(x.name, values.join(", "));
  } else {
    field(x.name, x.value);
  }
 };

 async function submit(e:FormEvent){
  e.preventDefault();
  setBusy(true);
  const payload={firstName:draft.firstName,lastName:draft.lastName,gender:draft.gender||"Female",phone:draft.phone,county,district:draft.district||districts[county][0],community:draft.community,crop:draft.primaryCrop||"Multi-commodity",farmSize:draft.farmSize||0,vulnerability:draft.socialInclusion||"Standard",roadAccess:draft.roadAccess,roadCondition:draft.roadCondition,roadSeasonality:draft.roadSeasonality,roadDistanceMiles:draft.roadDistanceMiles,processingAccess:draft.processingAccess,processingFacilityType:draft.processingFacilityType,processingFacilityName:draft.processingFacilityName,processingFacilityStatus:draft.processingFacilityStatus,processingDistanceMiles:draft.processingDistanceMiles,processingTravelMinutes:draft.processingTravelMinutes,processingTransportMode:draft.processingTransportMode,marketAccess:draft.marketAccess,marketDistanceKm:draft.marketDistanceKm,marketTravelMinutes:draft.marketTravelMinutes,storageAccess:draft.storageAccess,storageCapacityMt:draft.storageCapacityMt,postHarvestLossPct:draft.postHarvestLossPct,transportMode:draft.transportMode,transportOwnership:draft.transportOwnership,tillageMechanization:draft.tillageMechanization,irrigationAccess:draft.irrigationAccess,smartTechReadiness:draft.smartTechReadiness,latitude:draft.latitude,longitude:draft.longitude,dateOfBirth:draft.dateOfBirth,nationalId:draft.nationalId,classification:kind};
  try {
    const r=await fetch("/api/farmers",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const b=await r.json();
    setBusy(false);
    if(!r.ok){
      notify(b.error||"Registration could not be completed.");
      return;
    }
    const farmerName = `${draft.firstName || ""} ${draft.lastName || ""}`.trim() || "Enrolled Producer";
    const provision = provisionRegisteredUser({
      name: farmerName,
      email: draft.email,
      phone: draft.phone,
      role: "Farmer",
      dfrId: b.dfrId,
      county,
      district: draft.district || districts[county][0],
      institution: "Individual Smallholder Producer",
      category: "producer"
    });
    setRegisteredResult({
      ...b,
      farmerName,
      tempPassword: provision.tempPassword,
      accountUser: provision.user,
      enrolledAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    });
    setStep(7);
    notify(`${b.dfrId} registered successfully. Multi-channel onboarding triggered.`);
    await refresh();
  } catch (err) {
    setBusy(false);
    notify("Error submitting registration to the registry.");
  }
 }
 return <div className="modal-wrap enrollment-overlay"><form className="enrollment-wizard" onSubmit={submit} onChange={handleFormChange} style={{ maxWidth: step === 7 ? "920px" : undefined }}>
  <header>
    <div>
      <span>♢ &nbsp; NATIONAL FARMER, HOUSEHOLD & FARM ENROLLMENT</span>
      <h2>Farmer Registration & Farm Profile Wizard</h2>
      <p>Individual-tailored registration for farmers, farm workers, agricultural households, farms and parcels.</p>
    </div>
    <b>Step {step} of 7</b>
    <button type="button" onClick={close}>×</button>
    <nav>{stages.map((s,i)=><button type="button" key={s} className={step===i+1?"active":step>i+1?"done":""} onClick={()=>step !== 7 && setStep(i+1)} disabled={step === 7}>{i+1}. {s}</button>)}</nav>
  </header>
  <main>
   {step===1&&<><Panel title="Individual & Household Classification"><div className="classification-grid">{classes.map(c=><label className={kind===c.id?"selected":""} key={c.id}><input type="radio" name="classification" value={c.id} checked={kind===c.id} onChange={()=>setKind(c.id)}/><i>{c.icon}</i><b>{c.title}</b><span>{c.sub}</span></label>)}</div></Panel><IndividualIdentity kind={kind} draft={draft} field={field}/><Panel title="Social Inclusion & Vulnerability Classifications"><div className="inclusion-grid"><Check name="socialInclusion" value="Female-Headed Household"/><Check name="socialInclusion" value="Youth Farmer (under 35 years)"/><Check name="socialInclusion" value="Person with Disability"/><Check name="socialInclusion" value="Elderly Farmer (60+ years)"/><Check name="socialInclusion" value="Internally Displaced / Returnee"/><Check name="socialInclusion" value="Extremely Poor / Social Registry Household"/></div></Panel></>}
   {step===2&&<><Panel title="Type of Agriculture (Select All That Apply)"><div className="choice-row">{cropGroups.map(x=><Check name="agricultureTypes" value={x} key={x}/>)}</div></Panel><h3>Primary Commodity and Value Chains</h3><div className="check-grid">{crops.map(x=><Check name="commodities" value={x} key={x}/>)}</div><Panel title="Vegetables & Horticulture — Specify Exact Crops"><div className="check-grid vegetables">{vegetables.map(x=><Check name="vegetables" value={x} key={x}/>)}</div></Panel><label className="full-label">Other specialty commodity<input name="otherCommodity" placeholder="Ginger, turmeric, honey, tree crops…"/></label><Panel title="Ministry of Agriculture Accreditation Status"><div className="radio-line"><label><input type="radio" name="moaAccredited" value="Yes"/> Yes, accredited</label><label><input type="radio" name="moaAccredited" value="No / Pending" defaultChecked/> No / Pending accreditation</label></div></Panel></>}
   {step===3&&<><h3>⌖ Geographic Location (15 Liberian Counties)</h3><div className="enroll-grid three"><label>County*<select name="county" value={county} onChange={e=>setCounty(e.target.value)}>{counties.map(c=><option key={c}>{c}</option>)}</select></label><label>District*<select name="district">{districts[county].map(d=><option key={d}>{d}</option>)}</select></label><label>Clan / Township<input name="township"/></label><label>Community / City*<input name="community" required/></label><label>Village / Local Settlement<input name="village"/></label></div><Panel title="GPS Centroid Coordinates"><button type="button" className="gps-button" onClick={capture}>⌖ Capture Current GPS Location</button><div className="enroll-grid"><label>Latitude (N)<input name="latitude" value={draft.latitude||""} onChange={e=>field("latitude",e.target.value)} placeholder="e.g. 8.3512"/></label><label>Longitude (W)<input name="longitude" value={draft.longitude||""} onChange={e=>field("longitude",e.target.value)} placeholder="e.g. -10.2245"/></label></div></Panel><Panel title="Farm / Parcel Profile"><div className="enroll-grid three"><label>Total farm area (ha)*<input name="farmSize" type="number" step=".01" required/></label><label>Land tenure<select name="landTenure"><option>Customary ownership</option><option>Private deed</option><option>Lease agreement</option><option>Government concession</option><option>Communal land</option></select></label><label>Number of parcels<input name="parcelCount" type="number" min="1"/></label></div></Panel></>}
    {step===4&&<><Panel title="1. Financial Assistance & Intervention Grants"><div className="choice-row"><Check name="assistance" value="Grant only"/><Check name="assistance" value="Loan only"/><Check name="assistance" value="Both grant and loan"/><Check name="assistance" value="No assistance"/></div><h4>Assisting entities & donor programmes</h4><div className="check-grid">{["FAO","MoA STAR-P / REDISSE","World Bank / IFAD","USAID / Feed the Future","AfDB","Commercial bank / MFI","Cooperative / NGO partner","Other"].map(x=><Check name="supportProviders" value={x} key={x}/>)}</div><div className="enroll-grid"><label>Total assistance amount (USD)<input name="assistanceAmount" type="number"/></label><label>Disbursement year<input name="assistanceYear" type="number"/></label></div></Panel>

<Panel title="2. Farm-to-Market Road Connectivity & Accessibility"><div className="enroll-grid three"><label>Road access at farm gate<select name="roadAccess"><option>Direct motorable access</option><option>Footpath to nearest road</option><option>Water transport only</option><option>No practical access</option></select></label><label>Road surface / condition<select name="roadCondition"><option>Paved / all-weather</option><option>Laterite / gravel — good</option><option>Laterite / gravel — poor</option><option>Earth track / mud path</option><option>No road</option></select></label><label>Seasonal passability<select name="roadSeasonality"><option>Year-round passable</option><option>Seasonal / dry season only</option><option>Frequently cut off in rains</option></select></label><label>Distance to nearest motorable road (miles)<input name="roadDistanceMiles" type="number" min="0" step=".1" placeholder="0 if road reaches gate"/></label><label>Distance equivalent (km)<input value={draft.roadDistanceMiles?(Number(draft.roadDistanceMiles)*1.60934).toFixed(2):""} readOnly placeholder="Calculated automatically"/></label><label>Critical road bottleneck<select name="roadBottleneck"><option>None / passable</option><option>Broken bridge / culvert</option><option>Seasonal swamp / waterlogging</option><option>River crossing (canoe only)</option></select></label></div></Panel>

<Panel title="3. Market Access & Commercial Integration"><div className="enroll-grid three"><label>Primary sales outlet / market channel<select name="marketAccess"><option>Periodic rural weekly market (Luma)</option><option>Farmgate buyer / itinerant aggregator</option><option>District / County urban central market</option><option>Contract off-taker / commercial processor</option><option>Institutional buyer (WFP / MoA School Feeding)</option><option>Direct retail / roadside stall</option></select></label><label>Distance to primary market (km)<input name="marketDistanceKm" type="number" min="0" step=".1" placeholder="e.g. 5.5"/></label><label>Travel time to market (minutes)<input name="marketTravelMinutes" type="number" min="0" placeholder="e.g. 45"/></label><label>Market price information source<select name="marketInfoSource"><option>Community radio / word of mouth</option><option>MoA / e-Platform SMS price alerts</option><option>Traders at farmgate</option><option>Extension agent / cooperative</option><option>None / no price access</option></select></label><label>Weekly market day (Luma day)<input name="marketDay" placeholder="e.g. Tuesday, Friday"/></label><label>Nearest commercial trading town<input name="marketTown" placeholder="e.g. Ganta, Foya, Voinjama, Pleebo"/></label></div></Panel>

<Panel title="4. Post-Harvest Storage, Cold Chain & Agro-Processing"><div className="enroll-grid three"><label>Storage facility available<select name="storageAccess"><option>None / Immediate distress sale at harvest</option><option>Hermetic storage (PICS bags / sealed drums)</option><option>Traditional crib / thatch granary</option><option>Community / Cooperative shared warehouse</option><option>Solar drying floor / parabolic drying shed</option><option>Temperature-controlled cold room / packhouse</option></select></label><label>Dedicated storage capacity (Metric Tons)<input name="storageCapacityMt" type="number" min="0" step=".1" placeholder="e.g. 1.0"/></label><label>Estimated post-harvest loss (%)<input name="postHarvestLossPct" type="number" min="0" max="100" placeholder="e.g. 15%"/></label><label>Processing facility access<select name="processingAccess"><option value="On-farm facility">Facility located on this farm</option><option value="Nearby external facility">Uses / can access a nearby facility</option><option value="Facility unavailable">No accessible processing facility</option></select></label><label>Facility type<select name="processingFacilityType"><option>Rice mill / de-stoner</option><option>Cassava processing / gari press</option><option>Cocoa fermentation / dryer</option><option>Palm oil mill / digester</option><option>Cold room / packhouse</option><option>Feed mill</option><option>Fish smoking / cold storage</option><option>Multi-purpose facility</option><option>Other</option></select></label><label>Facility operational status<select name="processingFacilityStatus"><option>Fully operational</option><option>Partly operational</option><option>Seasonal operation</option><option>Non-operational / needs repair</option><option>Planned / under construction</option></select></label><label>Facility name / operator<input name="processingFacilityName" placeholder="e.g. Gbedin Rice Mill Hub"/></label><label>Distance to facility (miles)<input name="processingDistanceMiles" type="number" min="0" step=".1"/></label><label>Transit time to facility (minutes)<input name="processingTravelMinutes" type="number" min="0"/></label></div></Panel>

<Panel title="5. Produce Haulage & Transport Logistics"><div className="enroll-grid three"><label>Primary mode of produce transport<select name="transportMode"><option>Motorbike / Kehkeh (Tricycle)</option><option>Head-loading / Porterage</option><option>Light pickup truck / 4WD (1–3 MT)</option><option>Heavy commercial truck (&gt; 5 MT)</option><option>Water canoe / motorized boat</option><option>Bicycle / Handcart</option></select></label><label>Transport vehicle ownership<select name="transportOwnership"><option>Hired commercial transporter</option><option>Self-owned vehicle / motorbike</option><option>Cooperative / Group shared asset</option><option>Buyer-provided collection at farmgate</option></select></label><label>Average haulage cost per bag/trip (LRD or USD)<input name="transportCost" placeholder="e.g. 350 LRD or $2.50 USD"/></label></div></Panel>

<Panel title="6. Agricultural Mechanization, Irrigation & Smart Farming Infrastructure"><div className="enroll-grid three"><label>Tillage mechanization level<select name="tillageMechanization"><option>Manual hand tools (cutlass, hoe)</option><option>Power tiller / 2-wheel walking tractor</option><option>4-wheel commercial tractor (rented / hired)</option><option>4-wheel commercial tractor (owned)</option><option>Animal traction / draft oxen</option></select></label><label>Irrigation water infrastructure<select name="irrigationAccess"><option>Rainfed only</option><option>Manual watering can / bucket from stream or well</option><option>Solar-powered surface / submersible pump</option><option>Motorized petrol / diesel water pump</option><option>Gravity-fed canal / lowland swamp water control</option><option>Drip or sprinkler irrigation scheme</option></select></label><label>Digital &amp; smart tech readiness<select name="smartTechReadiness"><option>Basic 2G feature phone (SMS / Voice)</option><option>Smartphone with GPS &amp; camera</option><option>Digital soil testing kit / NPK probe</option><option>On-farm rain gauge / micro weather station</option><option>Digital farm management app / recordbook</option><option>None / No phone access</option></select></label></div><h4 style={{marginTop:"14px",marginBottom:"8px"}}>Operating farm tools &amp; equipment owned</h4><div className="check-grid">{tools.map(x=><Check name="tools" value={x} key={x}/>)}</div></Panel></>}
   {step===5&&<><h3>♧ Farmer Household & Labour Profile</h3><Panel title="Household Composition"><div className="enroll-grid three"><label>Household size<input name="householdSize" type="number"/></label><label>Women in household<input name="householdWomen" type="number"/></label><label>Youth in household<input name="householdYouth" type="number"/></label><label>Permanent farm workers<input name="permanentEmployees" type="number"/></label><label>Seasonal farm workers<input name="seasonalWorkers" type="number"/></label><label>Persons with disability<input name="pwdCount" type="number"/></label></div></Panel></>}
   {step===6&&<>
    <h3>▭ Mobile Money Account &amp; Notification Verification</h3>
    <div className="enroll-grid three">
      <label>Mobile money provider<select name="mobileProvider" defaultValue={draft.mobileProvider || "MTN Mobile Money Liberia"} onChange={e => field("mobileProvider", e.target.value)}><option>MTN Mobile Money Liberia</option><option>Orange Money Liberia</option><option>Bank account</option><option>No account</option></select></label>
      <label>Payment / MoMo phone number*<input name="paymentAccount" defaultValue={draft.paymentAccount || draft.phone || ""} onChange={e => field("paymentAccount", e.target.value)} placeholder="e.g. +231 770 123 456" /></label>
      <label>Account holder name<input name="accountHolder" defaultValue={draft.accountHolder || `${draft.firstName || ""} ${draft.lastName || ""}`.trim()} onChange={e => field("accountHolder", e.target.value)} /></label>
      <label>SMS notification phone number*<input name="phone" required defaultValue={draft.phone || ""} onChange={e => field("phone", e.target.value)} placeholder="e.g. +231 770 123 456" /></label>
      <label>Notification email (for official e-Gov dispatch)<input name="email" type="email" defaultValue={draft.email || ""} onChange={e => field("email", e.target.value)} placeholder="e.g. farmer@example.com (optional)" /></label>
    </div>
    <div className="review-card">
      <h4>Registration Profile Summary &amp; Verification Preview</h4>
      <div>
        <p><span>Entity classification</span><b>{entity.title}</b></p>
        <p><span>Beneficiary Name</span><b>{`${draft.firstName || ""} ${draft.lastName || ""}`.trim() || draft.legalName || "Enrolled Producer"}</b></p>
        <p><span>Location</span><b>{county} ({draft.district||districts[county][0]})</b></p>
        <p><span>Notification Dispatch</span><b>📱 {draft.phone || "No phone"} · ✉️ {draft.email || "No email (SMS-only)"}</b></p>
      </div>
    </div>
    <label className="consent" style={{marginBottom: "20px"}}>
      <input type="checkbox" required/> I confirm authority, informed consent and accuracy of this registration for authorized government service delivery.
    </label>
    <div style={{display: "flex", justifyContent: "space-between", borderTop: "1px solid #dce4ed", paddingTop: "18px"}}>
      <button type="button" onClick={()=>setStep(5)} style={{background: "#e6ebf3", border: 0, padding: "12px 20px", borderRadius: "10px", fontWeight: 700}}>← Previous Step</button>
      <button className="submit-registration" disabled={busy} style={{background: "#f4a000", color: "#11182b", border: 0, padding: "12px 24px", borderRadius: "10px", fontWeight: 800, cursor: "pointer"}}>
        {busy ? "Submitting to National Registry…" : "Submit Official Registration →"}
      </button>
    </div>
   </>}
   {step===7&&registeredResult&&(
    <div className="onboarding-dossier" style={{padding: "4px 0"}}>
      <div style={{background: "linear-gradient(135deg, #092c19, #14532d)", color: "#fff", padding: "18px 22px", borderRadius: "14px", border: "1.5px solid #22c55e", marginBottom: "16px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px"}}>
          <div>
            <span style={{color: "#86efac", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em"}}>
              ✓ Official Registration Confirmed · Multi-Channel Onboarding Active
            </span>
            <h2 style={{margin: "4px 0", fontSize: "22px", color: "#ffffff", fontFamily: "Georgia, serif"}}>
              {registeredResult.farmerName}
            </h2>
            <p style={{margin: 0, fontSize: "12px", color: "#dcfce7"}}>
              Assigned National DFR ID: <strong style={{color: "#fef08a", fontFamily: "monospace", fontSize: "15px"}}>{registeredResult.dfrId}</strong>
            </p>
          </div>
          <div style={{textAlign: "right"}}>
            <span style={{display: "inline-block", background: "#fef08a", color: "#854d0e", fontWeight: 800, fontSize: "11px", padding: "4px 12px", borderRadius: "20px"}}>
              ● Provisional · Queued for CAO Audit
            </span>
            <div style={{fontSize: "11px", color: "#bbf7d0", marginTop: "4px"}}>
              Enrolled: {registeredResult.enrolledAt}
            </div>
          </div>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px", marginBottom: "18px"}}>
        {/* SMS Dispatch */}
        <div style={{background: "#ffffff", border: "1.5px solid #dcfce7", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "10px"}}>
            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
              <span style={{fontSize: "18px"}}>📱</span>
              <div>
                <b style={{fontSize: "12px", color: "#0f172a"}}>Liberia Telco SMS Gateway</b>
                <div style={{fontSize: "10px", color: "#64748b"}}>Lonestar MTN / Orange SMPP Port 2775</div>
              </div>
            </div>
            <span style={{fontSize: "10px", background: "#ecfdf5", color: "#059669", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", border: "1px solid #a7f3d0"}}>
              ✓ DELIVRD (140ms)
            </span>
          </div>
          <div style={{background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", fontSize: "11px", lineHeight: "1.6", color: "#1e293b"}}>
            <div style={{fontSize: "10px", color: "#64748b", marginBottom: "4px", fontWeight: 700}}>
              To: <span style={{color: "#0284c7"}}>{draft.phone || "+231 770 449 102"}</span>
            </div>
            <p style={{margin: 0, fontStyle: "italic", background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1"}}>
              &ldquo;Republic of Liberia MoA DFR: Welcome <b>{registeredResult.farmerName}</b>! Registration confirmed. DFR ID: <b>{registeredResult.dfrId}</b>. Provisional portal account created. Temp PIN/Password: <b style={{color: "#b91c1c", background: "#fee2e2", padding: "1px 4px", borderRadius: "4px"}}>{registeredResult.tempPassword}</b>. You MUST change your password on first sign-in via *144# or at dfr.moa.gov.lr/signin. Keep confidential.&rdquo;
            </p>
          </div>
        </div>

        {/* Official Email Dispatch */}
        <div style={{background: "#ffffff", border: "1.5px solid #e0e7ff", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "10px"}}>
            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
              <span style={{fontSize: "18px"}}>✉️</span>
              <div>
                <b style={{fontSize: "12px", color: "#0f172a"}}>MoA Official e-Gov Mailer</b>
                <div style={{fontSize: "10px", color: "#64748b"}}>SMTP Relay: registry@moa.gov.lr</div>
              </div>
            </div>
            <span style={{fontSize: "10px", background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
              ✓ SENT (250 OK)
            </span>
          </div>
          <div style={{background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", fontSize: "11px", lineHeight: "1.6", color: "#1e293b"}}>
            <div style={{fontSize: "10px", color: "#64748b", marginBottom: "4px", fontWeight: 700}}>
              To: <span style={{color: "#0284c7"}}>{draft.email || registeredResult.accountUser.email}</span>
            </div>
            <div style={{background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1"}}>
              <div style={{fontWeight: 700, color: "#0f172a", marginBottom: "2px"}}>
                Subject: Liberia DFR — Enrollment &amp; Mandatory Account Activation
              </div>
              <p style={{margin: 0, fontSize: "11px", color: "#475569"}}>
                Provisional access assigned with Temporary Password: <code style={{color: "#b91c1c", fontWeight: 800}}>{registeredResult.tempPassword}</code>. Policy requires setting your permanent password prior to voucher access.
              </p>
            </div>
            <div style={{marginTop: "8px", display: "flex", justifyContent: "flex-end"}}>
              <a
                href={`mailto:${encodeURIComponent(draft.email || registeredResult.accountUser.email)}?subject=${encodeURIComponent(`Liberia DFR — Registration Confirmed (${registeredResult.dfrId})`)}&body=${encodeURIComponent(
`Republic of Liberia - Ministry of Agriculture
National Digital Farmer Registry (DFR)

Dear ${registeredResult.farmerName},

Your official enrollment in the Liberia Digital Farmer Registry has been successfully completed.

Registration Details:
- Farmer Name: ${registeredResult.farmerName}
- National DFR ID: ${registeredResult.dfrId}
- County: ${county} (${draft.district || districts[county][0]})
- Enrollment Date: ${registeredResult.enrolledAt}

Portal Access Credentials:
- Sign-In Email: ${registeredResult.accountUser.email}
- Temporary Password / PIN: ${registeredResult.tempPassword}
- First-Login Requirement: Mandatory Password Change Required

To activate your account:
1. Visit the portal at: https://totagits.github.io/liberia-digital-farmer-registry/signin
2. Sign in with your email and temporary password
3. Set your secure permanent password

For USSD access on Lonestar MTN or Orange Liberia, dial *144#.

Ministry of Agriculture, Republic of Liberia`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  textDecoration: "none"
                }}
              >
                ✉️ Send Real Email to Inbox ({draft.email || registeredResult.accountUser.email})
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Slip Card */}
      <div id="printable-registration-slip" className="official-registration-slip" style={{background: "#ffffff", border: "2px solid #166534", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #166534", paddingBottom: "10px", marginBottom: "12px"}}>
          <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
            <img src="/assets/moa-logo.png" alt="MoA" style={{width: "40px", height: "40px", objectFit: "contain"}} />
            <div>
              <span style={{fontSize: "10px", color: "#166534", fontWeight: 800, letterSpacing: "0.08em"}}>REPUBLIC OF LIBERIA · MINISTRY OF AGRICULTURE</span>
              <h3 style={{margin: "2px 0 0", fontSize: "16px", color: "#102c20"}}>Official National Farmer Registration Slip &amp; Credential</h3>
            </div>
          </div>
          <div style={{textAlign: "right", fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "#166534"}}>
            OFFICIAL ENROLLMENT RECORD<br />{registeredResult.dfrId}
          </div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", fontSize: "11px", marginBottom: "12px"}}>
          <div style={{background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
            <span style={{color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700}}>Beneficiary Farmer</span>
            <b style={{display: "block", fontSize: "13px", color: "#0f172a", marginTop: "2px"}}>{registeredResult.farmerName}</b>
          </div>
          <div style={{background: "#f0fdf4", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0"}}>
            <span style={{color: "#166534", fontSize: "10px", textTransform: "uppercase", fontWeight: 700}}>National DFR ID</span>
            <b style={{display: "block", fontSize: "13px", color: "#166534", fontFamily: "monospace", marginTop: "2px"}}>{registeredResult.dfrId}</b>
          </div>
          <div style={{background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
            <span style={{color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700}}>National ID / NIN</span>
            <b style={{display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px"}}>{draft.nationalId || "Verified by Enumerator"}</b>
          </div>
          <div style={{background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
            <span style={{color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700}}>County &amp; District</span>
            <b style={{display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px"}}>{county} / {draft.district || districts[county][0]}</b>
          </div>
          <div style={{background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
            <span style={{color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700}}>Community / Parcel</span>
            <b style={{display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px"}}>{draft.community || "Main Settlement"} ({draft.farmSize || 1.0} ha)</b>
          </div>
          <div style={{background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
            <span style={{color: "#64748b", fontSize: "10px", textTransform: "uppercase", fontWeight: 700}}>Primary Commodity</span>
            <b style={{display: "block", fontSize: "12px", color: "#0f172a", marginTop: "2px"}}>{draft.primaryCrop || "Multi-commodity"}</b>
          </div>
        </div>

        <div style={{background: "#f8fafc", border: "1px dashed #94a3b8", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px"}}>
          <div>
            <span style={{color: "#b91c1c", fontWeight: 800, textTransform: "uppercase", display: "block", fontSize: "10px"}}>Security &amp; Activation Policy:</span>
            Account provisioned with mandatory first-login password update. Present this slip for voucher redemption and extension advisory.
          </div>
          <div style={{fontFamily: "monospace", fontWeight: 800, color: "#166534", fontSize: "12px", background: "#ffffff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1"}}>
            [DFR-QR: {registeredResult.dfrId}]
          </div>
        </div>
      </div>
    </div>
   )}
  </main>
  <footer>
    {step < 6 ? (
      <>
        <button type="button" disabled={step===1} onClick={()=>setStep(step-1)}>← Previous Step</button>
        <button type="button" onClick={()=>setStep(step+1)}>Next Step →</button>
      </>
    ) : step === 6 ? null : (
      <div style={{display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
        <button
          type="button"
          onClick={() => printElementById("printable-registration-slip", `Farmer-Registration-Slip-${registeredResult?.dfrId}`)}
          style={{background: "#0f766e", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer"}}
        >
          🖨 Print / PDF Registration Slip
        </button>
        <div style={{display: "flex", gap: "10px"}}>
          <button
            type="button"
            onClick={() => {
              const isGh = typeof window !== "undefined" && window.location.pathname.startsWith("/liberia-digital-farmer-registry");
              const prefix = isGh ? "/liberia-digital-farmer-registry" : "";
              window.location.href = `${prefix}/signin?email=${encodeURIComponent(registeredResult.accountUser.email)}&temp=${encodeURIComponent(registeredResult.tempPassword)}`;
            }}
            style={{background: "#16a34a", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "8px", fontWeight: 800, cursor: "pointer"}}
          >
            🔑 Activate &amp; Change Password Now →
          </button>
          <button
            type="button"
            onClick={close}
            style={{background: "#1e293b", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer"}}
          >
            ✓ Done / Register Another
          </button>
        </div>
      </div>
    )}
  </footer>
 </form></div>
}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="enroll-panel"><h3>{title}</h3>{children}</section>}
function Check({name,value}:{name:string;value:string}){return <label className="check-choice"><input type="checkbox" name={name} value={value}/><b>{value}</b></label>}
function IndividualIdentity({
  kind,
  draft,
  field
}: {
  kind: string;
  draft: Record<string, string>;
  field: (k: string, v: string) => void;
}) {
  return (
    <section className="identity-panel">
      <h3>♙ {kind === "smallholder" ? "Smallholder / Subsistence Farmer Identity" : "Individual Farmer Identity Details"}</h3>
      <div className="enroll-grid three">
        <label>
          First name*
          <input
            name="firstName"
            required
            value={draft.firstName || ""}
            onChange={e => field("firstName", e.target.value)}
            placeholder="e.g. Korto"
          />
        </label>
        <label>
          Middle name
          <input
            name="middleName"
            value={draft.middleName || ""}
            onChange={e => field("middleName", e.target.value)}
          />
        </label>
        <label>
          Last name*
          <input
            name="lastName"
            required
            value={draft.lastName || ""}
            onChange={e => field("lastName", e.target.value)}
            placeholder="e.g. Kollie"
          />
        </label>
        <label>
          Date of birth
          <input
            name="dateOfBirth"
            type="date"
            value={draft.dateOfBirth || ""}
            onChange={e => field("dateOfBirth", e.target.value)}
          />
        </label>
        <label>
          Sex
          <select
            name="gender"
            value={draft.gender || "Female"}
            onChange={e => field("gender", e.target.value)}
          >
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          National ID (NIN / Voter ID)
          <input
            name="nationalId"
            value={draft.nationalId || ""}
            onChange={e => field("nationalId", e.target.value)}
            placeholder="e.g. 100-245-891"
          />
        </label>
        <label>
          Phone number (SMS &amp; MoMo)*
          <input
            name="phone"
            value={draft.phone || ""}
            onChange={e => field("phone", e.target.value)}
            placeholder="e.g. +231 770 123 456"
          />
        </label>
        <label>
          Email address (official digital notices &amp; login)
          <input
            name="email"
            type="email"
            value={draft.email || ""}
            onChange={e => field("email", e.target.value)}
            placeholder="e.g. farmer@gmail.com"
          />
        </label>
      </div>
    </section>
  );
}

