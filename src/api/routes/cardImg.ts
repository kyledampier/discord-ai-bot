export async function getCardImage(card: string, env: Env, ctx: ExecutionContext) {
	const cardObject = await env.FILES.get(`cards/${card}.png`);
	if (!cardObject) {
		return new Response('Not Found.', { status: 404 });
	}

	const headers = new Headers();
	headers.set('Content-Type', 'image/png');
	headers.set('etag', cardObject.etag);
	headers.set('cache-control', 'public, max-age=31536000, immutable');

	return new Response(cardObject.body, {
		headers,
	});
}
