CREATE TABLE `user_state` (
	`user_id` text NOT NULL,
	`state_key` text NOT NULL,
	`value_json` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `state_key`)
);
