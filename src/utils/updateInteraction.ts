export async function updateInteraction(env: Env, interactionToken: string, data: any) {
	const url = `https://discord.com/api/v10/webhooks/${env.DISCORD_APP_ID}/${interactionToken}/messages/@original`;
	const response = await fetch(url, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bot ${env.DISCORD_APP_TOKEN}`
		},
		body: JSON.stringify(data),
	});
	return response;
}
