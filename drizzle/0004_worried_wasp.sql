ALTER TABLE `farmers` ADD `road_access` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `road_condition` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `road_seasonality` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `road_distance_miles` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_access` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_facility_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_facility_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_facility_status` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_distance_miles` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_travel_minutes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `farmers` ADD `processing_transport_mode` text DEFAULT '' NOT NULL;