import { Router } from 'itty-router';
import { question } from './routes';

const router = Router();

router.get('/api/question', (request, env, ctx) => question(request, env));
router.post('/api/question', (request, env, ctx) => question(request, env));

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
