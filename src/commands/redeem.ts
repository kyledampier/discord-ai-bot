import { InteractionResponseType } from 'discord-interactions';
import { CommandConfig, DiscordMessage } from '../types';
import getDb from '../utils/db';
import { getBalanceState } from '../utils/states';
import { and, eq } from 'drizzle-orm';
import { user, guild, balance } from '../schema';
import { channelMessage, channelMessageWithComponents } from '../utils/response';

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

function getDiscordRelativeTime(time: Date) {
	const timestamp_sec = time.getTime() / 1000;
	return `<t:${Math.ceil(timestamp_sec)}:R>`;
}

export async function redeem(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	const db = getDb(env);
	let userState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);

	if (!msg.member) {
		return new Response(JSON.stringify({}), { status: 401 });
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
			last_monthly: new Date(),
		});

		return channelMessage(
			`You have redeemed :coin: for the first time!\nYou can redeem :coin: once every hour, day, week and month.\n\n**You now have ${defaultBalance.toLocaleString()} :coin:!**`
		);
	}

	const locale = userState.guild.locale ?? 'en-US';
	let totalRedeemed = 0;

	let timeUntilFields: {
		name: string;
		value: string;
		inline?: boolean;
	}[] = [];

	const now = new Date();

	if (!userState.balance.last_hourly || now.getTime() - userState.balance.last_hourly.getTime() >= HOUR) {
		userState.balance.balance += redeemPointConfig.hourly;
		totalRedeemed += redeemPointConfig.hourly;
		userState.balance.last_hourly = now;
		timeUntilFields.push({
			name: 'Hourly',
			value: `${redeemPointConfig.hourly.toLocaleString(locale)} :coin:`,
			inline: true,
		});
	} else {
		timeUntilFields.push({
			name: 'Hourly',
			value: getDiscordRelativeTime(new Date(userState.balance.last_hourly.getTime() + HOUR)),
			inline: true,
		});
	}

	if (!userState.balance.last_daily || now.getTime() - userState.balance.last_daily.getTime() >= DAY) {
		userState.balance.balance += redeemPointConfig.daily;
		totalRedeemed += redeemPointConfig.daily;
		userState.balance.last_daily = now;
		timeUntilFields.push({
			name: 'Daily',
			value: `${redeemPointConfig.daily.toLocaleString(locale)} :coin:`,
			inline: true,
		});
	} else {
		timeUntilFields.push({
			name: 'Daily',
			value: getDiscordRelativeTime(new Date(userState.balance.last_daily.getTime() + DAY)),
			inline: true,
		});
	}

	if (!userState.balance.last_weekly || now.getTime() - userState.balance.last_weekly.getTime() >= WEEK) {
		userState.balance.balance += redeemPointConfig.weekly;
		totalRedeemed += redeemPointConfig.weekly;
		userState.balance.last_weekly = now;
		timeUntilFields.push({
			name: 'Weekly',
			value: `${redeemPointConfig.weekly.toLocaleString(locale)} :coin:`,
			inline: true,
		});
	} else {
		timeUntilFields.push({
			name: 'Weekly',
			value: getDiscordRelativeTime(new Date(userState.balance.last_weekly.getTime() + WEEK)),
			inline: true,
		});
	}

	if (!userState.balance.last_monthly || now.getTime() - userState.balance.last_monthly.getTime() >= MONTH) {
		userState.balance.balance += redeemPointConfig.monthly;
		totalRedeemed += redeemPointConfig.monthly;
		userState.balance.last_monthly = now;
		timeUntilFields.push({
			name: 'Monthly',
			value: `${redeemPointConfig.monthly.toLocaleString(locale)} :coin:`,
			inline: true,
		});
	} else {
		timeUntilFields.push({
			name: 'Monthly',
			value: getDiscordRelativeTime(new Date(userState.balance.last_monthly.getTime() + MONTH)),
			inline: true,
		});
	}

	await db
		.update(balance)
		.set({
			balance: userState.balance.balance,
			last_daily: userState.balance.last_daily,
			last_hourly: userState.balance.last_hourly,
			last_monthly: userState.balance.last_monthly,
			last_weekly: userState.balance.last_weekly,
		})
		.where(eq(balance.id, userState.balance.id));

	return channelMessageWithComponents({
		embeds: [
			{
				title: `You redeemed ${totalRedeemed.toLocaleString(locale)} :coin:!`,
				footer: {
					text: `Your new balance is ${userState.balance.balance.toLocaleString(locale)}`,
				},
				fields: timeUntilFields,
				color: 0x9656ce,
			},
		],
	});
}
