import PublicPage from "../public-page";
export default function AboutPage(){return <PublicPage eyebrow="About the Digital Farmer Registry" title="A government-led foundation for agricultural modernization." intro="The DFR is designed as national digital public infrastructure that improves farmer visibility, agricultural planning, service coordination, social-protection targeting and evidence-based policy." cards={[
 {icon:"LR",title:"National mandate",text:"A coordinated national registry serving all 15 counties and supporting consistent agricultural data management."},
 {icon:"MoA",title:"Government leadership",text:"The Ministry of Agriculture provides policy oversight, agricultural content validation and operational ownership."},
 {icon:"FAO",title:"Technical cooperation",text:"The platform reflects FAO's assignment scope for assessment, design, SOPs, software, capacity development, testing and rollout."},
 {icon:"♙",title:"Farmer-centred design",text:"Consent, inclusion, low-connectivity access, grievance redress and transparent benefit histories protect the people the system serves."},
 {icon:"∞",title:"Register once, use many times",text:"Authorized services reuse verified data instead of repeatedly burdening farmers with disconnected registrations."},
 {icon:"↗",title:"Long-term sustainability",text:"Open standards, government stewardship, capacity transfer and deployable infrastructure reduce dependency and support national ownership."}
 ]} steps={[
 {title:"Assess",text:"Inventory existing registries, programmes, systems, standards, capacities and institutional responsibilities."},
 {title:"Design",text:"Agree the data model, architecture, governance framework, safeguards, SOPs and implementation plan."},
 {title:"Implement",text:"Configure the platform, migrate validated data, test integrations, train users and pilot operational workflows."},
 {title:"Scale and sustain",text:"Roll out nationally, measure performance, transfer knowledge and govern continuous improvement."}
 ]} closing="Connect farmers, institutions and programmes through one sustainable national capability."/>}
