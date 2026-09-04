CREATE TABLE `grievances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` text NOT NULL,
	`farmer_dfr_id` text DEFAULT 'Anonymous' NOT NULL,
	`category` text NOT NULL,
	`channel` text NOT NULL,
	`county` text NOT NULL,
	`description` text NOT NULL,
	`priority` text DEFAULT 'Normal' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grievances_ticket_id_unique` ON `grievances` (`ticket_id`);--> statement-breakpoint
CREATE TABLE `households` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`household_id` text NOT NULL,
	`farmer_dfr_id` text NOT NULL,
	`representative` text NOT NULL,
	`county` text NOT NULL,
	`members` integer DEFAULT 1 NOT NULL,
	`female_members` integer DEFAULT 0 NOT NULL,
	`youth_members` integer DEFAULT 0 NOT NULL,
	`disabled_members` integer DEFAULT 0 NOT NULL,
	`dependants` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `households_household_id_unique` ON `households` (`household_id`);--> statement-breakpoint
CREATE TABLE `identity_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`farmer_dfr_id` text NOT NULL,
	`check_type` text NOT NULL,
	`risk_score` integer DEFAULT 0 NOT NULL,
	`outcome` text NOT NULL,
	`matches` text DEFAULT '[]' NOT NULL,
	`reviewed_by` text DEFAULT 'Automated screening' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`farmer_dfr_id` text NOT NULL,
	`provider` text NOT NULL,
	`account_name` text NOT NULL,
	`account_number_masked` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'Pending verification' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programme_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` text NOT NULL,
	`farmer_dfr_id` text NOT NULL,
	`programme` text NOT NULL,
	`county` text NOT NULL,
	`requested_support` text NOT NULL,
	`eligibility_score` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `programme_applications_application_id_unique` ON `programme_applications` (`application_id`);--> statement-breakpoint
CREATE TABLE `vouchers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`voucher_code` text NOT NULL,
	`farmer_dfr_id` text NOT NULL,
	`programme` text NOT NULL,
	`category` text NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'Issued' NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vouchers_voucher_code_unique` ON `vouchers` (`voucher_code`);