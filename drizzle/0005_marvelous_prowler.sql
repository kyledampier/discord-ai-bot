CREATE TABLE `image_generation_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guild_id` text,
	`user_id` text,
	`prompt` text,
	`size` text,
	`interaction_id` text,
	`interaction_token` text,
	`image_url` text,
	FOREIGN KEY (`guild_id`) REFERENCES `discord_guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `discord_users`(`id`) ON UPDATE no action ON DELETE no action
);
