import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException} from "hono/http-exception";
import accounts from "./account";

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.onError((err,c) => {
    if(err instanceof HTTPException){
        return err.getResponse();
    }
    return c.json({ error: "Internal Server Error" }, 500);
});

const routes = app
.route("/accounts", accounts); // expect route handler, not a db schema object

export const GET = handle(app);
export const POST = handle(app);

export type Apptype = typeof routes; //used while combining with react query 