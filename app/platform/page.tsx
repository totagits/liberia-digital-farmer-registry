import PublicPage from "../public-page";
export default function PlatformPage(){return <PublicPage eyebrow="The national platform" title="One trusted agricultural record. Many authorized uses." intro="The DFR connects people, households, organizations, farms, parcels, programmes and services in a governed national system built for Liberia's connectivity and institutional realities." cards={[
 {icon:"◎",title:"Unified registry",text:"Persistent profiles for farmers, households, cooperatives, producer organizations, agribusinesses, farms and parcels.",action:"/dashboard"},
 {icon:"⌖",title:"Geospatial traceability",text:"Interactive parcel mapping, WGS 84 coordinates, area and perimeter calculation, topology checks and controlled GIS approval.",action:"/dashboard"},
 {icon:"↻",title:"Offline field operations",text:"Capture consented records without connectivity, queue them securely and synchronize with receipts and conflict handling.",action:"/dashboard"},
 {icon:"◇",title:"Identity and quality",text:"Provisional identifiers, duplicate checks, six-dimensional quality scoring, correction queues and approved DFR IDs.",action:"/dashboard"},
 {icon:"⇄",title:"Interoperability",text:"Standards-based exchange catalogue for identity, social protection, land, statistics, weather, payments and programmes."},
 {icon:"▣",title:"Analytics and reporting",text:"County coverage, value chains, inclusion, farm size, verification performance and scheduled operational reports.",action:"/dashboard"}
 ]} steps={[
 {title:"Register once",text:"Capture the person or organization, household, farm, parcels, production and consent through an entity-tailored workflow."},
 {title:"Verify and approve",text:"Supervisors, institutional stewards and GIS officers assess identity, completeness, uniqueness and spatial quality."},
 {title:"Serve many times",text:"Authorized programmes use the approved record for extension, targeting, vouchers, inputs, referrals and payments."},
 {title:"Monitor and improve",text:"Audit trails, quality indicators and outcome reporting support accountable decisions and continuous improvement."}
 ]} closing="Turn verified agricultural data into coordinated services and measurable rural outcomes."/>}
