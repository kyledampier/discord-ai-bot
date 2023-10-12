import { InteractionResponseType } from 'discord-interactions';
import { CommandConfig } from '../types';
import { channelMessage } from '../utils/response';

export const PongConfig: CommandConfig = {
	name: 'pong',
	description: 'Replies with Pong!',
	type: 1,
};

export function pong() {
	return channelMessage('Pong!');
}
