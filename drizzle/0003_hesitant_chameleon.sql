CREATE TABLE `parties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`party_id` text NOT NULL,
	`party_type` text NOT NULL,
	`legal_name` text NOT NULL,
	`acronym` text DEFAULT '' NOT NULL,
	`legal_form` text DEFAULT '' NOT NULL,
	`registration_number` text DEFAULT '' NOT NULL,
	`tax_id` text DEFAULT '' NOT NULL,
	`established_date` text DEFAULT '' NOT NULL,
	`representative_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`county` text NOT NULL,
	`district` text NOT NULL,
	`community` text NOT NULL,
	`member_count` integer DEFAULT 0 NOT NULL,
	`women_members` integer DEFAULT 0 NOT NULL,
	`youth_members` integer DEFAULT 0 NOT NULL,
	`primary_commodity` text DEFAULT '' NOT NULL,
	`verification_status` text DEFAULT 'Pending verification' NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parties_party_id_unique` ON `parties` (`party_id`);--> statement-breakpoint
CREATE TABLE `party_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`party_id` text NOT NULL,
	`activity_type` text NOT NULL,
	`programme` text DEFAULT '' NOT NULL,
	`commodity` text DEFAULT '' NOT NULL,
	`volume` real DEFAULT 0 NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`counterparty` text DEFAULT '' NOT NULL,
	`activity_date` text NOT NULL,
	`status` text DEFAULT 'Recorded' NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `party_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`party_id` text NOT NULL,
	`document_type` text NOT NULL,
	`document_number` text DEFAULT '' NOT NULL,
	`issued_by` text DEFAULT '' NOT NULL,
	`issue_date` text DEFAULT '' NOT NULL,
	`expiry_date` text DEFAULT '' NOT NULL,
	`verification_status` text DEFAULT 'Pending' NOT NULL,
	`file_name` text DEFAULT '' NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `party_relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_party_id` text NOT NULL,
	`to_party_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	`role_title` text DEFAULT '' NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`end_date` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `party_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`party_id` text NOT NULL,
	`resource_type` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`quantity` real DEFAULT 0 NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`capacity` text DEFAULT '' NOT NULL,
	`county` text DEFAULT '' NOT NULL,
	`latitude` real,
	`longitude` real,
	`status` text DEFAULT 'Operational' NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
