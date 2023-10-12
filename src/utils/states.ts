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

