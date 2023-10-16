import getDb, { Answer } from "../utils/db";
import { eq, sql } from "drizzle-orm";
import { challenge, question_log, question } from "../schema";
import { DiscordMessage } from "../types";
import { ACK, channelMessage, channelMessageWithComponents, channelMessageWithQuestion, componentACK, errorResponse, updateMessage } from "../utils/response";
import { updateInteraction } from "../utils/updateInteraction";
import { InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { shuffleArray } from "../utils/shuffleArray";
import { getNewQuestion } from "../utils/newQuestion";

function getChallengeId(custom_id: string) {
	return Number.parseInt(custom_id.split('-')[1]);
}

export async function challengerResponse(message: DiscordMessage, env: Env, ctx: ExecutionContext) {

	console.log(message);

	if (!message.member) {
		return errorResponse('You must be in a server to use this command!', 401);
	}
	const db = getDb(env);

	const challengeId = getChallengeId(message.data.custom_id!);
	const challengeQuery = await db.select().from(challenge).where(eq(challenge.id, challengeId));

	if (!challengeQuery || !challengeQuery[0]) {
		console.log('No challenge data found!');
		return componentACK();
	}

	const challengeData = challengeQuery[0];

	const clicker = message.member.user.id;

	const accepted = message.data.custom_id?.startsWith('challenge_accept');
	const isInitiator = challengeData.initiator_id === clicker;
	const isChallenger = challengeData.challenger_id === clicker;

	if (!accepted) {
		if (isInitiator || isChallenger) {
			await db.update(challenge).set({
				status: 'cancelled',
			}).where(eq(challenge.id, challengeId));

			return updateMessage({
				content: `Challenge cancelled...`,
				components: [
					{
						type: MessageComponentTypes.ACTION_ROW,
						components: [
							{
								type: MessageComponentTypes.BUTTON,
								label: 'Accept',
								style: 2, // GRAY
								disabled: true,
								custom_id: `challenge_accept-${challengeData.id}`,
							},
							{
								type: MessageComponentTypes.BUTTON,
								label: 'Decline',
								style: 4, // RED
								disabled: true,
								custom_id: `challenger_decline-${challengeData.id}`,
							},
						],
					},
				],
			});
		}

		return componentACK();
	}

	if (isChallenger) {

		ctx.waitUntil(updateInteraction(env, challengeData.interaction_token ?? "", {
			content: `<@!${challengeData.challenger_id}> has accepted a challenge from <@!${challengeData.initiator_id}> to a game of trivia for **${challengeData.wager}** :coin:!`,
			components: [
				{
					type: MessageComponentTypes.ACTION_ROW,
					components: [
						{
							type: MessageComponentTypes.BUTTON,
							label: 'Accept',
							style: 3, // GREEN
							disabled: true,
							custom_id: `challenge_accept-${challengeData.id}`,
						},
						{
							type: MessageComponentTypes.BUTTON,
							label: 'Decline',
							style: 2, // GRAY
							disabled: true,
							custom_id: `challenger_decline-${challengeData.id}`,
						},
					],
				},
			],
		}));

		// Get random question
		// TODO: get questions from the same category
		const questionQuery = await getNewQuestion(env, challengeId, challengeData.current_question ?? 0);
		if (!questionQuery) return channelMessage(`No questions found!`);

		// const answers = shuffleArray<Answer>(questionQuery.answers);

		const questionLogInitiator: typeof question_log.$inferInsert = {
			challenge_id: challengeId,
			question_number: challengeData.current_question ?? null,
			question_id: questionQuery.id,
			guild_id: challengeData.guild_id,
			user_id: challengeData.initiator_id,
			answer_id: questionQuery.answers.filter((a) => a.correct)[0].id ?? null,
			interaction_id: message.id,
			interaction_token: message.token,
		};

		const questionLogChallenger = {
			...questionLogInitiator,
			user_id: challengeData.challenger_id,
		};

		console.log("question_log: initiator", questionLogInitiator);

		const dbUpdate = Promise.all([
			// update challenge status
			db.update(challenge).set({
				status: 'accepted',
				current_question: challengeData.current_question ?? 0,
			}).where(eq(challenge.id, challengeId)),

			// add users to question log
			db.insert(question_log).values(questionLogInitiator),
			db.insert(question_log).values(questionLogChallenger),
		]);

		ctx.waitUntil(dbUpdate);
		return channelMessageWithQuestion(questionQuery, questionQuery.answers, challengeData);
	}

	return componentACK();
}
