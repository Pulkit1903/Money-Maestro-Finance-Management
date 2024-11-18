import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import accounts from "./account";

export const runtime = 'edge'

export const app = new Hono().basePath('/api')

const routes = app
.route("/accounts", accounts); // expect route handler, not a db schema object

export const GET = handle(app);
export const POST = handle(app);

export type Apptype = typeof routes; //used while combining with react query 