"use client";

const individualTypes = [
  { id: "individual", title: "Individual farmer", detail: "Farmer, farm worker, household, farm and parcel profile", icon: "IF" },
  { id: "household", title: "Farmer household", detail: "Household representative, members, vulnerability and linked farms", icon: "HH" },
];

const organizationTypes = [
  { id: "group", title: "Farmer group", detail: "Informal association, membership and community endorsement", icon: "FG" },
  { id: "cooperative", title: "Cooperative", detail: "CDA registration, board, members and certification", icon: "CO" },
  { id: "producer", title: "Producer organization", detail: "Chapters, officers, commodities and market services", icon: "PO" },
  { id: "agribusiness", title: "Agribusiness", detail: "Business identity, farms, facilities, workforce and production", icon: "AB" },
  { id: "provider", title: "Service provider", detail: "Accreditation, service coverage, equipment and contracts", icon: "SP" },
  { id: "supplier", title: "Supplier", detail: "Licences, catalogues, warehouses, inputs and fulfilment", icon: "SU" },
  { id: "financial", title: "Financial institution", detail: "Regulatory identity, products, service points and transactions", icon: "FI" },
];

export default function RegistrationRouter({ close, openFarmer, openOrganization }:{
  close:()=>void;
  openFarmer:(type:string)=>void;
  openOrganization:(type:string)=>void;
}){
  return <div className="modal-wrap registration-router-overlay" style={{ zIndex: 10000 }} onMouseDown={e=>{if(e.currentTarget===e.target)close()}}>
    <section className="registration-router glass" role="dialog" aria-modal="true" aria-labelledby="registration-router-title">
      <header>
        <div><span>Register once, use many times</span><h2 id="registration-router-title">What would you like to register?</h2><p>Select a subject type to open the correct governed workflow.</p></div>
        <button type="button" onClick={close} aria-label="Close registration selector">×</button>
      </header>
      <div className="router-section">
        <div className="router-label"><b>People, households and farms</b><span>Managed in the Farmer Registry</span></div>
        <div className="router-grid individuals">{individualTypes.map(x=><button type="button" key={x.id} onClick={()=>openFarmer(x.id)}><i>{x.icon}</i><span><b>{x.title}</b><small>{x.detail}</small></span><strong>→</strong></button>)}</div>
      </div>
      <div className="router-section">
        <div className="router-label"><b>Groups, organizations and service actors</b><span>Managed in the Party & Organization Registry</span></div>
        <div className="router-grid">{organizationTypes.map(x=><button type="button" key={x.id} onClick={()=>openOrganization(x.title)}><i>{x.icon}</i><span><b>{x.title}</b><small>{x.detail}</small></span><strong>→</strong></button>)}</div>
      </div>
      <footer><span>Only roles with <b>registry.create</b> permission can submit a registration.</span><button type="button" onClick={close}>Cancel</button></footer>
    </section>
  </div>
}
