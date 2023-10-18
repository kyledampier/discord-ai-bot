import { Router } from 'itty-router';
import { getQuestion, addQuestion, registerCommands, deleteCommand, deleteQuestion, search } from './routes';
import { withParams } from 'itty-router';
import getDb from '../utils/db';
import { api_key } from '../schema';
import { request } from 'http';
import { eq } from 'drizzle-orm';

const router = Router();

const withAPIKey = async (request: Request, env: Env, ctx: ExecutionContext) => {
	const apiKey = request.headers.get('X-API-Key');
	if (!apiKey) {
		return new Response('No API Key provided.', { status: 401 });
	}

	const db = getDb(env);
	const key = await db.select().from(api_key).where(eq(api_key.key, apiKey));

	if (!key || !key.length || !key[0].enabled) {
		return new Response('Invalid API Key.', { status: 401 });
	}

	console.log('API Key authenticated.', key[0].id);
};

// TODO: Add API Key authentication middleware

// API routes for questions
router.get('/api/question', withAPIKey, (request, env, ctx) => getQuestion(request, env));
router.post('/api/question', withAPIKey, (request, env, ctx) => addQuestion(request, env, ctx));
router.delete('/api/question/:id', withAPIKey, withParams, ({ params }, env, ctx) => deleteQuestion(params.id, env));
router.get('/api/search', withAPIKey, withParams, (request, env, ctx) => search(request, env, ctx));

// API route to register commands with Discord
router.get('/api/register/:command', withAPIKey, withParams, ({ params }, env, ctx) => registerCommands(params.command, env));
router.delete('/api/register/:command', withAPIKey, withParams, ({ params }, env, ctx) => deleteCommand(params.command, env));

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
