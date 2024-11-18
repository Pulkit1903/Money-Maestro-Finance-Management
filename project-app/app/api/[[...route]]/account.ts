import { Hono } from "hono";
import { db } from "@/app/db/index";
import {createId} from "@paralleldrive/cuid2";
import { accounts, insertAccount } from "@/app/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator"; // Replace with the actual library name
import { eq } from "drizzle-orm";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),

        async (c) => {
            const auth = getAuth(c);
            if(!auth?.userId){
                return c.json({error:"Unauthorized"},401);
                }

            const data = await db
                .select({
                    id: accounts.id,
                    name: accounts.name,
                })
                .from(accounts)
                .where(eq(accounts.userId, auth.userId));
        
        return c.json({ data });  // Return the actual queried data
    })
    .post(
        "/",
        clerkMiddleware(), 
        zValidator("json",insertAccount.pick({
            name: true
        })),
        async (c) => {
            const auth = getAuth(c);
            const value = c.req.valid("json");
            if(!auth?.userId){
                return c.json({error:"Unauthorized"},401);
            }
            const [data] = await db.insert(accounts).values({
                id: createId(),
                userId: auth.userId,
                ...value,
            }).returning();
            return c.json({data});
        })

export default app;
