import { Env } from "../../worker";

export default async function question(request: Request, env: Env) {
	return new Response(JSON.stringify({}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
		},
	});
}
