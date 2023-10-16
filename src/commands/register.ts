import type { CommandConfig } from '../types/Command';

export async function registerCommand(cmd: CommandConfig, appId?: string, token?: string) {
	if (!appId || !token) {
		throw new Error('Missing required environment variables');
	}

	const commandsRegUrl = `https://discord.com/api/v10/applications/${appId}/commands`;

	const headers = {
		Authorization: `Bot ${token}`,
		'Content-Type': 'application/json',
	};

	return await fetch(commandsRegUrl, {
		method: 'POST',
		headers,
		body: JSON.stringify(cmd),
	});
}
