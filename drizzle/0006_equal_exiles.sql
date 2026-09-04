CREATE TABLE `data_dictionary_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`element_code` text NOT NULL,
	`name` text NOT NULL,
	`definition` text NOT NULL,
	`domain` text NOT NULL,
	`data_type` text NOT NULL,
	`allowed_values` text DEFAULT '[]' NOT NULL,
	`standard_owner` text NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`status` text DEFAULT 'Approved' NOT NULL,
	`effective_date` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `data_dictionary_items_element_code_unique` ON `data_dictionary_items` (`element_code`);--> statement-breakpoint
CREATE TABLE `data_sharing_agreements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agreement_code` text NOT NULL,
	`title` text NOT NULL,
	`provider_institution` text NOT NULL,
	`recipient_institution` text NOT NULL,
	`datasets` text DEFAULT '[]' NOT NULL,
	`purpose` text NOT NULL,
	`legal_basis` text NOT NULL,
	`sensitivity` text NOT NULL,
	`access_protocol` text NOT NULL,
	`effective_date` text NOT NULL,
	`expiry_date` text NOT NULL,
	`status` text NOT NULL,
	`review_date` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `data_sharing_agreements_agreement_code_unique` ON `data_sharing_agreements` (`agreement_code`);--> statement-breakpoint
CREATE TABLE `governance_datasets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dataset_code` text NOT NULL,
	`title` text NOT NULL,
	`domain` text NOT NULL,
	`owner_institution` text NOT NULL,
	`steward_institution` text NOT NULL,
	`custodian_institution` text NOT NULL,
	`approving_authority` text NOT NULL,
	`sensitivity` text NOT NULL,
	`access_rule` text NOT NULL,
	`classification_standard` text NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`review_frequency_days` integer DEFAULT 90 NOT NULL,
	`last_reviewed_at` text NOT NULL,
	`next_review_at` text NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `governance_datasets_dataset_code_unique` ON `governance_datasets` (`dataset_code`);--> statement-breakpoint
CREATE TABLE `governance_decisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`decision_code` text NOT NULL,
	`meeting_type` text NOT NULL,
	`title` text NOT NULL,
	`decision_text` text NOT NULL,
	`responsible_institution` text NOT NULL,
	`action_owner` text NOT NULL,
	`meeting_date` text NOT NULL,
	`due_date` text NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`escalation_level` text DEFAULT 'None' NOT NULL,
	`evidence` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `governance_decisions_decision_code_unique` ON `governance_decisions` (`decision_code`);--> statement-breakpoint
CREATE TABLE `governance_institutions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`institution_code` text NOT NULL,
	`name` text NOT NULL,
	`mandate` text NOT NULL,
	`account_role` text NOT NULL,
	`scope` text DEFAULT 'National' NOT NULL,
	`content_responsibilities` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `governance_institutions_institution_code_unique` ON `governance_institutions` (`institution_code`);--> statement-breakpoint
CREATE TABLE `governance_workflows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`case_id` text NOT NULL,
	`workflow_type` text NOT NULL,
	`subject_ref` text NOT NULL,
	`title` text NOT NULL,
	`submitter_institution` text NOT NULL,
	`current_institution` text NOT NULL,
	`stage` text DEFAULT 'SUBMITTED' NOT NULL,
	`decision` text DEFAULT 'Pending' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`due_date` text NOT NULL,
	`county` text DEFAULT 'National' NOT NULL,
	`evidence_ref` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `governance_workflows_case_id_unique` ON `governance_workflows` (`case_id`);--> statement-breakpoint
CREATE TABLE `integration_exchanges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`connector_code` text NOT NULL,
	`system_name` text NOT NULL,
	`owner_institution` text NOT NULL,
	`direction` text NOT NULL,
	`endpoint_alias` text NOT NULL,
	`standard` text NOT NULL,
	`mapping_version` text NOT NULL,
	`environment` text NOT NULL,
	`status` text NOT NULL,
	`last_tested_at` text DEFAULT '' NOT NULL,
	`last_exchange_at` text DEFAULT '' NOT NULL,
	`records` integer DEFAULT 0 NOT NULL,
	`result` text NOT NULL,
	`correlation_id` text NOT NULL,
	`error_summary` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
