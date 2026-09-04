CREATE TABLE `grievance_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`actor_name` text NOT NULL,
	`actor_role` text NOT NULL,
	`action` text NOT NULL,
	`comments` text DEFAULT '' NOT NULL,
	`visibility` text DEFAULT 'Complainant-visible' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `grievances` ADD `owner_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `grievances` ADD `owner_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `grievances` ADD `assigned_to` text DEFAULT 'Unassigned' NOT NULL;--> statement-breakpoint
ALTER TABLE `grievances` ADD `resolution` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `grievances` ADD `resolved_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `grievances` ADD `updated_at` text DEFAULT '' NOT NULL;
