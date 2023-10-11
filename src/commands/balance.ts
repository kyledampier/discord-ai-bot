import { serializeRedeemState } from "./redeem";
import { DiscordMessage } from "../types";
import { UserState } from "../types/UserState";

export const BalanceConfig = {
	name: 'balance',
	description: 'Check your balance!',
	type: 1,
};

export async function balance(msg: DiscordMessage, env: Env) {
	let userState: UserState | undefined = undefined;

	try {
		userState = await env.USERS.get(`${msg.guild_id}:${msg.member?.user.id}`).then((val) => serializeRedeemState(val ?? "{}")) as UserState | undefined;
	} catch (e) {
		console.error(e);
	}

	if (!userState || !userState.balance || !userState.redeem) {
		userState = {
			balance: 0,
			redeem: {
				hourly: new Date(0),
				daily: new Date(0),
				weekly: new Date(0),
				monthly: new Date(0),
			}
		};
	}

	return new Response(JSON.stringify({
		content: `You have ${userState.balance.toLocaleString()} :coin:!`,
	}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		}
	});
}
