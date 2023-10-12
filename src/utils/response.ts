import { InteractionResponseType } from "discord-interactions";

export function channelMessage(content: string) {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

export function errorResponse(message: string, status: number) {
	return new Response(
		JSON.stringify({
			error: message,
		}),
		{
			status,
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

export function ACK() {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.PONG,
		}),
		{
			status: 200,
		}
	);
}
