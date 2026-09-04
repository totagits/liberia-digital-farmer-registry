CREATE TABLE `farm_parcels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parcel_id` text NOT NULL,
	`farmer_dfr_id` text DEFAULT '' NOT NULL,
	`farmer_name` text NOT NULL,
	`county` text NOT NULL,
	`district` text DEFAULT '' NOT NULL,
	`commodity` text DEFAULT '' NOT NULL,
	`vertices` text NOT NULL,
	`area_hectares` real NOT NULL,
	`area_acres` real NOT NULL,
	`perimeter_meters` real NOT NULL,
	`centroid_lat` real NOT NULL,
	`centroid_lng` real NOT NULL,
	`gps_accuracy` real DEFAULT 0 NOT NULL,
	`geometry_status` text DEFAULT 'UNVERIFIED' NOT NULL,
	`quality_flags` text DEFAULT '[]' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`verified_by` text DEFAULT '' NOT NULL,
	`verified_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `farm_parcels_parcel_id_unique` ON `farm_parcels` (`parcel_id`);