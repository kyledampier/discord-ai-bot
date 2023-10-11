export default async function deleteCommand(command: string, env: Env) {

	const commandsRegUrl = `https://discord.com/api/v10/applications/${env.DISCORD_APP_ID}/commands/${command}`;

	const headers = {
		Authorization: `Bot ${env.DISCORD_APP_TOKEN}`,
		'Content-Type': 'application/json',
	};

	return await fetch(commandsRegUrl, {
		method: 'DELETE',
		headers,
		body: JSON.stringify({}),
	});
}
