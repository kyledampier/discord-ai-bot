import { InteractionResponseType } from "discord-interactions";
import { DiscordMessage } from "../types";

export function challengerResponse(message: DiscordMessage, env: Env) {

	if (!message.member) {
		return new Response(
			JSON.stringify({
				error: 'Invalid request signature',
			}),
			{
				status: 401,
			}
		);
	}

	const messenger = message.member.user.id;
	const accepted = message.data.custom_id === 'challenger_accept';

	if (!accepted) {
		return new Response(
			JSON.stringify({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `<@!${messenger}> has declined the challenge!`,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			}
		);
	}

	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `<@!${messenger}> accepted the challenge!`,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
			status: 200,
		}
	);
}
