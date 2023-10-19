import { InteractionType, verifyKey } from 'discord-interactions';
import { pong, redeem, balance, trivia, generate, transfer, leaderboard } from './commands';
import { DiscordMessage } from './types';
import { challengerResponse } from './commands/challengerResponse';
import router from './api/router';
import { logInteraction } from './utils/interactionLog';
import { ACK, errorResponse } from './utils/response';
import { challengeAnswer } from './commands/challengeAnswer';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		const url = new URL(request.url);

		// manage api routes
		if (url.pathname.startsWith('/api')) {
			return router.handle(request, env, ctx);
		}

		// check if post request
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({}), {
				status: 405,
			});
		}

		// check if request is from discord
		const signature = request.headers.get('X-Signature-Ed25519');
		const timestamp = request.headers.get('X-Signature-Timestamp');
		const rawBody = await request.clone().text();

		if (!signature || !timestamp) {
			return new Response(
				JSON.stringify({
					error: 'Invalid request signature',
				}),
				{
					status: 401,
				}
			);
		}

		const isValidRequest = verifyKey(rawBody, signature, timestamp, env.DISCORD_APP_PUBLIC_KEY);
		if (!isValidRequest) {
			return new Response(
				JSON.stringify({
					error: 'Invalid request signature',
				}),
				{
					status: 401,
				}
			);
		}

		const message = (await request.json()) as DiscordMessage;
		logInteraction(message, env, ctx);

		if (message.type === InteractionType.MESSAGE_COMPONENT) {
			if (message.data.custom_id?.startsWith('challenge_accept') || message.data.custom_id?.startsWith('challenger_decline')) {
				return challengerResponse(message, env, ctx);
			}

			if (message.data.custom_id?.startsWith('challenge_answer')) {
				return challengeAnswer(message, env, ctx);
			}
		}

		if (message.type === InteractionType.APPLICATION_COMMAND) {
			console.log(message);

			if (!message.data) {
				return errorResponse('Invalid request signature', 401);
			}

			if (message.data.name === 'ping') {
				return pong();
			}

			if (message.data.name === 'redeem') {
				return redeem(message, env, ctx);
			}

			if (message.data.name === 'balance') {
				return balance(message, env, ctx);
			}

			if (message.data.name === 'leaderboard') {
				return leaderboard(message, env, ctx);
			}

			// all other commands require an input
			if (!message.data.options) {
				return errorResponse('Invalid request signature', 401);
			}

			if (message.data.name === 'trivia') {
				return trivia(message, env, ctx);
			}

			if (message.data.name === 'generate') {
				return generate(message, env, ctx);
			}

			if (message.data.name === 'transfer') {
				return transfer(message, env, ctx);
			}
		}

		// Respond to ping, Required by Discord
		if (message.type === InteractionType.PING) ACK();

		return new Response(JSON.stringify({}), {
			status: 400,
		});
	},
};
