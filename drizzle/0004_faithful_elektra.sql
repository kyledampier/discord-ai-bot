/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
DROP INDEX IF EXISTS `question_logs_user_idx`;--> statement-breakpoint
CREATE INDEX `question_logs_user_idx` ON `question_logs` (`guild_id`,`user_id`,`challenge_id`);--> statement-breakpoint
DROP TABLE IF EXISTS `question_logs`;--> statement-breakpoint
CREATE TABLE `question_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`challenge_id` integer,
	`question_number` integer,
	`guild_id` text,
	`user_id` text,
	`question_id` integer,
	`answer_id` integer,
	`correct` integer DEFAULT false,
	`interaction_id` text,
	`interaction_token` text,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`guild_id`) REFERENCES `discord_guilds`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`user_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE CASCADE
);
