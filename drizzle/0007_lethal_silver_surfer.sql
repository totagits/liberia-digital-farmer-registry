CREATE TABLE `access_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`institution` text NOT NULL,
	`programme_scope` text DEFAULT 'All authorized programmes' NOT NULL,
	`county_scope` text DEFAULT 'National' NOT NULL,
	`district_scope` text DEFAULT 'All' NOT NULL,
	`sensitivity_ceiling` text DEFAULT 'Highly restricted' NOT NULL,
	`capabilities` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`reviewed_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_assignments_email_unique` ON `access_assignments` (`email`);--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`consent_code` text NOT NULL,
	`subject_ref` text NOT NULL,
	`version` text NOT NULL,
	`language` text NOT NULL,
	`purposes` text NOT NULL,
	`channel` text NOT NULL,
	`granted_by` text NOT NULL,
	`status` text NOT NULL,
	`granted_at` text NOT NULL,
	`withdrawn_at` text DEFAULT '' NOT NULL,
	`evidence_ref` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consent_records_consent_code_unique` ON `consent_records` (`consent_code`);--> statement-breakpoint
CREATE TABLE `monitoring_indicators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`indicator_code` text NOT NULL,
	`name` text NOT NULL,
	`definition` text NOT NULL,
	`numerator` text NOT NULL,
	`denominator` text NOT NULL,
	`frequency` text NOT NULL,
	`owner` text NOT NULL,
	`disaggregations` text NOT NULL,
	`current_value` real DEFAULT 0 NOT NULL,
	`unit` text NOT NULL,
	`last_calculated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monitoring_indicators_indicator_code_unique` ON `monitoring_indicators` (`indicator_code`);--> statement-breakpoint
CREATE TABLE `operational_controls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`control_code` text NOT NULL,
	`control_type` text NOT NULL,
	`title` text NOT NULL,
	`subject_ref` text DEFAULT '' NOT NULL,
	`institution` text NOT NULL,
	`county` text DEFAULT 'National' NOT NULL,
	`owner` text NOT NULL,
	`reviewer` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`priority` text DEFAULT 'Normal' NOT NULL,
	`due_date` text NOT NULL,
	`details` text DEFAULT '{}' NOT NULL,
	`evidence` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operational_controls_control_code_unique` ON `operational_controls` (`control_code`);--> statement-breakpoint
CREATE TABLE `quality_assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_code` text NOT NULL,
	`subject_ref` text NOT NULL,
	`assessment_type` text NOT NULL,
	`accuracy` integer NOT NULL,
	`completeness` integer NOT NULL,
	`consistency` integer NOT NULL,
	`timeliness` integer NOT NULL,
	`uniqueness` integer NOT NULL,
	`reliability` integer NOT NULL,
	`overall_score` integer NOT NULL,
	`outcome` text NOT NULL,
	`assessed_by` text NOT NULL,
	`assessed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quality_assessments_assessment_code_unique` ON `quality_assessments` (`assessment_code`);--> statement-breakpoint
CREATE TABLE `quality_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rule_code` text NOT NULL,
	`name` text NOT NULL,
	`dimension` text NOT NULL,
	`entity_type` text NOT NULL,
	`expression` text NOT NULL,
	`severity` text NOT NULL,
	`owner_institution` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quality_rules_rule_code_unique` ON `quality_rules` (`rule_code`);--> statement-breakpoint
CREATE TABLE `sop_controls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sop_code` text NOT NULL,
	`title` text NOT NULL,
	`version` text NOT NULL,
	`owner_institution` text NOT NULL,
	`stage` text NOT NULL,
	`effective_date` text DEFAULT '' NOT NULL,
	`next_review_date` text NOT NULL,
	`required_approvals` text DEFAULT '[]' NOT NULL,
	`approvals` text DEFAULT '[]' NOT NULL,
	`consultation_status` text NOT NULL,
	`comments_open` integer DEFAULT 0 NOT NULL,
	`change_class` text DEFAULT 'Major' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sop_controls_sop_code_unique` ON `sop_controls` (`sop_code`);--> statement-breakpoint
ALTER TABLE `farmers` ADD `provisional_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `approved_dfr_id` text DEFAULT '' NOT NULL;