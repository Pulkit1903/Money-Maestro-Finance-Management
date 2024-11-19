import { Hono } from "hono";
import { db } from "@/app/db/index";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { subDays, parse } from "date-fns";

import {
    transactions,
    insertTransactionSchema,
    categories,
    accounts,
} from "@/app/db/schema";

const app = new Hono();

app.use('*', clerkMiddleware({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
}));

app.get("/", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    // Your logic here
    app
    .get(
        "/",
        zValidator(
            "query",
            z.object({
                from: z.string().optional(),
                to: z.string().optional(),
                accountId: z.string().optional(),
            })
        ),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId } = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30);

            const startDate = from
                ? parse(from)
                : defaultFrom;
            const endDate = to ? parse(to) : defaultTo;

            /**
             * Fetches transaction data from the database with specified filters and joins.
             *
             * @param {Object} db - The database connection object.
             * @param {Object} transactions - The transactions table reference.
             * @param {Object} accounts - The accounts table reference.
             * @param {Object} categories - The categories table reference.
             * @param {Function} eq - The equality comparison function for SQL queries.
             * @param {Function} and - The logical AND function for SQL queries.
             * @param {Function} gte - The greater than or equal comparison function for SQL queries.
             * @param {Function} lte - The less than or equal comparison function for SQL queries.
             * @param {Function} desc - The descending order function for SQL queries.
             * @param {string} accountId - The account ID to filter transactions by.
             * @param {string} auth.userId - The user ID to filter transactions by.
             * @param {Date} startDate - The start date to filter transactions by.
             * @param {Date} endDate - The end date to filter transactions by.
             * @returns {Promise<Object[]>} A promise that resolves to an array of transaction objects.
             */
            const data = await db
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    category: categories.name,
                    categoryId: transactions.categoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    account: accounts.name,
                    accountId: transactions.accountId,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .leftJoin(categories, eq(transactions.categoryId, categories.id))
                .where(
                    and(
                        accountId ? eq(transactions.accountId, accounts) : undefined,
                        eq(accounts.userId, auth.userId),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate)
                    )
                )
                .orderBy(desc(transactions.date));
            return c.json({ data });
        }
    )
    .get(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                c.json({ error: "Unauthorized" }, 401);
            }

            const userId = auth?.userId as string;

            const [data] = await db
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    categoryId: transactions.categoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    accountId: transactions.accountId,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(eq(transactions.id, id), eq(accounts.userId, userId)));

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator(
            "json",
            insertTransactionSchema.omit({
                id: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .insert(transactions)
                .values({
                    id: createId(),
                    ...values,
                })
                .returning();

            return c.json({ data });
        }
    )
    .post(
        "/bulk-create",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                transactions: z.array(insertTransactionSchema.omit({ id: true })),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const data = await db
                .insert(transactions)
                .values(
                    values.transactions.map((value) => ({
                        id: createId(),
                        ...value,
                    }))
                )
                .returning()

            return c.json({ data })

        }
    )
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                ids: z.array(z.string()),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const transactionsToDelete = db.$with("tranasactions_to_delete").as(
                db
                    .select({
                        id: transactions.id,
                    })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(
                        and(
                            inArray(transactions.id, values.ids),
                            eq(accounts.userId, auth.userId)
                        )
                    )
            );

            const data = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(
                        transactions.id,
                        sql`(select id from ${transactionsToDelete})`
                    )
                )
                .returning({
                    id: transactions.id,
                });

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            })
        ),
        zValidator(
            "json",
            insertTransactionSchema.omit({
                id: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const transactionsToUpdate = db.$with("tranasactions_to_update").as(
                db
                    .select({
                        id: transactions.id,
                    })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
            );

            const [data] = await db
                .with(transactionsToUpdate)
                .update(transactions)
                .set(values)
                .where(
                    inArray(
                        transactions.id,
                        sql`(select id from ${transactionsToUpdate})`
                    )
                )
                .returning();

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const transactionsToDelete = db.$with("tranasactions_to_delete").as(
                db
                    .select({
                        id: transactions.id,
                    })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
            );


            const [data] = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(
                        transactions.id,
                        sql`(select id from ${transactionsToDelete})`
                    )
                )
                .returning({
                    id: transactions.id,
                });

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    );

    return c.json({ message: "Transactions endpoint" });
});

export default app;