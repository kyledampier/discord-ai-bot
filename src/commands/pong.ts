import { InteractionResponseType } from 'discord-interactions';
import { CommandConfig } from '../types';

export const PongConfig: CommandConfig = {
	name: 'pong',
	description: 'Replies with Pong!',
	type: 1,
};

export function pong() {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: 'Pong!',
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
