import { Router } from 'itty-router';
import { question } from './routes';
import registerCommands from './routes/registerCommands';

const router = Router();

// TODO: Add API Key authentication middleware

router.get('/api/question', (request, env, ctx) => question(request, env));
router.post('/api/question', (request, env, ctx) => question(request, env));

// API route to register commands with Discord
router.get('/api/register/:command', ({ params }, env, ctx) => registerCommands(params.command, env));

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
