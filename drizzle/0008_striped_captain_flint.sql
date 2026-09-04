CREATE TABLE `help_ticket_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_code` text NOT NULL,
	`author_email` text NOT NULL,
	`author_name` text NOT NULL,
	`author_role` text NOT NULL,
	`message` text NOT NULL,
	`visibility` text DEFAULT 'Requester-visible' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `help_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_code` text NOT NULL,
	`requester_email` text NOT NULL,
	`requester_name` text NOT NULL,
	`requester_role` text NOT NULL,
	`institution` text DEFAULT '' NOT NULL,
	`county` text DEFAULT 'National' NOT NULL,
	`subject` text NOT NULL,
	`category` text NOT NULL,
	`channel` text DEFAULT 'In-platform' NOT NULL,
	`description` text NOT NULL,
	`priority` text DEFAULT 'Normal' NOT NULL,
	`sensitivity` text DEFAULT 'Internal' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`assigned_team` text DEFAULT 'Help Desk' NOT NULL,
	`assigned_to` text DEFAULT 'Unassigned' NOT NULL,
	`sla_hours` integer DEFAULT 24 NOT NULL,
	`due_at` text NOT NULL,
	`resolution` text DEFAULT '' NOT NULL,
	`satisfaction` integer DEFAULT 0 NOT NULL,
	`resolved_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `help_tickets_ticket_code_unique` ON `help_tickets` (`ticket_code`);--> statement-breakpoint
CREATE TABLE `knowledge_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_code` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`audience` text DEFAULT 'All users' NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'Published' NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `knowledge_articles_article_code_unique` ON `knowledge_articles` (`article_code`);