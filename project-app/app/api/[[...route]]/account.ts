import { Hono } from "hono";
import { db } from "@/app/db/index";
import { accounts } from "@/app/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException} from "hono/http-exception";
import { error } from "console";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),

        async (c) => {
            const auth = getAuth(c);
            if(!auth?.userId){
                throw new HTTPException(401, {
                    res: c.json({ error: "Unauthorized" }, 401),
                });
            }

            const data = await db
                .select({
                    id: accounts.id,
                    name: accounts.name,
                })
                .from(accounts);
        
        return c.json({ data });  // Return the actual queried data
    });

export default app;
