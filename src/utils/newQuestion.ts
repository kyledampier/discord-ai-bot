import { eq } from "drizzle-orm";
import getDb from "./db";
import { question } from "../schema";

export async function getNewQuestion(env: Env, category_id?: number) {
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

	return questionQuery;
}
