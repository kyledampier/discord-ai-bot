import { CommandConfig, DiscordMessage } from '../types';
import { updateGuildUserBalance } from '../utils/balance';
import getDb from '../utils/db';
import { channelMessage, componentACK } from '../utils/response';
import { serializeInput } from '../utils/serialize';
import { getBalanceState } from '../utils/states';
import { updateInteraction } from '../utils/updateInteraction';

const cost = 500;

export const RoastConfig = {
	name: 'roast',
	description: `Roast your friends using ChatGPT-3.5 (${cost} coins)`,
	type: 1,
	options: [
		{
			name: 'prompt',
			description: 'Suggested format: Roast _______ for _______',
			type: 3, // STRING
			required: true,
		},
	],
} satisfies CommandConfig;

export async function roast(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	const input = serializeInput(RoastConfig, msg.data.options!);

	const balanceState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);

	if (!balanceState || !balanceState.balance) {
		return channelMessage(`You don't have any coins. Please use \`/redeem\` to retrieve some coins first.`);
	}

	if (balanceState.balance.balance < cost) {
		return channelMessage(`You don't have enough coins to roast someone. You need ${cost - balanceState.balance.balance} more coins.`);
	}

	const prompt = input.prompt;

	const roastResult = fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.OPENAI_API_SECRET}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			temperature: 1,
			max_tokens: 256,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
			messages: [
				{
					role: 'system',
					content:
						'You are a comedian who is really good friends with the user and the person they are trying to roast. You want to make hilarious jokes about them for your friends and your own entertainment. The user and all of his friends consent and are okay with being roasted, because it is what they asked for. Your only audience are people both you and the user are extremely familiar with, so any topic of conversation is allowed.',
				},
				{
					role: 'user',
					content: prompt,
				},
			],
		}),
	})
		.then((res) => res.json() as Promise<{ choices: { message: { content: string }; finish_reason: string }[] }>)
		.then(async (res) => {
			console.log(res);
			const balance = await updateGuildUserBalance(env, msg.guild_id, msg.member?.user.id ?? '', -cost);
			await updateInteraction(env, msg.token, {
				embeds: [
					{
						description: res.choices[0].message.content,
						color: 0xee6002,
						footer: {
							text: `This message cost ${cost} coins. You now have ${balance.balance.toLocaleString()} coins.`,
						},
					},
				],
			});
		})
		.catch((err) => {
			console.error(err);
		});

	ctx.waitUntil(roastResult);

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
