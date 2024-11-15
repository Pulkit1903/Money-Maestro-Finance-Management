import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import accounts from "./account";
import transactions from './transactions';

export const runtime = 'edge';

export const app = new Hono().basePath('/api');

export const GET = handle(app);
export const POST = handle(app);

app.route("/account", accounts);
app.route("/transactions", transactions);

export type AppType = typeof app;