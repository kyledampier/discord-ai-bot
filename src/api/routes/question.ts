import getDb from "../../utils/db";
import { eq } from "drizzle-orm";
import { question, answer, questionCategory } from "../../schema";
import { z } from "zod";

const createQuestionSchema = z.object({
	question: z.string(),
	type: z.enum(['multiple', 'boolean']),
	category: z.string(),
	difficulty: z.enum(['easy', 'medium', 'hard']),
	correct_answer: z.string(),
	incorrect_answers: z.array(z.string()).max(4),
});

export async function addQuestion(request: Request, env: Env, ctx: ExecutionContext) {
	const db = getDb(env);

	const body = await request.json();
	let input: typeof createQuestionSchema._type;
	try {
		input = createQuestionSchema.parse(body);
	} catch (e) {
		return new Response(JSON.stringify({
			error: e,
		}), {
			status: 400,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
			},
		});
	}

	let category = await db.select().from(questionCategory).where(eq(questionCategory.name, input.category));

	if (!category.length) {
		category = await db.insert(questionCategory).values({
			name: input.category,
		}).returning();
	}

	const questionResult = await db.insert(question).values({
		category_id: category[0].id,
		type: input.type,
		difficulty: input.difficulty,
		question: input.question,
	}).returning();

	await db.insert(answer).values([
		{
			question_id: questionResult[0].id,
			answer: input.correct_answer,
			correct: true,
		},
		...input.incorrect_answers.map((a) => ({
			question_id: questionResult[0].id,
			answer: a,
			correct: false,
		})),
	]);

	return new Response(JSON.stringify({
		question: questionResult[0],
	}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
		},
	});
}

export async function getQuestion(request: Request, env: Env) {
	const db = getDb(env);

	const questions = await db.query.question.findMany({
		limit: 10,
		with: {
			answers: true,
			category: true,
		}
	});

	return new Response(JSON.stringify({
		questions,
	}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
		},
	});
}
