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
import { cors } from 'hono/cors';
import { TODO_QUERIES } from './db/queries';
import { ApiError, ErrorCodes, createErrorResponse } from './utils/errors';
import type { Context } from 'hono';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../../frontend/src/lib/types/todo';

// D1の型
interface Env {
	DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// CORSを許可
app.use('*', cors());

// Error handling middleware
app.onError((err, c) => {
	if (err instanceof ApiError) {
		return c.json(createErrorResponse(err), err.statusCode as 400 | 404 | 500);
	}
	console.error('Unhandled error:', err);
	return c.json(
		createErrorResponse(new ApiError('Internal server error', 500, 'INTERNAL_ERROR')),
		500 as 500
	);
});

// 一覧取得
app.get('/todos', async (c) => {
	try {
		const { results } = await c.env.DB.prepare(TODO_QUERIES.GET_ALL).all<Todo>();
		return c.json({ data: results });
	} catch (error) {
		throw new ApiError('Failed to fetch todos', 500, ErrorCodes.DATABASE_ERROR);
	}
});

// 追加
app.post('/todos', async (c) => {
	try {
		const input = await c.req.json<CreateTodoInput>();
		if (!input.text?.trim()) {
			throw new ApiError('Text is required', 400, ErrorCodes.VALIDATION_ERROR);
		}

		const result = await c.env.DB.prepare(TODO_QUERIES.CREATE)
			.bind(input.text.trim())
			.run();

		if (!result.success) {
			throw new ApiError('Failed to create todo', 500, ErrorCodes.DATABASE_ERROR);
		}

		const todo = await c.env.DB.prepare(TODO_QUERIES.GET_BY_ID)
			.bind(result.meta.last_row_id)
			.first<Todo>();

		return c.json({ data: todo });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new ApiError('Invalid request', 400, ErrorCodes.VALIDATION_ERROR);
	}
});

// 完了切替
app.put('/todos/:id', async (c) => {
	try {
		const id = Number(c.req.param('id'));
		if (isNaN(id)) {
			throw new ApiError('Invalid ID', 400, ErrorCodes.VALIDATION_ERROR);
		}

		const input = await c.req.json<UpdateTodoInput>();
		if (typeof input.completed !== 'boolean') {
			throw new ApiError('Completed status is required', 400, ErrorCodes.VALIDATION_ERROR);
		}

		await c.env.DB.prepare(TODO_QUERIES.UPDATE_COMPLETED)
			.bind(input.completed ? 1 : 0, id)
			.run();

		const todo = await c.env.DB.prepare(TODO_QUERIES.GET_BY_ID)
			.bind(id)
			.first<Todo>();

		if (!todo) {
			throw new ApiError('Todo not found', 404, ErrorCodes.NOT_FOUND);
		}

		return c.json({ data: todo });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new ApiError('Invalid request', 400, ErrorCodes.VALIDATION_ERROR);
	}
});

// 削除
app.delete('/todos/:id', async (c) => {
	try {
		const id = Number(c.req.param('id'));
		if (isNaN(id)) {
			throw new ApiError('Invalid ID', 400, ErrorCodes.VALIDATION_ERROR);
		}

		const result = await c.env.DB.prepare(TODO_QUERIES.DELETE)
			.bind(id)
			.run();

		if (!result.success) {
			throw new ApiError('Failed to delete todo', 500, ErrorCodes.DATABASE_ERROR);
		}

		return c.json({ data: { id } });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new ApiError('Invalid request', 400, ErrorCodes.VALIDATION_ERROR);
	}
});

export default app;
