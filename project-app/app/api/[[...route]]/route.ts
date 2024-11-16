import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException} from "hono/http-exception";
import accounts from "./account";
import transactions from './transactions';

export const runtime = 'edge';

export const app = new Hono().basePath('/api');

export const GET = handle(app);
export const POST = handle(app);

app.route("/account", accounts);
app.route("/transactions", transactions);

export type AppType = typeof app;
=======
app.onError((err,c) => {
    if(err instanceof HTTPException){
        return err.getResponse();
    }
    return c.json({ error: "Internal Server Error" }, 500);
});