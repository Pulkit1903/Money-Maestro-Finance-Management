import { Hono } from "hono";
import { db } from "@/db/index";
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
} from "@/db/schema";


const app = new Hono()
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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId } = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30);

            const startDate = from
                ? parse(from, "yyyy-MM-dd", new Date())
                : defaultFrom;
            const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

            /**
             * Retrieves a list of transactions from the database with the specified filters and joins.
             *
             * The query selects the following fields:
             * - `id`: The transaction ID.
             * - `date`: The transaction date.
             * - `category`: The name of the category associated with the transaction.
             * - `categoryId`: The ID of the category associated with the transaction.
             * - `payee`: The payee of the transaction.
             * - `amount`: The amount of the transaction.
             * - `notes`: Any notes associated with the transaction.
             * - `account`: The name of the account associated with the transaction.
             * - `accountId`: The ID of the account associated with the transaction.
             *
             * The query joins the `transactions` table with the `accounts` table using an inner join on `accountId`,
             * and with the `categories` table using a left join on `categoryId`.
             *
             * The query filters the results based on the following conditions:
             * - If `accountId` is provided, it filters transactions by the specified `accountId`.
             * - Filters transactions by the user ID (`auth.userId`) associated with the account.
             * - Filters transactions with a date greater than or equal to `startDate`.
             * - Filters transactions with a date less than or equal to `endDate`.
             *
             * The results are ordered by the transaction date in descending order.
             *
             * @param {number} accountId - The ID of the account to filter transactions by (optional).
             * @param {string} auth.userId - The user ID to filter transactions by.
             * @param {Date} startDate - The start date to filter transactions from.
             * @param {Date} endDate - The end date to filter transactions to.
             * @returns {Promise<Array>} A promise that resolves to an array of transaction objects.
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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
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

            // This query selects specific fields from the 'transactions' table, including id, date, categoryId, payee, amount, notes, and accountId.
            // It performs an inner join with the 'accounts' table based on matching accountId fields in both tables.
            // The query filters the results to include only the transaction with the specified 'id' and where the 'userId' in the 'accounts' table matches the provided 'userId'.
            // The result is destructured to get the first (and presumably only) matching record.

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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
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

            // Define a common table expression (CTE) named "transactions_to_delete".
            // This CTE selects the `id` of transactions from the `transactions` table
            // that meet the following criteria:
            // 1. The transaction's `accountId` matches the `id` of an account in the `accounts` table.
            // 2. The transaction's `id` is included in the array `values.ids`.
            // 3. The `userId` of the account matches the authenticated user's `userId`.
            // The resulting set of transaction IDs will be stored in the `transactionsToDelete` constant.
            const transactionsToDelete = db.$with("transactions_to_delete").as(
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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
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
        clerkMiddleware({
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        }),
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

            /**
             * Generates a subquery to select transactions that are eligible for deletion.
             * 
             * This subquery, named "transactions_to_delete", selects the `id` of transactions
             * from the `transactions` table that meet the following criteria:
             * - The transaction's `id` matches the provided `id`.
             * - The transaction's associated account's `userId` matches the authenticated user's `userId`.
             * 
             * The subquery performs an inner join between the `transactions` and `accounts` tables
             * based on the `accountId` of the transaction and the `id` of the account.
             * 
             * @param transactions - The transactions table reference.
             * @param accounts - The accounts table reference.
             * @param id - The ID of the transaction to be deleted.
             * @param auth - The authentication object containing the user's ID.
             * @returns A subquery that selects the IDs of transactions eligible for deletion.
             */
            const transactionsToDelete = db.$with("tranasactions_to_delete").as(
                db
                    .select({
                        id: transactions.id,
                    })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
            );

            // This query deletes transactions from the 'transactions' table.
            // 1. It starts by specifying the 'transactionsToDelete' table using the 'with' clause.
            // 2. The 'delete' method is called on the 'transactions' table.
            // 3. The 'where' clause specifies the condition for deletion:
            //    - It uses the 'inArray' function to check if the 'id' of the transactions is in the list of IDs.
            //    - The list of IDs is obtained from a subquery that selects 'id' from the 'transactionsToDelete' table.
            // 4. The 'returning' method specifies that the query should return the 'id' of the deleted transactions
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

export default app;