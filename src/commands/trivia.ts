import { InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { CommandConfig, DiscordMessage } from "../types";
import { serializeInput } from "../utils/serialize";
import { channelMessage, errorResponse } from "../utils/response";
import { getBalanceState } from "../utils/states";
import getDb from "../utils/db";
import { challenge } from "../schema";

export const TriviaConfig: CommandConfig = {
	name: 'trivia',
	description: 'Challenge your friends to a game of trivia!',
	type: 1,
	options: [
		{
			name: 'challenger',
			description: 'The person you want to challenge',
			type: 6, // USER
			required: true,
		},
		{
			name: 'wager',
			description: 'The amount of :coin: you want to wager',
			type: 4, // INTEGER
			required: true,
		},
		{
			name: 'num_questions',
			description: 'The number of questions you want to ask',
			type: 4, // INTEGER
			required: true,
			choices: [
				{
					name: '1',
					value: 1,
				},
				{
					name: '3',
					value: 3,
				},
				{
					name: '5',
					value: 5,
				},
				{
					name: '10',
					value: 10,
				},
				{
					name: '15',
					value: 15,
				},
				{
					name: '20',
					value: 20,
				},
			]
		},
		{
			name: 'category',
			description: 'The category of questions you want to ask',
			type: 4, // INTEGER
			required: false,
			choices: [
				{
					name: 'HQ Trivia',
					value: 1,
				},
				{
					name: 'General Knowledge',
					value: 2,
				},
				{
					name: "Literature",
					value: 3,
				},
				{
					name: "Movies",
					value: 4,
				},
				{
					name: "Music",
					value: 5,
				},
				{
					name: "Sports",
					value: 6,
				}
			]
		}
	],
};

export async function trivia(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	const input = serializeInput(TriviaConfig, msg.data.options!);
	if (!input.challenger) {
		return errorResponse('Invalid request signature', 401);
	}

	const initiatorId = msg.member?.user.id;
	const challengerId = input.challenger as string;
	// const interactionUrl = `https://discord.com/api/v10/interactions/${env.DISCORD_APP_ID}/${msg.token}/callback`;

	if (initiatorId === challengerId) {
		return channelMessage(`You can't challenge yourself!`);
	}

	const [initiatorBalance, challengerBalance] = await Promise.all([
		getBalanceState(env, initiatorId, msg.guild_id),
		getBalanceState(env, challengerId, msg.guild_id),
	]);

	console.log(initiatorBalance, challengerBalance);

	if (!initiatorBalance.balance) {
		return channelMessage(`<@!${initiatorId}> does not have a balance in this server.\nPlease use \`/redeem\` to create one.`);
	}

	if (!challengerBalance.balance) {
		return channelMessage(`<@!${challengerId}> does not have a balance in this server.\nPlease use \`/redeem\` to create one.`);
	}

	if (initiatorBalance.balance.balance < Number(input.wager)) {
		return channelMessage(`You do not have enough :coin: to wager ${input.wager}.\n
		Your balance is ${initiatorBalance.balance.balance} :coin:.`);
	}

	if (challengerBalance.balance.balance < Number(input.wager)) {
		return channelMessage(`<@!${challengerId}> does not have enough :coin: to wager ${input.wager}.\n
		Their balance is ${challengerBalance.balance.balance} :coin:.`);
	}

	const db = getDb(env);

	type ChallengeInsert = typeof challenge.$inferInsert;

	const challengeInit: ChallengeInsert = {
		guild_id: msg.guild_id,
		initiator_id: initiatorId,
		challenger_id: challengerId,
		wager: Number(input.wager),
		num_questions: Number(input.num_questions),
		category: 1,
		interaction_id: msg.id,
		interaction_token: msg.token,
		status: 'pending',
	};

	const challengeResult = await db.insert(challenge).values(challengeInit).returning();

	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `<@!${initiatorId}> has challenged <@!${challengerId}> to a game of trivia for ${input.wager} :coin:!`,
				components: [
					{
						type: MessageComponentTypes.ACTION_ROW,
						components: [
							{
								type: MessageComponentTypes.BUTTON,
								label: 'Accept',
								style: 3, // GREEN
								custom_id: `challenge_accept-${challengeResult[0].id}`,
							},
							{
								type: MessageComponentTypes.BUTTON,
								label: 'Decline',
								style: 4, // RED
								custom_id: `challenger_decline-${challengeResult[0].id}`,
							},
						],
					},
				],
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}
