import { InteractionResponseType } from "discord-interactions";
import { CommandConfig, DiscordMessage } from "../types";
import { UserState } from "../types/UserState";

export const RedeemConfig: CommandConfig = {
	name: 'redeem',
	description: 'Redeem your points!',
	type: 1,
};

const redeemPointConfig = {
	hourly: 250,
	daily: 1000,
	weekly: 5000,
	monthly: 15000,
};

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

export function serializeRedeemState(state: string) {
	const obj = JSON.parse(state);

	if (!obj.balance || !obj.redeem) {
		return undefined;
	}

	return {
		balance: obj.balance,
		redeem: {
			hourly: new Date(obj.redeem.hourly),
			daily: new Date(obj.redeem.daily),
			weekly: new Date(obj.redeem.weekly),
			monthly: new Date(obj.redeem.monthly),
		}
	};
}

export async function redeem(msg: DiscordMessage, env: Env) {
	let userState: UserState | undefined = undefined;

	try {
		userState = await env.USERS.get(`${msg.guild_id}:${msg.member?.user.id}`).then((val) => serializeRedeemState(val ?? "{}")) as UserState | undefined;
	} catch (e) {
		console.error(e);
	}


	// if user doesn't exist, create user with default balance and redeem
	if (!userState || !userState.balance || !userState.redeem) {
		userState = {
			balance: redeemPointConfig.hourly + redeemPointConfig.daily + redeemPointConfig.weekly + redeemPointConfig.monthly,
			redeem: {
				hourly: new Date(),
				daily: new Date(),
				weekly: new Date(),
				monthly: new Date(),
			}
		};

		await env.USERS.put(`${msg.guild_id}:${msg.member?.user.id}`, JSON.stringify(userState));

		return new Response(
			JSON.stringify({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `<@!${msg.member?.user.id}> has redeemed :coin: for the first time!\n\n**You now have ${userState.balance} :coin:!**`,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}

	let pointsStatus = "";

	const now = new Date();

	if (now.getTime() - userState.redeem.hourly.getTime() >= HOUR) {
		userState.balance += redeemPointConfig.hourly;
		userState.redeem.hourly = now;
		pointsStatus += `${redeemPointConfig.hourly.toLocaleString()} :coin: redeemed for hourly.\n`;
	} else {
		const timeLeft = new Date((userState.redeem.hourly.getTime() + HOUR) - now.getTime());
		pointsStatus += `You have ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for hourly.\n`;
	}

	if (now.getTime() - userState.redeem.daily.getTime() >= DAY) {
		userState.balance += redeemPointConfig.daily;
		userState.redeem.daily = now;
		pointsStatus += `${redeemPointConfig.daily.toLocaleString()} :coin: redeemed for daily.\n`;
	} else {
		const timeLeft = new Date((userState.redeem.daily.getTime() + DAY) - now.getTime());
		pointsStatus += `You have ${timeLeft.getHours()} hours ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for daily.\n`;
	}

	if (now.getTime() - userState.redeem.weekly.getTime() >= WEEK) {
		userState.balance += redeemPointConfig.weekly;
		userState.redeem.weekly = now;
		pointsStatus += `${redeemPointConfig.weekly.toLocaleString()} :coin: redeemed for weekly.\n`;
	} else {
		const timeLeft = new Date((userState.redeem.weekly.getTime() + WEEK) - now.getTime());
		pointsStatus += `You have ${timeLeft.getDate() - 1} days ${timeLeft.getHours()} hours ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for weekly.\n`;
	}

	if (now.getTime() - userState.redeem.monthly.getTime() >= MONTH) {
		userState.balance += redeemPointConfig.monthly;
		userState.redeem.monthly = now;
		pointsStatus += `${redeemPointConfig.monthly.toLocaleString()} :coin: redeemed for monthly.\n`;
	} else {
		const timeLeft = new Date((userState.redeem.monthly.getTime() + MONTH) - now.getTime());
		pointsStatus += `You have ${timeLeft.getDate() - 1} days ${timeLeft.getHours()} hours ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for monthly.\n`;
	}

	await env.USERS.put(`${msg.guild_id}:${msg.member?.user.id}`, JSON.stringify(userState));

	console.log(`${msg.guild_id}:${msg.member?.user.id}`, userState);

	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `<@!${msg.member?.user.id}> has redeemed their :coin:!\n\n${pointsStatus}\n**You now have ${userState.balance.toLocaleString()} :coin:!**`,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}
