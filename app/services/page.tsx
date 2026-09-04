import PublicPage from "../public-page";
export default function ServicesPage(){return <PublicPage eyebrow="Services for farmers and institutions" title="From registration to assistance, every service is traceable." intro="Farmers receive a clear self-service view while authorized officers manage programmes, extension visits, entitlements, payments, grievances and support through controlled workflows." cards={[
 {icon:"＋",title:"Registration and profile updates",text:"Entity-tailored enrolment, household composition, crops, livestock, equipment, vulnerability, roads and processing access.",action:"/dashboard"},
 {icon:"♧",title:"Agricultural extension",text:"Request assistance, schedule visits, document advice and referrals, follow outcomes and maintain an auditable service history.",action:"/dashboard"},
 {icon:"▦",title:"Programme applications",text:"Discover eligible programmes, submit applications, provide evidence and track review decisions without configuring programmes as a farmer.",action:"/dashboard"},
 {icon:"◇",title:"Vouchers and inputs",text:"View issued entitlements, collection instructions and receipts; report missing or incorrect benefits without self-issuing vouchers.",action:"/dashboard"},
 {icon:"$",title:"Payments and mobile money",text:"Maintain a protected payout account, request verification, view payment status and receipts, and report failed transactions.",action:"/dashboard"},
 {icon:"!",title:"Grievance and help desk",text:"Submit confidential, trackable cases; exchange evidence; receive SLA updates and appeal or reopen where permitted.",action:"/dashboard"}
 ]} steps={[
 {title:"Discover",text:"See services and programmes available to the authenticated person, household or organization."},
 {title:"Request",text:"Submit the appropriate application, assistance request, grievance or account-verification request."},
 {title:"Review",text:"Authorized officers assess eligibility and evidence within their institution, programme and geographic scope."},
 {title:"Deliver and confirm",text:"Record visits, entitlements, disbursements, receipts, feedback and outcomes in the beneficiary history."}
 ]} closing="Give farmers a simple front door to services while protecting institutional controls."/>}
