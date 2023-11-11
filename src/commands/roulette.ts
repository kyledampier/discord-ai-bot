import { DiscordMessage } from '../types';
import { CommandConfig } from '../types/Command';
import { updateGuildUserBalance } from '../utils/balance';
import { channelMessage } from '../utils/response';
import { serializeInput } from '../utils/serialize';
import { getBalanceState } from '../utils/states';

export const RouletteConfig: CommandConfig = {
	name: 'roulette',
	description: 'Spin the Roulette Wheel!',
	type: 1,
	options: [
		{
			name: 'bet_amount',
			description: 'The amount to bet',
			type: 4,
			required: true,
		},
		{
			name: 'bet_type',
			description: 'The type of bet to make',
			type: 3,
			required: false,
			choices: [
				{
					name: 'Even (2 to 1)',
					value: 'even',
				},
				{
					name: 'Odd (2 to 1)',
					value: 'odd',
				},
				{
					name: 'Red (2 to 1)',
					value: 'red',
				},
				{
					name: 'Black (2 to 1)',
					value: 'black',
				},
				{
					name: 'green (14 to 1)',
					value: 'green',
				},
				{
					name: '1-18 (2 to 1)',
					value: '1-18',
				},
				{
					name: '19-36 (2 to 1)',
					value: '19-36',
				},
				{
					name: '0-11 (3 to 1)',
					value: '0-11',
				},
				{
					name: '12-24 (3 to 1)',
					value: '12-24',
				},
				{
					name: '25-36 (3 to 1)',
					value: '25-36',
				},
			],
		},
	],
};

const redNumbers = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
const blackNumbers = [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26];

const betTypes: {
	name: string;
	multiplier: number;
	check: (num: number) => boolean;
}[] = [
	{
		name: 'even',
		multiplier: 2,
		check: (num) => num % 2 === 0 && num !== 0,
	},
	{
		name: 'odd',
		multiplier: 2,
		check: (num) => num % 2 === 1,
	},
	{
		name: 'red',
		multiplier: 2,
		check: (num) => redNumbers.includes(num),
	},
	{
		name: 'black',
		multiplier: 2,
		check: (num) => blackNumbers.includes(num),
	},
	{
		name: 'green',
		multiplier: 14,
		check: (num) => num === 0,
	},
	{
		name: '1-18',
		multiplier: 2,
		check: (num) => num >= 1 && num <= 18,
	},
	{
		name: '19-36',
		multiplier: 2,
		check: (num) => num >= 19 && num <= 36,
	},
	{
		name: '1-12',
		multiplier: 3,
		check: (num) => num >= 1 && num <= 12,
	},
	{
		name: '13-24',
		multiplier: 3,
		check: (num) => num >= 13 && num <= 24,
	},
	{
		name: '25-36',
		multiplier: 3,
		check: (num) => num >= 25 && num <= 36,
	},
];

export async function roulette(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	if (!msg.member?.user.id) throw new Error('No user ID found');

	const input = serializeInput(RouletteConfig, msg.data.options!);

	const betAmount = input.bet_amount as number;
	// check if bet amount is valid
	const balanceState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);
	if (betAmount > balanceState.balance.balance) {
		return channelMessage(
			`You don't have enough coins to make that bet! You have ${balanceState.balance.balance} :coin: and you tried to bet ${betAmount} :coin:`
		);
	}

	const betType = input.bet_type as string;
	const bet = betTypes.find((b) => b.name === betType);

	console.log(betType, betAmount);

	if (!bet) {
		return channelMessage(`Invalid bet type. Valid bet types are: ${betTypes.map((b) => b.name).join(', ')}`);
	}

	// random number between 0 and 36
	const randomNumber = Math.floor(Math.random() * 37);
	console.log(randomNumber);

	const won = bet.check(randomNumber);
	const winnings = won ? (bet.multiplier - 1) * betAmount : -betAmount;
	const newBalance = balanceState.balance.balance + winnings;

	if (winnings > 0) {
		return channelMessage(
			`You rolled ${randomNumber} and gained ${winnings} :coin:!\nYour new balance is ${newBalance} :coin:`
		);
	}

	ctx.waitUntil(updateGuildUserBalance(env, msg.guild_id, msg.member?.user.id, winnings));

	return channelMessage(
		`You rolled ${randomNumber} and lost ${winnings} :coin:!\nYour new balance is ${newBalance} :coin:`
	);
}
