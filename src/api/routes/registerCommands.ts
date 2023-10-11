import { registerCommand, PongConfig, TriviaConfig, RedeemConfig, BalanceConfig } from "../../commands/index";
import { CommandConfig } from "../../types";

export const commands = new Map<string, CommandConfig>();
commands.set("pong", PongConfig);
commands.set("trivia", TriviaConfig);
commands.set("redeem", RedeemConfig);
commands.set("balance", BalanceConfig);

export default async function registerCommands(command: string, env: Env) {
	const cmd = commands.get(command);
	if (!cmd) {
		return new Response("Not found.", {
			status: 404,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
			},
		});
	}

	return await registerCommand(cmd, env.DISCORD_APP_ID, env.DISCORD_APP_TOKEN);
}
