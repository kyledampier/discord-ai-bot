import { DiscordMessage } from "../types";
import { InteractionResponseType } from "discord-interactions";
import { getBalanceState } from "../utils/states";

export const BalanceConfig = {
	name: 'balance',
	description: 'Check your balance!',
	type: 1,
};

export async function balance(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	let userState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);

	if (!userState.user || !userState.guild || !userState.balance) {
		return new Response(
			JSON.stringify({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `You have 0 :coin:. Please use \`/redeem\` to redeem your first :coin:!`,
				}
			}), {
				status: 200,
				headers:{
					'Content-Type': 'application/json',
				},
			}
		);
	}

	return new Response(JSON.stringify({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `You have ${userState.balance.balance.toLocaleString(userState.guild.locale ?? "en-US")} :coin:!`,
		}
	}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		}
	});
}
