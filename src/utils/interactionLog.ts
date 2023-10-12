import getDb from "./db";
import { interaction } from "../schema";
import { DiscordMessage } from "../types";

export function logInteraction(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	const db = getDb(env);

	const data = {
		id: msg.id,
		guild_id: msg.guild_id,
		user_id: msg.member?.user.id,
		application_id: msg.application_id,
		type: msg.type === 1 ? 'message_component' : 'command',
		channel_id: msg.channel_id,
		channel_name: msg.channel.name,
		nsfw: msg.channel.nsfw,
		data: JSON.stringify(msg.data),
	};

	ctx.waitUntil(db.insert(interaction).values(data));
}
