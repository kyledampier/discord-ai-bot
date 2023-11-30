import { eq } from "drizzle-orm";
import getDb, { Answer } from "./db";
import { challenge, question } from "../schema";
import { shuffleArray } from "./shuffleArray";

export async function getNewQuestion(env: Env, challenge_id: number, question_num = 0, category_id?: number) {
	const db = getDb(env);

	// Get random question
	const randomSelect = await env.DB.prepare(`SELECT * FROM questions ORDER BY random() LIMIT 1;`).run();
	if (!randomSelect || !randomSelect.results.length) {
		throw new Error("No questions found");
	}
	const questionId = Number(randomSelect.results[0].id);

	// TODO: get questions from the same category
	const questionQuery = await db.query.question.findFirst({
		where: eq(question.id, questionId),
		with: {
			answers: true,
			category: true,
		}
	});

	if (!questionQuery) {
		throw new Error("No questions found");
	}

	console.log(questionQuery);

	const output = {
		...questionQuery,
		answers: shuffleArray<Answer>(questionQuery.answers),
		category: questionQuery.category,
	};
	await env.STATES.put(`challenge-${challenge_id}-${question_num}`, JSON.stringify(output));

	return output;
}
