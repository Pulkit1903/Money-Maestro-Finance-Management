import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello',
    clerkMiddleware(),
    (c) => {
        /**
         * Retrieves the authentication object using the provided context.
         *
         * @param c - The context used to obtain the authentication object. This context
         *            typically includes information such as user credentials, session data,
         *            or other relevant authentication details.
         * @returns The authentication object associated with the provided context.
         */
        const auth = getAuth(c);

        if (!auth?.userId) {
            return c.json({
                error: "Unauthorized",
            })
        }
        return c.json({
            message: 'Hello Next.js!',
        })
    })

export const GET = handle(app)
export const POST = handle(app)