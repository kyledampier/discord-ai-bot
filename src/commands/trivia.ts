import { Env } from "../worker";

export const TriviaConfig = {
	name: 'trivia',
	description: 'Challenge your friends to a game of trivia!',
	type: 1,
	options: [
		{
			name: 'test',
			description: 'This is a test',
			type: 3,
			required: true,
		},
	],
};

export async function trivia(test: string, msgToken: string, env: Env) {
	const interactionUrl = `https://discord.com/api/v8/interactions/${env.DISCORD_APP_ID}/${msgToken}/callback`;

	// console.log(test);
	return new Response(
		JSON.stringify({
			type: 4,
			data: {
				content: `Whoever sent this is gay -> "${test}"`,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}
