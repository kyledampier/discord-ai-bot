CREATE TABLE `answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer,
	`answer` text NOT NULL,
	`correct` integer DEFAULT false,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `answer_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`challenge_id` integer,
	`question_id` integer,
	`question_number` integer,
	`guild_id` text,
	`user_id` text,
	`answer_id` integer,
	`correct` integer DEFAULT false,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guild_id`) REFERENCES `discord_guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `balances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guild_id` text,
	`user_id` text,
	`amount` integer DEFAULT 0 NOT NULL,
	`last_monthly` integer,
	`last_weekly` integer,
	`last_daily` integer,
	`last_hourly` integer,
	FOREIGN KEY (`guild_id`) REFERENCES `discord_guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guild_id` text,
	`initiator_id` text,
	`challenger_id` text,
	`wager` integer NOT NULL,
	`num_questions` integer NOT NULL,
	`current_question` integer DEFAULT 0,
	`category` integer,
	`status` text,
	`timestamp` integer,
	FOREIGN KEY (`guild_id`) REFERENCES `discord_guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`initiator_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`challenger_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category`) REFERENCES `question_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `discord_guilds` (
	`id` text PRIMARY KEY NOT NULL,
	`locale` text,
	`app_permissions` text
);
--> statement-breakpoint
CREATE TABLE `discord_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text,
	`user_id` text,
	`application_id` text,
	`type` text,
	`version` text,
	`channel_id` text,
	`channel_name` text,
	`nsfw` integer DEFAULT false,
	`data` blob,
	`timestamp` integer
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` integer,
	`type` text,
	`difficulty` text,
	`question` text NOT NULL,
	FOREIGN KEY (`category`) REFERENCES `question_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `question_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `question_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`challenge_id` integer,
	`question_number` integer,
	`guild_id` text,
	`user_id` text,
	`question_id` integer,
	`answer_id` integer,
	`correct` integer DEFAULT false,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guild_id`) REFERENCES `discord_guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `discord_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`discriminator` text NOT NULL,
	`avatar` text,
	`global_name` text
);
--> statement-breakpoint
CREATE INDEX `answers_question_idx` ON `answers` (`question_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `balances_user_idx` ON `balances` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `challenges_status_idx` ON `challenges` (`status`);--> statement-breakpoint
CREATE INDEX `challenges_timestamp_idx` ON `challenges` (`timestamp`);--> statement-breakpoint
CREATE INDEX `challenges_initiator_idx` ON `challenges` (`guild_id`,`initiator_id`);--> statement-breakpoint
CREATE INDEX `challenges_challenger_idx` ON `challenges` (`guild_id`,`challenger_id`);--> statement-breakpoint
CREATE INDEX `challenges_user_idx` ON `challenges` (`guild_id`,`initiator_id`,`challenger_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `interactions_idx` ON `discord_interactions` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `interactions_user_idx` ON `discord_interactions` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `questions_category_idx` ON `questions` (`category`);--> statement-breakpoint
CREATE INDEX `questions_type_idx` ON `questions` (`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `questions_question_idx` ON `questions` (`question`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_names_idx` ON `question_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `question_logs_user_idx` ON `question_logs` (`guild_id`,`user_id`);