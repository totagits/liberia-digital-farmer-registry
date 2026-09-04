import PublicPage from "../public-page";
export default function GovernancePage(){return <PublicPage eyebrow="Institutional governance and data stewardship" title="Official data has an owner, a steward and an accountable decision trail." intro="The Ministry of Agriculture leads the DFR with defined contributions from MGCSP, CDA, LISGIS, local authorities, farmer organizations and development partners." cards={[
 {icon:"◈",title:"Institutional responsibilities",text:"MoA ownership, MGCSP social-protection validation, CDA cooperative certification and LISGIS statistical and geospatial assurance.",action:"/dashboard"},
 {icon:"✓",title:"Controlled approvals",text:"Configurable submission, review, correction, approval and publication workflows with maker-checker separation.",action:"/dashboard"},
 {icon:"▤",title:"Data stewardship",text:"Dataset owner, steward, custodian, approving authority, sensitivity, review schedule and stale-data alerts.",action:"/dashboard"},
 {icon:"⌘",title:"Standards and metadata",text:"Version-controlled data dictionaries, classifications, administrative codes, boundary references and change history.",action:"/dashboard"},
 {icon:"⚿",title:"Privacy and access",text:"Consent lifecycle, role- and scope-based authorization, institutional segregation, access review and complete audit evidence.",action:"/dashboard"},
 {icon:"⇄",title:"Data sharing",text:"Agreement register, permitted purpose, fields, retention rules, interface mappings and monitored exchange logs.",action:"/dashboard"}
 ]} steps={[
 {title:"Institution submits",text:"The responsible contributor records content and evidence under its official institutional account."},
 {title:"Steward reviews",text:"The dataset steward checks standards, quality, authority, sensitivity and required corrections."},
 {title:"Authority approves",text:"The designated approving institution records a signed decision and publication conditions."},
 {title:"System monitors",text:"Review dates, exchanges, incidents, decisions and downstream use remain attributable and auditable."}
 ]} closing="Build trust through institutional ownership, transparent approvals and enforceable data rules."/>}
