import getDb, { FullQuestion } from './db';
import { eq, lt, gte, ne, and, or } from "drizzle-orm";
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
	question: FullQuestion;
	question_logs: typeof question_log.$inferSelect[];
	answer_logs: typeof answer_log.$inferSelect[];
}

export async function getChallengeState(env: Env, challenge_id: number, question_id: number, current_question=0): Promise<ChallengeState> {
	const db = getDb(env);

	const [challengeState, questionState] = await Promise.all([
		db.query.challenge.findFirst({
			where: eq(challenge.id, challenge_id),
		}),
		db.query.question.findFirst({
			where: eq(question.id, question_id),
			with: {
				answers: true,
				category: true,
			}
		}),
	]);

	if (!challengeState || !questionState) {
		throw new Error("Challenge or question not found");
	}

	const [questionLogsState, answerLogsState] = await Promise.all([
		db.select().from(question_log).where(
			and(
				or(
					eq(question_log.user_id, challengeState.initiator_id ?? ""),
					eq(question_log.user_id, challengeState.challenger_id ?? ""),
				),
				eq(question_log.guild_id, challengeState.guild_id ?? ""),
				eq(question_log.challenge_id, challenge_id),
				eq(question_log.question_id, question_id),
				eq(question_log.question_number, current_question),
			)
		),
		db.select().from(answer_log).where(
			and(
				eq(answer_log.challenge_id, challenge_id),
				eq(answer_log.question_id, question_id),
				eq(answer_log.question_number, current_question),
			)
		),
	]);

	return {
		challenge: challengeState,
		question: questionState,
		question_logs: questionLogsState,
		answer_logs: answerLogsState,
	}
}

