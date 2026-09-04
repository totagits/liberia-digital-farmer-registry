CREATE TABLE `agriculture_programmes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`programme_code` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`owner_institution` text NOT NULL,
	`assistance_type` text NOT NULL,
	`target_groups` text DEFAULT 'All registered producers' NOT NULL,
	`counties` text DEFAULT 'National' NOT NULL,
	`eligibility_criteria` text NOT NULL,
	`opening_date` text NOT NULL,
	`deadline` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agriculture_programmes_programme_code_unique` ON `agriculture_programmes` (`programme_code`);--> statement-breakpoint
CREATE TABLE `programme_case_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_code` text NOT NULL,
	`actor_email` text NOT NULL,
	`actor_name` text NOT NULL,
	`actor_role` text NOT NULL,
	`action` text NOT NULL,
	`comments` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programme_cases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_code` text NOT NULL,
	`programme_code` text NOT NULL,
	`programme_title` text NOT NULL,
	`applicant_email` text NOT NULL,
	`applicant_name` text NOT NULL,
	`applicant_role` text NOT NULL,
	`applicant_ref` text NOT NULL,
	`county` text NOT NULL,
	`district` text NOT NULL,
	`requested_support` text NOT NULL,
	`justification` text NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`eligibility_score` integer DEFAULT 0 NOT NULL,
	`reviewer` text DEFAULT 'Unassigned' NOT NULL,
	`decision_reason` text DEFAULT '' NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `programme_cases_application_code_unique` ON `programme_cases` (`application_code`);