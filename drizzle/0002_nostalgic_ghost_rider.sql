CREATE TABLE `delivery_evidence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`object_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `delivery_evidence_object_key_unique` ON `delivery_evidence` (`object_key`);--> statement-breakpoint
CREATE TABLE `delivery_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`component` integer NOT NULL,
	`workstream` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`owner` text NOT NULL,
	`county` text DEFAULT 'National' NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'Planned' NOT NULL,
	`acceptance_status` text DEFAULT 'Not submitted' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `delivery_items_reference_unique` ON `delivery_items` (`reference`);