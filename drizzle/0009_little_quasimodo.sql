CREATE TABLE `extension_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_code` text NOT NULL,
	`requester_email` text NOT NULL,
	`requester_name` text NOT NULL,
	`requester_role` text NOT NULL,
	`farmer_dfr_id` text DEFAULT '' NOT NULL,
	`county` text NOT NULL,
	`district` text DEFAULT '' NOT NULL,
	`service_type` text NOT NULL,
	`preferred_date` text DEFAULT '' NOT NULL,
	`problem_description` text NOT NULL,
	`urgency` text DEFAULT 'Normal' NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`assigned_officer` text DEFAULT 'Unassigned' NOT NULL,
	`assigned_institution` text DEFAULT 'MoA Extension Service' NOT NULL,
	`resolution_summary` text DEFAULT '' NOT NULL,
	`follow_up_date` text DEFAULT '' NOT NULL,
	`satisfaction` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extension_requests_request_code_unique` ON `extension_requests` (`request_code`);--> statement-breakpoint
CREATE TABLE `extension_visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visit_code` text NOT NULL,
	`request_code` text NOT NULL,
	`scheduled_at` text NOT NULL,
	`visit_type` text DEFAULT 'On-farm visit' NOT NULL,
	`officer_email` text NOT NULL,
	`officer_name` text NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`purpose` text NOT NULL,
	`observations` text DEFAULT '' NOT NULL,
	`advice` text DEFAULT '' NOT NULL,
	`referral` text DEFAULT '' NOT NULL,
	`referral_status` text DEFAULT 'Not required' NOT NULL,
	`outcome` text DEFAULT '' NOT NULL,
	`next_visit_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extension_visits_visit_code_unique` ON `extension_visits` (`visit_code`);