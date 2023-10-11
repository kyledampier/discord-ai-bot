/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { pong, redeem, balance, trivia } from './commands';
import { DiscordMessage } from './types';
import { challengerResponse } from './commands/challengerResponse';
import router from './api/router';

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

		if (message.type === InteractionType.MESSAGE_COMPONENT) {
			if (message.data.custom_id === 'challenger_accept' || message.data.custom_id === 'challenger_decline') {
				return challengerResponse(message, env, ctx);
			}
		}

		if (message.type === InteractionType.APPLICATION_COMMAND) {
			if (message.data.name === 'ping') {
				return pong();
			}

			if (message.data.name === 'redeem') {
				return redeem(message, env, ctx);
			}

			if (message.data.name === 'balance') {
				return balance(message, env, ctx);
			}

			// all other commands require an input
			if (!message.data.options) {
				return new Response(
					JSON.stringify({
						error: 'Invalid request signature',
					}),
					{
						status: 401,
					}
				);
			}

			if (message.data.name === 'trivia') {
				return trivia(message, env, ctx);
			}
		}

		// Respond to ping, Required by Discord
		if (message.type === InteractionType.PING) {
			return new Response(
				JSON.stringify({
					type: InteractionResponseType.PONG,
				}),
				{
					status: 200,
				}
			);
		}

		return new Response(JSON.stringify({}), {
			status: 400,
		});
	},
};
