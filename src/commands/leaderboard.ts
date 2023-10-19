import { desc, eq } from "drizzle-orm";
import { balance,  } from "../schema";
import { CommandConfig, DiscordMessage } from "../types";
import getDb from "../utils/db";
import { channelMessage, channelMessageWithComponents } from "../utils/response";
import { InteractionResponseType } from "discord-interactions";

export const LeaderboardConfig: CommandConfig = {
	name: 'leaderboard',
	description: 'Shows the top 10 balances in the discord server',
	type: 1,
};

export async function leaderboard(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {

	const db = getDb(env);
	const guild_id = msg.guild_id;

	console.log('guild_id', guild_id);

	const balances = await db.select().from(balance)
		.where(eq(balance.guild_id, guild_id))
		.orderBy(desc(balance.balance))
		.limit(10).execute();

	console.log('balances', balances);

	let content = "";
	for (let i = 0; i < balances.length; i++) {
		const bal = balances[i];
		content += `${i + 1}. <@!${bal.user_id}> - ${bal.balance} :coin:\n`;
	}

	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [
					{
						title: `Top ${balances.length} Balances`,
						description: content,
					}
				],
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	)
}
