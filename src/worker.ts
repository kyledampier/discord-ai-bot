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
import { CommandConfig } from './types/command';
import { PongConfig, pong } from './commands/pong';
import { GenerateConfig, generate } from './commands/generate';

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

	DISCORD_APP_ID: string;
	DISCORD_APP_PUBLIC_KEY: string;
	DISCOED_APP_SECRET: string;
	DISCORD_APP_TOKEN: string;
	DISCORD_APP_GUILD_ID: string;
	OPENAI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// check if post request
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({}), {
				status: 405,
			});
		}

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

		const commands = [PongConfig, GenerateConfig];
		await Promise.all(commands.map((cmd) => registerCommand(cmd, env.DISCORD_APP_ID, env.DISCORD_APP_TOKEN)));

		const message = (await request.json()) as {
			id: string;
			type: InteractionType;
			token: string;
			member?: {
				user: {
					id: string;
					username: string;
					discriminator: string;
				};
				roles: string[];
				permissions: string;
				joined_at: string;
			};
			data: CommandConfig;
		};

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

			if (message.data.name === 'generate') {
				const prompt = message.data.options.find((opt) => opt.name === 'prompt')?.value;
				generate(prompt as string, env.OPENAI_API_KEY, env.DISCORD_APP_ID, message.token);

				return new Response(
					JSON.stringify({
						type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: 'Generating image...',
						},
					}),
					{
						status: 200,
					}
				);
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
