import { db } from "@/db";
import { transactions,accounts, categories} from "@/db/schema";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";
import { clerkMiddleware , getAuth} from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { subDays, differenceInDays } from "date-fns";
import { parseISO } from "date-fns/fp";
import { and, sql, sum, eq, gte, lte,lt, desc} from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
const app = new Hono()
    .get("/",
        clerkMiddleware(),
        zValidator(
            "query",
            z.object({
                from: z.string().optional(),
                to: z.string().optional(),
                accountId: z.string().optional()
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const {from, to, accountId} = c.req.valid("query");
            
            if(!auth){
                return c.json({error: "Unauthorized"},401)
            }
            
            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30);
            
            const startDate = from 
                ? parseISO(from) 
                :defaultFrom;
            const endDate = to 
                ? parseISO(to) 
                : defaultTo;
            
            const periodLength = differenceInDays(endDate, startDate)+1;
            const lastPeriodStart = subDays(startDate, periodLength);
            const lastPeriodEnd = subDays(endDate, periodLength);
            
            async function fetchFinancialDate(
                userId: string, 
                startDate: Date, 
                endDate: Date){
                    return await db
                    .select({
                        income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                        expenses: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                        remaining: sum(transactions.amount).mapWith(Number),
                    })
                    .from(transactions)
                    .innerJoin(accounts, 
                        eq(
                            transactions.accountId, 
                            accounts.id
                        ),
                    )
                    .where(
                        and(
                            accountId ? eq(transactions.accountId,accountId): undefined,
                            eq(accounts.userId, userId),
                            gte(transactions.date, startDate),
                            lte(transactions.date, endDate),
                        )
                    )
                }
            if (!auth.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [currentPeriod] = await fetchFinancialDate(
                auth.userId,
                startDate,
                endDate,
            );
            const [lastPeriod] = await fetchFinancialDate(
                auth.userId,
                lastPeriodStart,
                lastPeriodEnd,
            );

            const incomeChange = calculatePercentageChange(
                currentPeriod.income,
                lastPeriod.income
            )
            const expensesChange = calculatePercentageChange(
                currentPeriod.expenses,
                lastPeriod.expenses
            )
            const remainingchange = calculatePercentageChange(
                currentPeriod.remaining,
                lastPeriod.remaining
            )
            const category = await db
            .select({
                name: categories.name,
                value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
            })
            .from(transactions)
            .innerJoin(accounts,
                eq(
                    transactions.accountId,
                    accounts.id
                ),
            )
            .innerJoin(
                categories,
                eq(
                    transactions.categoryId, 
                    categories.id
                ),
            )
            .where(
                and(
                    accountId ? eq(transactions.accountId,accountId): undefined,
                    eq(accounts.userId, auth.userId),
                    lt(transactions.amount, 0),
                    gte(transactions.date, startDate),
                    lte(transactions.date, endDate),
                )
            )
            .groupBy(categories.name)
            .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));
            
            const topCategories = category.slice(0,3);
            const otherCategories = category.slice(3);
            const otherSum = otherCategories.reduce((sum,current) => sum + current.value, 0)
            
            const finalCategories =topCategories;
            if(otherCategories.length >0){
                finalCategories.push({
                    name: "Others",
                    value: otherSum,
                });
            }

            const activeDays = await db
            .select({
                date : transactions.date,
                income : sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                expenses : sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount} ELSE 0 END)`.mapWith(Number),

            })
            .from(transactions)
            .innerJoin(accounts,
                eq(
                    transactions.accountId,
                    accounts.id
                ),
            )
            .where(
                and(
                    accountId ? 
                        eq(transactions.accountId,accountId): 
                        undefined,
                    eq(accounts.userId, auth.userId), 
                    gte(transactions.date, startDate),
                    lte(transactions.date, endDate),
                )
            )
            .groupBy(transactions.date)
            .orderBy(transactions.date);
            const days = fillMissingDays(
                activeDays,
                startDate,
                endDate)
            return c.json({
                data: {
                    remainingAmount: currentPeriod.remaining,
                    remainingchange,
                    incomeAmount : currentPeriod.income,
                    incomeChange,
                    expensesAmount: currentPeriod.expenses,
                    expensesChange,
                    categories: finalCategories,
                    days,
                },
            });    
        }
    )
export default app;
