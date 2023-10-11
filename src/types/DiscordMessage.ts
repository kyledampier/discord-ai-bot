import { InteractionType } from "discord-interactions";
import { CommandConfig } from "./command";

export type DiscordMessage = {
	id: string;
	type: InteractionType;
	token: string;
	member?: {
		user: {
			id: string;
			username: string;
			discriminator: string;
		};
		roles: string[];
		permissions: string;
		joined_at: string;
	};
	guild_id: string;
	data: CommandConfig;
}
