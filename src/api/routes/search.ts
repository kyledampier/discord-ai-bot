import { eq } from 'drizzle-orm';
import getDb, { FullQuestion } from '../../utils/db';

// q = search term
// limit = number of results
// offset = pagination
// TODO: category = category name
export const search = async (request: Request, env: Env, ctx: ExecutionContext) => {
	const db = getDb(env);

	const url = new URL(request.url);

	// parse params
	const query = url.searchParams.get('q') || '';
	const limitStr = url.searchParams.get('limit');
	const limit = limitStr ? parseInt(limitStr) : 10;
	const offsetStr = url.searchParams.get('offset');
	const offset = offsetStr ? parseInt(offsetStr) : 0;
	const categoryStr = url.searchParams.get('category');
	const category = categoryStr ? parseInt(categoryStr) : null;

	let questions: FullQuestion[];

	if (category && category > 0) {
		questions = await db.query.question.findMany({
			where: (question, { and, like }) => and(like(question.question, `%${query}%`), eq(question.category_id, category)),
			limit,
			offset,
			with: {
				answers: true,
				category: true,
			},
			orderBy: (questions, { desc }) => desc(questions.id),
		});
	} else {
		questions = await db.query.question.findMany({
			where: (question, { and, like }) => and(like(question.question, `%${query}%`)),
			limit,
			offset,
			with: {
				answers: true,
				category: true,
			},
			orderBy: (questions, { desc }) => desc(questions.id),
		});
	}

	return new Response(
		JSON.stringify({
			questions,
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Cache-Control': 'max-age=900', // cache for 15 minutes
			},
		}
	);
};
