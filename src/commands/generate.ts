export const GenerateConfig = {
	name: 'generate',
	description: 'Generates autocomplete from prompt',
	type: 1,
	options: [
		{
			name: 'prompt',
			description: 'The prompt to generate autocomplete from',
			type: 3,
			required: true,
		},
	],
};

export async function generate(prompt: string, apiKey: string, appId: string, messageToken: string) {
	const generateUrl = 'https://api.openai.com/v1/images/generations';
	const interactionUrl = `https://discord.com/api/v8/interactions/${appId}/${messageToken}/callback`;

	const response = (await fetch(generateUrl, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			prompt,
			n: 1,
			size: '512x512',
		}),
	}).then((res) => res.json())) as {
		created: number;
		data: {
			url: string;
		}[];
	};

	console.log(response);

	if (response.data.length > 0) {
		return fetch(interactionUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 4,
				data: {
					content: response.data[0].url,
				},
			}),
		});
	}

	return new Response(
		JSON.stringify({
			type: 4,
			data: {
				content: 'Error generating image...',
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
