// Puerta de entrada de Cloudflare Pages para /api/portal/*. La lógica vive en portal-api/.
import { manejar } from '../../../portal-api/router.js';

export const onRequest = ({ request, env }) => manejar(request, env);
