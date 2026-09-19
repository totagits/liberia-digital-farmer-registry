var e=[{id:`admin-1`,name:`Hon. J. Alexander Nuetah`,role:`Ministry administrator`,email:`admin@moa.gov.lr`,passwordHint:`admin2026`,institution:`Ministry of Agriculture`,countyScope:`National (15 Counties)`,districtScope:`All Districts`,description:`Full national registry authority, policy approval, governance controls, and system-wide administration.`,badgeColor:`#22c55e`,category:`admin`,avatar:`AN`,phone:`+231 886 512 300`,language:`English`,nin:`NIN-LR-100201`},{id:`farmer-1`,name:`Kollie Flomo`,role:`Farmer`,email:`kollie.flomo@farmer.lr`,passwordHint:`farmer2026`,institution:`Individual Smallholder Producer`,countyScope:`Nimba County`,districtScope:`Sanniquellie-Mahn`,description:`Registered smallholder cocoa producer. Access e-vouchers, mobile money subsidies, and grievance lodging.`,badgeColor:`#eab308`,category:`producer`,avatar:`KF`,phone:`+231 770 449 102`,language:`English / Kpelle`,nin:`NIN-LR-883921`},{id:`coop-1`,name:`Fatu Kamara`,role:`Cooperative representative`,email:`fatu.kamara@bongricefarmers.lr`,passwordHint:`coop2026`,institution:`Bong Central Rice Farmers Association`,countyScope:`Bong County`,districtScope:`Suakoko`,description:`Leads 215 lowland rice producers. Manages collective input requests, tractor rentals, and processing aggregation.`,badgeColor:`#f97316`,category:`producer`,avatar:`FK`},{id:`cao-1`,name:`Dr. Arthur Bob Karnuah`,role:`County agricultural officer`,email:`cao.nimba@moa.gov.lr`,passwordHint:`nimba2026`,institution:`MoA County Directorate`,countyScope:`Nimba County`,districtScope:`All Nimba Districts`,description:`County-level agricultural oversight, validation of provisional farmer records, and extension coordination.`,badgeColor:`#06b6d4`,category:`admin`,avatar:`AK`},{id:`dao-1`,name:`Tambaa Saa`,role:`District agricultural officer`,email:`dao.foya@moa.gov.lr`,passwordHint:`foya2026`,institution:`MoA District Extension Center`,countyScope:`Lofa County`,districtScope:`Foya District`,description:`Sub-county agricultural officer directly coordinating enumerators, farm spot-checks, and farmer disputes.`,badgeColor:`#3b82f6`,category:`admin`,avatar:`TS`},{id:`sr-enum-1`,name:`Musu Sirleaf`,role:`Senior enumerator`,email:`senior.enumerator@moa.gov.lr`,passwordHint:`enum2026`,institution:`MoA National Registry Unit`,countyScope:`Montserrado & Bomi`,districtScope:`Greater Monrovia / Careysburg`,description:`Supervises field enumerators, verifies provisional parcel boundaries, and manages data quality screening.`,badgeColor:`#a855f7`,category:`field`,avatar:`MS`},{id:`enum-1`,name:`Emmanuel Gaye`,role:`Enumerator`,email:`enumerator.bassa@moa.gov.lr`,passwordHint:`field2026`,institution:`Field Operations Roster`,countyScope:`Grand Bassa County`,districtScope:`District 2 & 3`,description:`Frontline field agent capturing offline farmer biographics, household surveys, and GPS polygon vertices.`,badgeColor:`#ec4899`,category:`field`,avatar:`EG`},{id:`gis-1`,name:`Garpue K. Wilson`,role:`GIS officer`,email:`gis.officer@moa.gov.lr`,passwordHint:`spatial2026`,institution:`National Cartographic & GIS Center`,countyScope:`National`,districtScope:`All`,description:`Validates WGS 84 parcel geometry, analyzes satellite NDVI crop health, resolves overlaps, and issues Map Certificates.`,badgeColor:`#10b981`,category:`field`,avatar:`GW`},{id:`ext-1`,name:`Dr. John Kerkulah`,role:`Extension agent`,email:`extension.bong@moa.gov.lr`,passwordHint:`advice2026`,institution:`MoA Central Agricultural Extension Service`,countyScope:`Bong & Margibi`,districtScope:`Suakoko / Kakata`,description:`Conducts on-farm advisory visits, logs pest & disease diagnostics, and connects producers to climate-smart inputs.`,badgeColor:`#84cc16`,category:`extension`,avatar:`JK`},{id:`prog-1`,name:`Victoria Cooper`,role:`Program officer`,email:`programmes@moa.gov.lr`,passwordHint:`subsidy2026`,institution:`National Rice & Tree Crop Development Fund`,countyScope:`National`,districtScope:`All`,description:`Manages input subsidy rounds, reviews farmer enrolment cases, scores eligibility, and issues e-vouchers.`,badgeColor:`#f59e0b`,category:`admin`,avatar:`VC`},{id:`fao-1`,name:`Dr. Bano Mbengue`,role:`Development-partner user`,email:`fao.oversight@un.org`,passwordHint:`fao2026`,institution:`Food and Agriculture Organization (FAO)`,countyScope:`National Oversight`,districtScope:`All`,description:`FAO Lead Technical Advisor monitoring RFP 137641 contractual deliverables, milestone evidence, and quality acceptance.`,badgeColor:`#38bdf8`,category:`oversight`,avatar:`BM`},{id:`audit-1`,name:`Sekou Dukuly`,role:`Security auditor`,email:`auditor@gac.gov.lr`,passwordHint:`audit2026`,institution:`General Auditing Commission (GAC)`,countyScope:`National Oversight`,districtScope:`All`,description:`Independent security auditor verifying cryptographic audit trails, data-sharing protocols, and privacy compliance.`,badgeColor:`#64748b`,category:`oversight`,avatar:`SD`}],t={ACTIVE_USER:`dfr_active_user_v1`,ACTIVE_ROLE:`dfr_active_role_v1`};function n(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(t.ACTIVE_USER);if(e)return JSON.parse(e)}catch{}return null}function r(){return e[0]}function i(e){if(typeof window<`u`)try{localStorage.setItem(t.ACTIVE_USER,JSON.stringify(e)),localStorage.setItem(t.ACTIVE_ROLE,e.role)}catch{}}function a(){if(typeof window<`u`)try{localStorage.removeItem(t.ACTIVE_USER),localStorage.removeItem(t.ACTIVE_ROLE)}catch{}}function o(e){if(typeof window>`u`)return null;try{let t={...n()||r(),...e};i(t);let a=`dfr_user_profiles_v1`,o=localStorage.getItem(a),s=o?JSON.parse(o):{};return s[t.id||t.email]=t,localStorage.setItem(a,JSON.stringify(s)),t}catch{}return null}function s(e){if(typeof window>`u`)return null;try{let t=localStorage.getItem(`dfr_user_profiles_v1`);if(t)return JSON.parse(t)[e]||null}catch{}return null}var c=`dfr_newly_registered_users_v1`;function l(){if(typeof window>`u`)return[];try{let e=localStorage.getItem(c);return e?JSON.parse(e):[]}catch{return[]}}function u(e){let t=Math.floor(1e3+Math.random()*9e3),n=`DFR-${e.county.slice(0,2).toUpperCase()}-${t}`,r=e.email?.trim()||`${e.dfrId.toLowerCase().replace(/[^a-z0-9]/g,`-`)}@farmer.moa.gov.lr`,i={id:`reg-${Date.now()}-${e.dfrId}`,name:e.name,role:e.role||`Farmer`,email:r,passwordHint:n,institution:e.institution||(e.role.includes(`Cooperative`)?`Agricultural Cooperative`:`Smallholder Producer`),countyScope:`${e.county} County`,districtScope:e.district||`Central District`,description:`Official ${e.role} account registered under ${e.dfrId}. Mandatory first-time password change active.`,badgeColor:`#16a34a`,category:e.category||`producer`,avatar:e.name.slice(0,2).toUpperCase(),phone:e.phone,mustChangePassword:!0,dfrId:e.dfrId,tempPassword:n,isNewlyRegistered:!0,registeredAt:new Date().toISOString()};if(typeof window<`u`)try{let t=[i,...l().filter(t=>t.dfrId!==e.dfrId)].slice(0,30);localStorage.setItem(c,JSON.stringify(t));let n=`dfr_user_profiles_v1`,r=localStorage.getItem(n),a=r?JSON.parse(r):{};a[i.id]=i,a[i.email.toLowerCase()]=i,i.phone&&(a[i.phone.replace(/[^0-9]/g,``)]=i),i.dfrId&&(a[i.dfrId]=i),localStorage.setItem(n,JSON.stringify(a))}catch{}return{user:i,tempPassword:n}}function d(e,t){if(typeof window>`u`)return null;try{let n=`dfr_user_profiles_v1`,r=localStorage.getItem(n),a=r?JSON.parse(r):{},o=e.trim().toLowerCase(),s=e.replace(/[^0-9]/g,``),u=a[o]||a[e]||(s?a[s]:void 0)||l().find(t=>t.email.toLowerCase()===o||t.dfrId===e||t.phone&&t.phone.replace(/[^0-9]/g,``)===s);if(!u)return null;let d={...u,passwordHint:t,mustChangePassword:!1,isNewlyRegistered:!1};a[d.id]=d,a[d.email.toLowerCase()]=d,d.phone&&(a[d.phone.replace(/[^0-9]/g,``)]=d),d.dfrId&&(a[d.dfrId]=d),localStorage.setItem(n,JSON.stringify(a));let f=l().map(e=>e.dfrId===d.dfrId?d:e);return localStorage.setItem(c,JSON.stringify(f)),i(d),d}catch{return null}}function f(e,t=`Official Registry Document`){if(typeof window>`u`)return;let n=document.getElementById(e);if(!n){window.print();return}let r=n.outerHTML,i=document.createElement(`iframe`);i.style.position=`fixed`,i.style.left=`-9999px`,i.style.top=`0`,i.style.width=`960px`,i.style.height=`1200px`,i.style.border=`none`,i.style.opacity=`0.01`,i.style.pointerEvents=`none`,i.style.zIndex=`-9999`,document.body.appendChild(i);let a=i.contentWindow?.document;if(!a){window.print(),i.remove();return}let o=window.location.origin+(window.location.pathname.startsWith(`/liberia-digital-farmer-registry`)?`/liberia-digital-farmer-registry/`:`/`);a.open(),a.write(`<!DOCTYPE html><html><head><base href="${o}" /><title>${t}</title><meta charset="utf-8" /><style>
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
  </style></head><body>${r}</body></html>`),a.close(),setTimeout(()=>{try{i.contentWindow?.focus(),i.contentWindow?.print()}catch{window.print()}finally{setTimeout(()=>{i.remove()},3e3)}},400)}export{l as a,u as c,n as i,i as l,a as n,s as o,d as r,f as s,e as t,o as u};