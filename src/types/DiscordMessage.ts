import { InteractionType } from "discord-interactions";
import { CommandConfig } from "./Command";

export type DiscordMessage = {
	id: string;
	type: InteractionType;
	token: string;
	member?: {
		user: {
			id: string;
			username: string;
			discriminator: string;
			global_name?: string;
			avatar?: string;
		};
		roles: string[];
		permissions: string;
		joined_at: string;
	};
	guild_id: string;
	guild_locale: string;
	app_permissions: string;
	guild: {
		id: string;
		locale: string;
	}
	data: CommandConfig;
}
