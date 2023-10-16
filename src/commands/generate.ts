import { DiscordMessage } from '../types';
import { serializeInput } from '../utils/serialize';
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
					name: '256x256 [default] (cost 250 coins)',
					value: '256x256',
				},
				{
					name: '512x512 (cost 500 coins)',
					value: '512x512',
				},
				{
					name: '1024x1024 (cost 1000 coins)',
					value: '1024x1024',
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
	const input = serializeInput(GenerateConfig, msg.data.options!);
	const prompt = input.prompt;
	const size = input.size || '256x256';
	const cost = size === '256x256' ? 250 : size === '512x512' ? 500 : 1000;
	const interactionToken = msg.token;

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
			console.log(data);
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
							text: `This image cost ${cost.toLocaleString()} coins to generate.`,
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
