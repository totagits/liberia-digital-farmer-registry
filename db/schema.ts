import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const farmers = sqliteTable("farmers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dfrId: text("dfr_id").notNull().unique(),
  provisionalId: text("provisional_id").notNull().default(""),
  approvedDfrId: text("approved_dfr_id").notNull().default(""),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull().default(""),
  county: text("county").notNull(),
  district: text("district").notNull(),
  community: text("community").notNull(),
  crop: text("crop").notNull(),
  farmSize: real("farm_size").notNull().default(0),
  status: text("status").notNull().default("Pending verification"),
  vulnerability: text("vulnerability").notNull().default("Standard"),
  roadAccess: text("road_access").notNull().default(""),
  roadCondition: text("road_condition").notNull().default(""),
  roadSeasonality: text("road_seasonality").notNull().default(""),
  roadDistanceMiles: real("road_distance_miles").notNull().default(0),
  processingAccess: text("processing_access").notNull().default(""),
  processingFacilityType: text("processing_facility_type").notNull().default(""),
  processingFacilityName: text("processing_facility_name").notNull().default(""),
  processingFacilityStatus: text("processing_facility_status").notNull().default(""),
  processingDistanceMiles: real("processing_distance_miles").notNull().default(0),
  processingTravelMinutes: integer("processing_travel_minutes").notNull().default(0),
  processingTransportMode: text("processing_transport_mode").notNull().default(""),
  marketAccess: text("market_access").notNull().default(""),
  marketDistanceKm: real("market_distance_km").notNull().default(0),
  marketTravelMinutes: integer("market_travel_minutes").notNull().default(0),
  storageAccess: text("storage_access").notNull().default(""),
  storageCapacityMt: real("storage_capacity_mt").notNull().default(0),
  postHarvestLossPct: integer("post_harvest_loss_pct").notNull().default(0),
  transportMode: text("transport_mode").notNull().default(""),
  transportOwnership: text("transport_ownership").notNull().default(""),
  tillageMechanization: text("tillage_mechanization").notNull().default(""),
  irrigationAccess: text("irrigation_access").notNull().default(""),
  smartTechReadiness: text("smart_tech_readiness").notNull().default(""),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const accessAssignments = sqliteTable("access_assignments", {
  id:integer("id").primaryKey({autoIncrement:true}), email:text("email").notNull().unique(), displayName:text("display_name").notNull(),
  role:text("role").notNull(), institution:text("institution").notNull(), programmeScope:text("programme_scope").notNull().default("All authorized programmes"),
  countyScope:text("county_scope").notNull().default("National"), districtScope:text("district_scope").notNull().default("All"),
  sensitivityCeiling:text("sensitivity_ceiling").notNull().default("Highly restricted"), capabilities:text("capabilities").notNull().default("[]"),
  status:text("status").notNull().default("Active"), reviewedAt:text("reviewed_at").notNull(), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sopControls = sqliteTable("sop_controls", {
  id:integer("id").primaryKey({autoIncrement:true}), sopCode:text("sop_code").notNull().unique(), title:text("title").notNull(), version:text("version").notNull(),
  ownerInstitution:text("owner_institution").notNull(), stage:text("stage").notNull(), effectiveDate:text("effective_date").notNull().default(""),
  nextReviewDate:text("next_review_date").notNull(), requiredApprovals:text("required_approvals").notNull().default("[]"), approvals:text("approvals").notNull().default("[]"),
  consultationStatus:text("consultation_status").notNull(), commentsOpen:integer("comments_open").notNull().default(0), changeClass:text("change_class").notNull().default("Major"),
  updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const qualityRules = sqliteTable("quality_rules", {
  id:integer("id").primaryKey({autoIncrement:true}), ruleCode:text("rule_code").notNull().unique(), name:text("name").notNull(), dimension:text("dimension").notNull(),
  entityType:text("entity_type").notNull(), expression:text("expression").notNull(), severity:text("severity").notNull(), ownerInstitution:text("owner_institution").notNull(),
  enabled:integer("enabled",{mode:"boolean"}).notNull().default(true), version:text("version").notNull().default("1.0"), updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const qualityAssessments = sqliteTable("quality_assessments", {
  id:integer("id").primaryKey({autoIncrement:true}), assessmentCode:text("assessment_code").notNull().unique(), subjectRef:text("subject_ref").notNull(),
  assessmentType:text("assessment_type").notNull(), accuracy:integer("accuracy").notNull(), completeness:integer("completeness").notNull(), consistency:integer("consistency").notNull(),
  timeliness:integer("timeliness").notNull(), uniqueness:integer("uniqueness").notNull(), reliability:integer("reliability").notNull(), overallScore:integer("overall_score").notNull(),
  outcome:text("outcome").notNull(), assessedBy:text("assessed_by").notNull(), assessedAt:text("assessed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const operationalControls = sqliteTable("operational_controls", {
  id:integer("id").primaryKey({autoIncrement:true}), controlCode:text("control_code").notNull().unique(), controlType:text("control_type").notNull(), title:text("title").notNull(),
  subjectRef:text("subject_ref").notNull().default(""), institution:text("institution").notNull(), county:text("county").notNull().default("National"),
  owner:text("owner").notNull(), reviewer:text("reviewer").notNull().default(""), status:text("status").notNull(), priority:text("priority").notNull().default("Normal"),
  dueDate:text("due_date").notNull(), details:text("details").notNull().default("{}"), evidence:text("evidence").notNull().default("[]"),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const consentRecords = sqliteTable("consent_records", {
  id:integer("id").primaryKey({autoIncrement:true}), consentCode:text("consent_code").notNull().unique(), subjectRef:text("subject_ref").notNull(), version:text("version").notNull(),
  language:text("language").notNull(), purposes:text("purposes").notNull(), channel:text("channel").notNull(), grantedBy:text("granted_by").notNull(),
  status:text("status").notNull(), grantedAt:text("granted_at").notNull(), withdrawnAt:text("withdrawn_at").notNull().default(""), evidenceRef:text("evidence_ref").notNull().default(""),
});

export const monitoringIndicators = sqliteTable("monitoring_indicators", {
  id:integer("id").primaryKey({autoIncrement:true}), indicatorCode:text("indicator_code").notNull().unique(), name:text("name").notNull(), definition:text("definition").notNull(),
  numerator:text("numerator").notNull(), denominator:text("denominator").notNull(), frequency:text("frequency").notNull(), owner:text("owner").notNull(),
  disaggregations:text("disaggregations").notNull(), currentValue:real("current_value").notNull().default(0), unit:text("unit").notNull(), lastCalculatedAt:text("last_calculated_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  details: text("details").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const helpTickets = sqliteTable("help_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketCode: text("ticket_code").notNull().unique(),
  requesterEmail: text("requester_email").notNull(), requesterName: text("requester_name").notNull(),
  requesterRole: text("requester_role").notNull(), institution: text("institution").notNull().default(""), county: text("county").notNull().default("National"),
  subject: text("subject").notNull(), category: text("category").notNull(), channel: text("channel").notNull().default("In-platform"),
  description: text("description").notNull(), priority: text("priority").notNull().default("Normal"), sensitivity: text("sensitivity").notNull().default("Internal"),
  status: text("status").notNull().default("Open"), assignedTeam: text("assigned_team").notNull().default("Help Desk"), assignedTo: text("assigned_to").notNull().default("Unassigned"),
  slaHours: integer("sla_hours").notNull().default(24), dueAt: text("due_at").notNull(), resolution: text("resolution").notNull().default(""),
  satisfaction: integer("satisfaction").notNull().default(0), resolvedAt: text("resolved_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const helpTicketMessages = sqliteTable("help_ticket_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }), ticketCode: text("ticket_code").notNull(),
  authorEmail: text("author_email").notNull(), authorName: text("author_name").notNull(), authorRole: text("author_role").notNull(),
  message: text("message").notNull(), visibility: text("visibility").notNull().default("Requester-visible"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const knowledgeArticles = sqliteTable("knowledge_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }), articleCode: text("article_code").notNull().unique(),
  title: text("title").notNull(), category: text("category").notNull(), audience: text("audience").notNull().default("All users"),
  summary: text("summary").notNull(), content: text("content").notNull(), status: text("status").notNull().default("Published"),
  views: integer("views").notNull().default(0), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const extensionRequests = sqliteTable("extension_requests", {
  id:integer("id").primaryKey({autoIncrement:true}), requestCode:text("request_code").notNull().unique(),
  requesterEmail:text("requester_email").notNull(), requesterName:text("requester_name").notNull(), requesterRole:text("requester_role").notNull(),
  farmerDfrId:text("farmer_dfr_id").notNull().default(""), county:text("county").notNull(), district:text("district").notNull().default(""),
  serviceType:text("service_type").notNull(), preferredDate:text("preferred_date").notNull().default(""), problemDescription:text("problem_description").notNull(),
  urgency:text("urgency").notNull().default("Normal"), status:text("status").notNull().default("Submitted"),
  assignedOfficer:text("assigned_officer").notNull().default("Unassigned"), assignedInstitution:text("assigned_institution").notNull().default("MoA Extension Service"),
  resolutionSummary:text("resolution_summary").notNull().default(""), followUpDate:text("follow_up_date").notNull().default(""),
  satisfaction:integer("satisfaction").notNull().default(0), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const extensionVisits = sqliteTable("extension_visits", {
  id:integer("id").primaryKey({autoIncrement:true}), visitCode:text("visit_code").notNull().unique(), requestCode:text("request_code").notNull(),
  scheduledAt:text("scheduled_at").notNull(), visitType:text("visit_type").notNull().default("On-farm visit"), officerEmail:text("officer_email").notNull(), officerName:text("officer_name").notNull(),
  status:text("status").notNull().default("Scheduled"), location:text("location").notNull().default(""), purpose:text("purpose").notNull(),
  observations:text("observations").notNull().default(""), advice:text("advice").notNull().default(""), referral:text("referral").notNull().default(""),
  referralStatus:text("referral_status").notNull().default("Not required"), outcome:text("outcome").notNull().default(""), nextVisitAt:text("next_visit_at").notNull().default(""),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const farmParcels = sqliteTable("farm_parcels", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  parcelId: text("parcel_id").notNull().unique(),
  farmerDfrId: text("farmer_dfr_id").notNull().default(""),
  farmerName: text("farmer_name").notNull(),
  county: text("county").notNull(),
  district: text("district").notNull().default(""),
  commodity: text("commodity").notNull().default(""),
  vertices: text("vertices").notNull(),
  areaHectares: real("area_hectares").notNull(),
  areaAcres: real("area_acres").notNull(),
  perimeterMeters: real("perimeter_meters").notNull(),
  centroidLat: real("centroid_lat").notNull(),
  centroidLng: real("centroid_lng").notNull(),
  gpsAccuracy: real("gps_accuracy").notNull().default(0),
  geometryStatus: text("geometry_status").notNull().default("UNVERIFIED"),
  qualityFlags: text("quality_flags").notNull().default("[]"),
  revision: integer("revision").notNull().default(1),
  verifiedBy: text("verified_by").notNull().default(""),
  verifiedAt: text("verified_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const households = sqliteTable("households", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  householdId: text("household_id").notNull().unique(),
  farmerDfrId: text("farmer_dfr_id").notNull(),
  representative: text("representative").notNull(),
  county: text("county").notNull(),
  members: integer("members").notNull().default(1),
  femaleMembers: integer("female_members").notNull().default(0),
  youthMembers: integer("youth_members").notNull().default(0),
  disabledMembers: integer("disabled_members").notNull().default(0),
  dependants: integer("dependants").notNull().default(0),
  status: text("status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const identityChecks = sqliteTable("identity_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  farmerDfrId: text("farmer_dfr_id").notNull(),
  checkType: text("check_type").notNull(),
  riskScore: integer("risk_score").notNull().default(0),
  outcome: text("outcome").notNull(),
  matches: text("matches").notNull().default("[]"),
  reviewedBy: text("reviewed_by").notNull().default("Automated screening"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const programmeApplications = sqliteTable("programme_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: text("application_id").notNull().unique(),
  farmerDfrId: text("farmer_dfr_id").notNull(),
  programme: text("programme").notNull(),
  county: text("county").notNull(),
  requestedSupport: text("requested_support").notNull(),
  eligibilityScore: integer("eligibility_score").notNull().default(0),
  status: text("status").notNull().default("Submitted"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const agricultureProgrammes = sqliteTable("agriculture_programmes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programmeCode: text("programme_code").notNull().unique(), title: text("title").notNull(), description: text("description").notNull(),
  ownerInstitution: text("owner_institution").notNull(), assistanceType: text("assistance_type").notNull(),
  targetGroups: text("target_groups").notNull().default("All registered producers"), counties: text("counties").notNull().default("National"),
  eligibilityCriteria: text("eligibility_criteria").notNull(), openingDate: text("opening_date").notNull(), deadline: text("deadline").notNull(),
  status: text("status").notNull().default("Draft"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const programmeCases = sqliteTable("programme_cases", {
  id: integer("id").primaryKey({ autoIncrement: true }), applicationCode: text("application_code").notNull().unique(),
  programmeCode: text("programme_code").notNull(), programmeTitle: text("programme_title").notNull(), applicantEmail: text("applicant_email").notNull(),
  applicantName: text("applicant_name").notNull(), applicantRole: text("applicant_role").notNull(), applicantRef: text("applicant_ref").notNull(),
  county: text("county").notNull(), district: text("district").notNull(), requestedSupport: text("requested_support").notNull(),
  justification: text("justification").notNull(), status: text("status").notNull().default("Submitted"),
  eligibilityScore: integer("eligibility_score").notNull().default(0), reviewer: text("reviewer").notNull().default("Unassigned"),
  decisionReason: text("decision_reason").notNull().default(""), submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const programmeCaseEvents = sqliteTable("programme_case_events", {
  id: integer("id").primaryKey({ autoIncrement: true }), applicationCode: text("application_code").notNull(),
  actorEmail: text("actor_email").notNull(), actorName: text("actor_name").notNull(), actorRole: text("actor_role").notNull(),
  action: text("action").notNull(), comments: text("comments").notNull().default(""), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const paymentAccounts = sqliteTable("payment_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  farmerDfrId: text("farmer_dfr_id").notNull(),
  provider: text("provider").notNull(),
  accountName: text("account_name").notNull(),
  accountNumberMasked: text("account_number_masked").notNull(),
  verified: integer("verified", { mode:"boolean" }).notNull().default(false),
  status: text("status").notNull().default("Pending verification"),
  ownerEmail: text("owner_email").notNull().default(""),
  accountType: text("account_type").notNull().default("Mobile money"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const paymentTransactions = sqliteTable("payment_transactions", {
  id: integer("id").primaryKey({autoIncrement:true}), transactionCode:text("transaction_code").notNull().unique(),
  ownerEmail:text("owner_email").notNull(), farmerDfrId:text("farmer_dfr_id").notNull(), programme:text("programme").notNull(),
  amount:real("amount").notNull(), currency:text("currency").notNull().default("USD"), provider:text("provider").notNull(),
  status:text("status").notNull().default("Pending"), receiptRef:text("receipt_ref").notNull().default(""),
  failureReason:text("failure_reason").notNull().default(""), processedAt:text("processed_at").notNull().default(""),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const vouchers = sqliteTable("vouchers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voucherCode: text("voucher_code").notNull().unique(),
  farmerDfrId: text("farmer_dfr_id").notNull(),
  programme: text("programme").notNull(),
  category: text("category").notNull(),
  value: real("value").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("Issued"),
  expiresAt: text("expires_at").notNull(),
  ownerEmail: text("owner_email").notNull().default(""),
  distributionSite: text("distribution_site").notNull().default("To be scheduled"),
  appointmentAt: text("appointment_at").notNull().default(""),
  redeemedAt: text("redeemed_at").notNull().default(""),
  receiptAcknowledged: integer("receipt_acknowledged",{mode:"boolean"}).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const benefitIssues = sqliteTable("benefit_issues", {
  id:integer("id").primaryKey({autoIncrement:true}), issueCode:text("issue_code").notNull().unique(), ownerEmail:text("owner_email").notNull(),
  subjectType:text("subject_type").notNull(), subjectRef:text("subject_ref").notNull(), category:text("category").notNull(),
  description:text("description").notNull(), status:text("status").notNull().default("Open"),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const grievances = sqliteTable("grievances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: text("ticket_id").notNull().unique(),
  farmerDfrId: text("farmer_dfr_id").notNull().default("Anonymous"),
  category: text("category").notNull(),
  channel: text("channel").notNull(),
  county: text("county").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("Normal"),
  status: text("status").notNull().default("Open"),
  ownerEmail:text("owner_email").notNull().default(""), ownerName:text("owner_name").notNull().default(""),
  assignedTo:text("assigned_to").notNull().default("Unassigned"), resolution:text("resolution").notNull().default(""),
  resolvedAt:text("resolved_at").notNull().default(""), updatedAt:text("updated_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const grievanceEvents=sqliteTable("grievance_events",{
  id:integer("id").primaryKey({autoIncrement:true}),ticketId:text("ticket_id").notNull(),actorEmail:text("actor_email").notNull(),
  actorName:text("actor_name").notNull(),actorRole:text("actor_role").notNull(),action:text("action").notNull(),
  comments:text("comments").notNull().default(""),visibility:text("visibility").notNull().default("Complainant-visible"),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const deliveryItems = sqliteTable("delivery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  component: integer("component").notNull(),
  workstream: text("workstream").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  owner: text("owner").notNull(),
  county: text("county").notNull().default("National"),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("Planned"),
  acceptanceStatus: text("acceptance_status").notNull().default("Not submitted"),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const deliveryEvidence = sqliteTable("delivery_evidence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  fileName: text("file_name").notNull(),
  objectKey: text("object_key").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const parties = sqliteTable("parties", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  partyId: text("party_id").notNull().unique(),
  partyType: text("party_type").notNull(),
  legalName: text("legal_name").notNull(),
  acronym: text("acronym").notNull().default(""),
  legalForm: text("legal_form").notNull().default(""),
  registrationNumber: text("registration_number").notNull().default(""),
  taxId: text("tax_id").notNull().default(""),
  establishedDate: text("established_date").notNull().default(""),
  representativeName: text("representative_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  county: text("county").notNull(),
  district: text("district").notNull(),
  community: text("community").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  womenMembers: integer("women_members").notNull().default(0),
  youthMembers: integer("youth_members").notNull().default(0),
  primaryCommodity: text("primary_commodity").notNull().default(""),
  verificationStatus: text("verification_status").notNull().default("Pending verification"),
  status: text("status").notNull().default("Active"),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partyRelationships = sqliteTable("party_relationships", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  fromPartyId: text("from_party_id").notNull(),
  toPartyId: text("to_party_id").notNull(),
  relationshipType: text("relationship_type").notNull(),
  roleTitle: text("role_title").notNull().default(""),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  status: text("status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partyResources = sqliteTable("party_resources", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  partyId: text("party_id").notNull(),
  resourceType: text("resource_type").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""),
  quantity: real("quantity").notNull().default(0),
  unit: text("unit").notNull().default(""),
  capacity: text("capacity").notNull().default(""),
  county: text("county").notNull().default(""),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("Operational"),
  details: text("details").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partyActivities = sqliteTable("party_activities", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  partyId: text("party_id").notNull(),
  activityType: text("activity_type").notNull(),
  programme: text("programme").notNull().default(""),
  commodity: text("commodity").notNull().default(""),
  volume: real("volume").notNull().default(0),
  unit: text("unit").notNull().default(""),
  value: real("value").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  counterparty: text("counterparty").notNull().default(""),
  activityDate: text("activity_date").notNull(),
  status: text("status").notNull().default("Recorded"),
  details: text("details").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partyDocuments = sqliteTable("party_documents", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  partyId: text("party_id").notNull(),
  documentType: text("document_type").notNull(),
  documentNumber: text("document_number").notNull().default(""),
  issuedBy: text("issued_by").notNull().default(""),
  issueDate: text("issue_date").notNull().default(""),
  expiryDate: text("expiry_date").notNull().default(""),
  verificationStatus: text("verification_status").notNull().default("Pending"),
  fileName: text("file_name").notNull().default(""),
  objectKey: text("object_key").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const governanceInstitutions = sqliteTable("governance_institutions", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  institutionCode: text("institution_code").notNull().unique(),
  name: text("name").notNull(), mandate: text("mandate").notNull(),
  accountRole: text("account_role").notNull(), scope: text("scope").notNull().default("National"),
  contentResponsibilities: text("content_responsibilities").notNull().default("[]"),
  active: integer("active",{mode:"boolean"}).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const governanceDatasets = sqliteTable("governance_datasets", {
  id: integer("id").primaryKey({autoIncrement:true}), datasetCode:text("dataset_code").notNull().unique(),
  title:text("title").notNull(), domain:text("domain").notNull(), ownerInstitution:text("owner_institution").notNull(),
  stewardInstitution:text("steward_institution").notNull(), custodianInstitution:text("custodian_institution").notNull(),
  approvingAuthority:text("approving_authority").notNull(), sensitivity:text("sensitivity").notNull(), accessRule:text("access_rule").notNull(),
  classificationStandard:text("classification_standard").notNull(), version:text("version").notNull().default("1.0"),
  reviewFrequencyDays:integer("review_frequency_days").notNull().default(90), lastReviewedAt:text("last_reviewed_at").notNull(),
  nextReviewAt:text("next_review_at").notNull(), status:text("status").notNull().default("Active"), metadata:text("metadata").notNull().default("{}"),
  updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const governanceWorkflows = sqliteTable("governance_workflows", {
  id:integer("id").primaryKey({autoIncrement:true}), caseId:text("case_id").notNull().unique(), workflowType:text("workflow_type").notNull(),
  subjectRef:text("subject_ref").notNull(), title:text("title").notNull(), submitterInstitution:text("submitter_institution").notNull(),
  currentInstitution:text("current_institution").notNull(), stage:text("stage").notNull().default("SUBMITTED"), decision:text("decision").notNull().default("Pending"),
  notes:text("notes").notNull().default(""), dueDate:text("due_date").notNull(), county:text("county").notNull().default("National"),
  evidenceRef:text("evidence_ref").notNull().default(""), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const dataDictionaryItems = sqliteTable("data_dictionary_items", {
  id:integer("id").primaryKey({autoIncrement:true}), elementCode:text("element_code").notNull().unique(), name:text("name").notNull(), definition:text("definition").notNull(),
  domain:text("domain").notNull(), dataType:text("data_type").notNull(), allowedValues:text("allowed_values").notNull().default("[]"),
  standardOwner:text("standard_owner").notNull(), version:text("version").notNull().default("1.0"), status:text("status").notNull().default("Approved"),
  effectiveDate:text("effective_date").notNull(), updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const dataSharingAgreements = sqliteTable("data_sharing_agreements", {
  id:integer("id").primaryKey({autoIncrement:true}), agreementCode:text("agreement_code").notNull().unique(), title:text("title").notNull(),
  providerInstitution:text("provider_institution").notNull(), recipientInstitution:text("recipient_institution").notNull(), datasets:text("datasets").notNull().default("[]"),
  purpose:text("purpose").notNull(), legalBasis:text("legal_basis").notNull(), sensitivity:text("sensitivity").notNull(), accessProtocol:text("access_protocol").notNull(),
  effectiveDate:text("effective_date").notNull(), expiryDate:text("expiry_date").notNull(), status:text("status").notNull(), reviewDate:text("review_date").notNull(),
});
export const governanceDecisions = sqliteTable("governance_decisions", {
  id:integer("id").primaryKey({autoIncrement:true}), decisionCode:text("decision_code").notNull().unique(), meetingType:text("meeting_type").notNull(), title:text("title").notNull(),
  decisionText:text("decision_text").notNull(), responsibleInstitution:text("responsible_institution").notNull(), actionOwner:text("action_owner").notNull(),
  meetingDate:text("meeting_date").notNull(), dueDate:text("due_date").notNull(), priority:text("priority").notNull(), status:text("status").notNull(),
  escalationLevel:text("escalation_level").notNull().default("None"), evidence:text("evidence").notNull().default(""), createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const integrationExchanges = sqliteTable("integration_exchanges", {
  id:integer("id").primaryKey({autoIncrement:true}), connectorCode:text("connector_code").notNull(), systemName:text("system_name").notNull(), ownerInstitution:text("owner_institution").notNull(),
  direction:text("direction").notNull(), endpointAlias:text("endpoint_alias").notNull(), standard:text("standard").notNull(), mappingVersion:text("mapping_version").notNull(),
  environment:text("environment").notNull(), status:text("status").notNull(), lastTestedAt:text("last_tested_at").notNull().default(""), lastExchangeAt:text("last_exchange_at").notNull().default(""),
  records:integer("records").notNull().default(0), result:text("result").notNull(), correlationId:text("correlation_id").notNull(), errorSummary:text("error_summary").notNull().default(""),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const governancePolicies = sqliteTable("governance_policies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  policyCode: text("policy_code").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  enforcingBody: text("enforcing_body").notNull(),
  legalBasis: text("legal_basis").notNull(),
  effectiveDate: text("effective_date").notNull(),
  reviewCycle: text("review_cycle").notNull().default("Annual"),
  status: text("status").notNull().default("Active / Enacted"),
  summary: text("summary").notNull(),
  directives: text("directives").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
