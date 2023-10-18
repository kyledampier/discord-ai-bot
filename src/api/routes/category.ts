import { question, questionCategory } from '../../schema';
import getDb from '../../utils/db';
import { asc, eq, sql } from 'drizzle-orm';

export async function getCategories(env: Env) {
	try {
		const categoriesWithCounts = await env.STATES.get('category-counts').then((value) => JSON.parse(value ?? '{}'));
		if (categoriesWithCounts) {
			return new Response(
				JSON.stringify({
					categories: categoriesWithCounts,
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json;charset=UTF-8',
						'Cache-Control': 'max-age=3600', // cache for 1 hour
					},
				}
			);
		}
	} catch (e) {
		console.log('error', e);
	}

	const db = getDb(env);
	const categories = await db.query.questionCategory.findMany();

	return new Response(
		JSON.stringify({
			categories,
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Cache-Control': 'max-age=3600', // cache for 1 hour
			},
		}
	);
}

export async function getCategoryCounts(env: Env, ctx: ExecutionContext) {
	const db = getDb(env);
	const categoryCounts = await db
		.select({
			id: questionCategory.id,
			name: questionCategory.name,
			count: sql<number>`count(*)`,
		})
		.from(question)
		.leftJoin(questionCategory, eq(questionCategory.id, question.category_id))
		.groupBy(question.category_id)
		.orderBy(asc(questionCategory.name));

	console.log('categoryCounts', categoryCounts);

	ctx.waitUntil(env.STATES.put('category-counts', JSON.stringify(categoryCounts)));
	return new Response(
		JSON.stringify({
			categories: categoryCounts,
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
			},
		}
	);
}
