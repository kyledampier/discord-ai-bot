import getDb from "../../utils/db";

export async function getCategories(env: Env) {
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
			},
		}
	);
}
