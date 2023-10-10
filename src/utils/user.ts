import { Env } from "../worker";

export async function getUser(id: string, env: Env) {
	const userApi = `https://discord.com/api/v9/users/${id}`;

	return await fetch(userApi, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${env.DISCORD_APP_TOKEN}`,
		},
	}).then((res) => res.json());
}
