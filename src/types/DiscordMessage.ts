import { InteractionType } from "discord-interactions";
import { CommandConfig } from "./Command";

export type DiscordMessage = {
	id: string;
	type: InteractionType;
	token: string;
	member?: {
		user: {
			id: number;
			username: string;
			discriminator: string;
			global_name?: string;
		};
		roles: string[];
		permissions: string;
		joined_at: string;
	};
	guild_id: number;
	guild: {
		id: number;
		locale: string;
	}
	data: CommandConfig;
}
