import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import accounts from './account';
import transactions from './transactions'; // Import the transactions route handler

export const runtime = 'edge';

export const app = new Hono().basePath('/api');

const routes = app
  .route('/accounts', accounts) // Attach accounts route
  .route('/transactions', transactions); // Attach transactions route

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes; // Extend AppType to include all routes
