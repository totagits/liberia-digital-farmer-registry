CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`details` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `farmers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dfr_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`gender` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`county` text NOT NULL,
	`district` text NOT NULL,
	`community` text NOT NULL,
	`crop` text NOT NULL,
	`farm_size` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Pending verification' NOT NULL,
	`vulnerability` text DEFAULT 'Standard' NOT NULL,
	`latitude` real,
	`longitude` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `farmers_dfr_id_unique` ON `farmers` (`dfr_id`);