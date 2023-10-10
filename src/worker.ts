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
import { registerCommand } from './commands/register';
import { PongConfig, pong } from './commands/pong';
import { TriviaConfig, trivia } from './commands/trivia';
import { DiscordMessage } from './types';
import { challengerResponse } from './commands/challengerResponse';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;

	USERS: KVNamespace;
	DB: D1Database;

	DISCORD_APP_ID: string;
	DISCORD_APP_PUBLIC_KEY: string;
	DISCOED_APP_SECRET: string;
	DISCORD_APP_TOKEN: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

		// register commands
		const commands = [PongConfig, TriviaConfig];
		await Promise.all(commands.map((cmd) => registerCommand(cmd, env.DISCORD_APP_ID, env.DISCORD_APP_TOKEN)));

		const message = (await request.json()) as DiscordMessage;
		console.log(message);

		if (message.type === InteractionType.MESSAGE_COMPONENT) {
			if (message.data.custom_id === 'challenger_accept' || message.data.custom_id === 'challenger_decline') {
				return challengerResponse(message, env);
			}
		}

		if (message.type === InteractionType.APPLICATION_COMMAND) {
			if (message.data.name === 'ping') {
				return pong();
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

			console.log(message.data.name, message.data.options);

			if (message.data.name === 'trivia') {
				return trivia(message, env);
			}

		}
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
