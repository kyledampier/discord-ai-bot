import { Router } from 'itty-router';
import {
	getQuestion,
	addQuestion,
	registerCommands,
	deleteCommand,
} from './routes';

const router = Router();

// TODO: Add API Key authentication middleware

router.get('/api/question', (request, env, ctx) => getQuestion(request, env));
router.post('/api/question', (request, env, ctx) => addQuestion(request, env, ctx));

// API route to register commands with Discord
router.get('/api/register/:command', ({ params }, env, ctx) => registerCommands(params.command, env));
router.delete('/api/register/:command', ({ params }, env, ctx) => deleteCommand(params.command, env));

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
