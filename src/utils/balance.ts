import getDb from "./db";
import { and, eq } from "drizzle-orm";
import { balance } from "../schema";

export async function updateGuildUserBalance(env: Env, guild_id: string, user_id: string, amount: number): Promise<typeof balance.$inferSelect> {
	const db = getDb(env);
	const balanceStates = await db.select().from(balance).where(
		and(eq(balance.guild_id, guild_id), eq(balance.user_id, user_id))
	).execute();

	if (!balanceStates || balanceStates.length === 0) {
		throw new Error('Balance not found');
	}

	let balanceState = balanceStates[0];
	const newBalances = await db.update(balance).set({
		balance: Math.max(balanceState.balance + amount, 0),
	})
		.where(eq(balance.id, balanceState.id))
		.returning();

	balanceState = newBalances[0];

	if (!balanceState) {
		throw new Error('Failed to update balance');
	}

	return balanceState;
}
