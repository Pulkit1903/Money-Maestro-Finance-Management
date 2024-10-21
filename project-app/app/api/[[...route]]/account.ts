import { Hono } from "hono";
import { db } from "@/app/db/index";
import { accounts, insertAccount } from "@/app/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq } from "drizzle-orm";
 import { zValidator } from "@hono/zod-validator";

// Create an instance of Hono
const app = new Hono();

// Apply the Clerk middleware
app.use('*', clerkMiddleware({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
}));

// Define the GET route
app.get("/", async (c) => {
    const auth = getAuth(c); // Get the auth object from the context

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db.select({
        id: accounts.id,
        name: accounts.name,
    }).from(accounts)
        .where(eq(accounts.userId, auth.userId)); // Use the userId from the auth object

    return c.json({ data });
});

// Define the POST route
app.post(
    "/",
    clerkMiddleware(),
    zValidator(
        "json",
        insertAccount.pick({
            name: true,
        })
    ),
    async (c) => {
        const auth = getAuth(c);
        const values = c.req.valid("json");

        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const [data] = await db
            .insert(accounts)
            .values({
                userId: auth.userId,
                ...values,
            })
            .returning();

        return c.json({ data });
    }
)
export default app;

