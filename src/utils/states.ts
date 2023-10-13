import getDb from './db';
import { eq, lt, gte, ne, and } from "drizzle-orm";
import { user, guild, balance, challenge, question, question_log, answer, answer_log } from '../schema';

export type BalanceState = {
	user: typeof user.$inferSelect;
	guild: typeof guild.$inferSelect;
	balance: typeof balance.$inferSelect;
}

export async function getBalanceState(env: Env, user_id?: string, guild_id?: string): Promise<BalanceState> {

	if (!user_id || !guild_id) {
		throw new Error("user_id and guild_id are required");
	}

	const db = getDb(env);

	const [userState, guildState, balanceState] = await Promise.all([
		db.select().from(user).where(eq(user.id, user_id)),
		db.select().from(guild).where(eq(guild.id, guild_id)),
		db.select().from(balance).where(and(eq(balance.user_id, user_id), eq(balance.guild_id, guild_id))),
	]);

	return {
		user: userState[0],
		guild: guildState[0],
		balance: balanceState[0],
	}
}

export type ChallengeState = {
	challenge: typeof challenge.$inferSelect;
	question: typeof question.$inferSelect;
	question_log: typeof question_log.$inferSelect;
	answer: typeof answer.$inferSelect;
	answer_log: typeof answer_log.$inferSelect;
}

// export async function getChallengeState(env: Env, challenge_id: number): Promise<ChallengeState> {
// 	const db = getDb(env);

// 	const [challengeState] = await Promise.all([
// 		db.select().from(challenge).where(eq(challenge.id, challenge_id)),
// 	]);

// 	const [questionState, questionLogState, answerState, answerLogState] = await Promise.all([
// 		db.select().from(question).where(eq(question.id, challengeState[0].)),
// 		db.select().from(question_log).where(eq(question_log.challenge_id, challenge_id)),
// 		db.select().from(answer).where(eq(answer.challenge_id, challenge_id)),
// 		db.select().from(answer_log).where(eq(answer_log.challenge_id, challenge_id)),
// 	]);

// 	return {
// 		challenge: challengeState[0],
// 		question: questionState[0],
// 		question_log: questionLogState[0],
// 		answer: answerState[0],
// 		answer_log: answerLogState[0],
// 	}
// }

