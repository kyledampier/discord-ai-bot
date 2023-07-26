import { CommandConfig } from "../types/command";


export async function registerCommand(cmd: CommandConfig, appId: string, token: string) {
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
