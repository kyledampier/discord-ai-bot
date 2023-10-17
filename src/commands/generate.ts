import { image_generation_log } from '../schema';
import { DiscordMessage } from '../types';
import { updateGuildUserBalance } from '../utils/balance';
import getDb from '../utils/db';
import { channelMessage } from '../utils/response';
import { serializeInput } from '../utils/serialize';
import { getBalanceState } from '../utils/states';
import { updateInteraction } from '../utils/updateInteraction';

export const GenerateConfig = {
	name: 'generate',
	description: 'Generate an image using DALLE-3 based on a prompt',
	type: 1,
	options: [
		{
			name: 'prompt',
			description: 'The prompt to generate an image from',
			type: 3, // STRING
			required: true,
		},
		{
			name: 'size',
			description: 'The size of the image to generate',
			type: 3, // STRING
			required: false,
			choices: [
				{
					name: '1024x1024 [default] (cost 1000 coins)',
					value: '1024x1024',
				},
				{
					name: '512x512 (cost 900 coins)',
					value: '512x512',
				},
				{
					name: '256x256 (cost 800 coins)',
					value: '256x256',
				},
			],
		},
	],
};

type OpenAIImageGenerationResponse = {
	created: number;
	data: {
		url: string;
	}[];
};

export async function generate(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	const db = getDb(env);

	const input = serializeInput(GenerateConfig, msg.data.options!);
	const prompt = input.prompt;
	const size = input.size || '256x256';
	const cost = size === '1024x1024' ? 1000 : size === '512x512' ? 900 : 800;
	const interactionToken = msg.token;

	let userState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);
	console.log(userState);

	if (!userState.user || !userState.guild || !userState.balance) {
		return channelMessage(`You have 0 :coin:. Please use \`/redeem\` to redeem your first :coin:!`);
	}

	if (userState.balance.balance < cost) {
		return channelMessage(
			`You don't have enough coins to generate an image. This image would cost ${cost.toLocaleString()} coins to generate.\n\nYou can \`/redeem\` :coin: once every hour, day, week and month.`
		);
	}

	const newBalance = userState.balance.balance - cost;

	const apiURL = `https://api.openai.com/v1/images/generations`;

	const response = fetch(apiURL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.OPENAI_API_SECRET}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			prompt: prompt,
			n: 1,
			size: size,
		}),
	})
		.then((response) => response.json() as Promise<OpenAIImageGenerationResponse>)
		.then(async (response) => {
			const data = await response;
			if (!data.data || data.data.length === 0) {
				return await updateInteraction(env, interactionToken, {
					content: `Error generating image: ${data}`,
				});
			} else if (!data.data[0].url) {
				return await updateInteraction(env, interactionToken, {
					content: `Error generating image: ${data}`,
				});
			} else {
				console.log('generated image url', data.data[0].url);
				await Promise.all([
					updateGuildUserBalance(env, msg.guild_id, msg.member?.user.id ?? '', -cost),
					db.insert(image_generation_log).values({
						guild_id: msg.guild_id,
						user_id: msg.member?.user.id ?? null,
						prompt: prompt as string,
						size: size as string,
						interaction_id: msg.id,
						interaction_token: interactionToken,
						image_url: data.data[0].url,
					}),
				]);
			}
			return await updateInteraction(env, interactionToken, {
				embeds: [
					{
						title: `DALL·E 2 Generated Image`,
						color: 0xffffff,
						description: `Image generated for <@!${msg.member?.user.id}>\n\nPrompt:\n**${prompt}**`,
						image: {
							url: data.data[0].url,
						},
						footer: {
							text: `This image cost ${cost.toLocaleString()} coins to generate. Your new balance is ${newBalance.toLocaleString()} coins.`,
						},
					},
				],
			});
		})
		.catch(async (error) => {
			console.error(error);
			return await updateInteraction(env, interactionToken, {
				content: `Error generating image: ${error}`,
			});
		});

	ctx.waitUntil(response);
	return new Response(
		JSON.stringify({
			type: 5, // ACK with update
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}
