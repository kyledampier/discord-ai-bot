import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../schema';

export default function getDb(env: Env) {
	return drizzle(env.DB, {
		schema
	});
};

export type Question = typeof schema.question.$inferSelect;
export type Answer = typeof schema.answer.$inferSelect;
export type Category = typeof schema.questionCategory.$inferSelect;

export type FullQuestion = Question & {
	answers: Answer[];
	category: Category | null;
};

export type Challenge = typeof schema.challenge.$inferSelect;
