import { InteractionResponseType } from "discord-interactions";
import { DiscordMessage } from "../types";
import { channelMessage, errorResponse } from "../utils/response";

export function challengerResponse(message: DiscordMessage, env: Env, ctx: ExecutionContext) {

	if (!message.member) {
		return errorResponse('You must be in a server to use this command!', 401);
	}

	const messenger = message.member.user.id;
	const accepted = message.data.custom_id === 'challenger_accept';

	if (!accepted) {
		return channelMessage(`<@!${messenger}> has declined the challenge!`);
	}

	return channelMessage(`<@!${messenger}> accepted the challenge!`);
}
