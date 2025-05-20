/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';

// D1の型
interface Env {
	DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// CORSを許可
app.use('*', cors());

// 一覧取得
app.get('/todos', async (c) => {
	const { results } = await c.env.DB.prepare('SELECT * FROM todos ORDER BY id DESC').all();
	return c.json(results);
});

// 追加
app.post('/todos', async (c) => {
	const { text } = await c.req.json();
	if (!text || typeof text !== 'string') {
		return c.json({ error: 'text is required' }, 400);
	}
	const result = await c.env.DB.prepare('INSERT INTO todos (text, completed) VALUES (?, 0)').bind(text).run();
	if (!result.success) return c.json({ error: 'insert failed' }, 500);
	const todo = await c.env.DB.prepare('SELECT * FROM todos WHERE id = ?').bind(result.meta.last_row_id).first();
	return c.json(todo);
});

// 完了切替
app.put('/todos/:id', async (c) => {
	const id = Number(c.req.param('id'));
	const { completed } = await c.req.json();
	if (typeof completed !== 'boolean') return c.json({ error: 'completed is required' }, 400);
	await c.env.DB.prepare('UPDATE todos SET completed = ? WHERE id = ?').bind(completed ? 1 : 0, id).run();
	const todo = await c.env.DB.prepare('SELECT * FROM todos WHERE id = ?').bind(id).first();
	return c.json(todo);
});

// 削除
app.delete('/todos/:id', async (c) => {
	const id = Number(c.req.param('id'));
	await c.env.DB.prepare('DELETE FROM todos WHERE id = ?').bind(id).run();
	return c.json({ id });
});

export default app;
