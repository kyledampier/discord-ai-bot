import { CommandConfig } from "../types/Command";
// import * as dotenv from "dotenv";
// dotenv.config();
// import { PongConfig, TriviaConfig, RedeemConfig, BalanceConfig } from "./index";

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

// TODO: Add all commands here to register them
// const commands = [PongConfig, TriviaConfig, RedeemConfig, BalanceConfig];
// const responses = Promise.all(commands.map((cmd) => registerCommand(cmd, process.env.DISCORD_APP_ID, process.env.DISCORD_APP_TOKEN)));

// console.log(responses);
