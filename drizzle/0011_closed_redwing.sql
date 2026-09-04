CREATE TABLE `benefit_issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_code` text NOT NULL,
	`owner_email` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_ref` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `benefit_issues_issue_code_unique` ON `benefit_issues` (`issue_code`);--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_code` text NOT NULL,
	`owner_email` text NOT NULL,
	`farmer_dfr_id` text NOT NULL,
	`programme` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`provider` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`receipt_ref` text DEFAULT '' NOT NULL,
	`failure_reason` text DEFAULT '' NOT NULL,
	`processed_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_transactions_transaction_code_unique` ON `payment_transactions` (`transaction_code`);--> statement-breakpoint
ALTER TABLE `payment_accounts` ADD `owner_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `payment_accounts` ADD `account_type` text DEFAULT 'Mobile money' NOT NULL;--> statement-breakpoint
ALTER TABLE `vouchers` ADD `owner_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vouchers` ADD `distribution_site` text DEFAULT 'To be scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE `vouchers` ADD `appointment_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vouchers` ADD `redeemed_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vouchers` ADD `receipt_acknowledged` integer DEFAULT false NOT NULL;