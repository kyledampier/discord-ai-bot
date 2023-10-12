import { InteractionResponseType } from "discord-interactions";
import { CommandConfig, DiscordMessage } from "../types";
import getDb from "../utils/db";
import { getBalanceState } from "../utils/states";
import { and, eq } from "drizzle-orm";
import { user, guild, balance } from "../schema";
import { channelMessage } from "../utils/response";

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

export async function redeem(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {

	const db = getDb(env);
	let userState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);

	if (!msg.member) {
		return new Response(
			JSON.stringify({}),
			{ status: 401 }
		);
	}

	let init: Promise<any>[] = [];

	if (!userState.user) {

		const initUser = {
			id: msg.member.user.id,
			username: msg.member.user.username,
			discriminator: msg.member.user.discriminator,
			global_name: msg.member.user.global_name ?? null,
			avatar: msg.member.user.avatar ?? null,
		};

		init.push(db.insert(user).values(initUser));
		userState.user = initUser;
	}

	if (!userState.guild) {

		const initGuild = {
			id: msg.guild_id,
			locale: msg.guild_locale ?? null,
			app_permissions: msg.app_permissions ?? null,
		};

		init.push(db.insert(guild).values(initGuild));
		userState.guild = initGuild;
	}

	if (init.length > 0) await Promise.all(init);

	if (!userState.balance) {
		const defaultBalance = redeemPointConfig.hourly + redeemPointConfig.daily + redeemPointConfig.weekly + redeemPointConfig.monthly;

		await db.insert(balance).values({
			user_id: userState.user.id,
			guild_id: userState.guild.id,
			balance: defaultBalance,
			last_daily: new Date(),
			last_hourly: new Date(),
			last_weekly: new Date(),
			last_monthly:	new Date()
		});

		return channelMessage(`You have redeemed :coin: for the first time!\nYou can redeem :coin: once every hour, day, week and month.\n\n**You now have ${defaultBalance.toLocaleString()} :coin:!**`,);
	}

	const locale = userState.guild.locale ?? "en-US";
	let pointsStatus = "";
	let totalRedeemed = 0;

	const now = new Date();

	if (!userState.balance.last_hourly || (now.getTime() - userState.balance.last_hourly.getTime()) >= HOUR) {
		userState.balance.balance += redeemPointConfig.hourly;
		totalRedeemed += redeemPointConfig.hourly;
		userState.balance.last_hourly = now;
		pointsStatus += `${redeemPointConfig.hourly.toLocaleString(locale)} :coin: redeemed for hourly.\n`;
	} else {
		const timeLeft = new Date((userState.balance.last_hourly.getTime() + HOUR) - now.getTime());
		pointsStatus += `You have ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for hourly.\n`;
	}

	if (!userState.balance.last_daily || (now.getTime() - userState.balance.last_daily.getTime()) >= DAY) {
		userState.balance.balance += redeemPointConfig.daily;
		totalRedeemed += redeemPointConfig.daily;
		userState.balance.last_daily = now;
		pointsStatus += `${redeemPointConfig.daily.toLocaleString(locale)} :coin: redeemed for daily.\n`;
	} else {
		const timeLeft = new Date((userState.balance.last_daily.getTime() + DAY) - now.getTime());
		pointsStatus += `You have ${timeLeft.getHours()} hours ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for daily.\n`;
	}

	if (!userState.balance.last_weekly || (now.getTime() - userState.balance.last_weekly.getTime()) >= WEEK) {
		userState.balance.balance += redeemPointConfig.weekly;
		totalRedeemed += redeemPointConfig.weekly;
		userState.balance.last_weekly = now;
		pointsStatus += `${redeemPointConfig.weekly.toLocaleString(locale)} :coin: redeemed for weekly.\n`;
	} else {
		const timeLeft = new Date((userState.balance.last_weekly.getTime() + WEEK) - now.getTime());
		pointsStatus += `You have ${timeLeft.getDate() - 1} days ${timeLeft.getHours()} hours ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for weekly.\n`;
	}

	if (!userState.balance.last_monthly || (now.getTime() - userState.balance.last_monthly.getTime()) >= MONTH) {
		userState.balance.balance += redeemPointConfig.monthly;
		totalRedeemed += redeemPointConfig.monthly;
		userState.balance.last_monthly = now;
		pointsStatus += `${redeemPointConfig.monthly.toLocaleString(locale)} :coin: redeemed for monthly.\n`;
	} else {
		const timeLeft = new Date((userState.balance.last_monthly.getTime() + MONTH) - now.getTime());
		pointsStatus += `You have ${timeLeft.getDate() - 1} days ${timeLeft.getHours()} hours ${timeLeft.getMinutes()} minutes ${timeLeft.getSeconds()} seconds left for monthly.\n`;
	}

	await db.update(balance).set({
		balance: userState.balance.balance,
		last_daily: userState.balance.last_daily,
		last_hourly: userState.balance.last_hourly,
		last_monthly: userState.balance.last_monthly,
		last_weekly: userState.balance.last_weekly,
	}).where(
		eq(balance.id, userState.balance.id)
	);

	return channelMessage(`<@!${msg.member?.user.id}> has redeemed ${totalRedeemed.toLocaleString(locale)} :coin:!\n\n${pointsStatus}\n**You now have ${userState.balance.balance.toLocaleString(locale)} :coin:!**`);
}
