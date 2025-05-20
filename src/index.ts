import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDrizzleClient } from './db/client';
import { todos, Todo, NewTodo } from './db/schema';

// D1の型
interface Env {
	DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

// 一覧取得
app.get('/todos', async (c) => {
  const db = getDrizzleClient(c.env.DB);
  const all = await db.select().from(todos).orderBy(todos.id.desc());
  return c.json(all);
});

// 追加
app.post('/todos', async (c) => {
  const { text } = await c.req.json();
  if (!text || typeof text !== 'string') {
    return c.json({ error: 'text is required' }, 400);
  }
  const db = getDrizzleClient(c.env.DB);
  const inserted = await db.insert(todos).values({ text, completed: false }).returning();
  return c.json(inserted[0]);
});

// 完了切替
app.put('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const { completed } = await c.req.json();
  if (typeof completed !== 'boolean') return c.json({ error: 'completed is required' }, 400);
  const db = getDrizzleClient(c.env.DB);
  await db.update(todos).set({ completed }).where(todos.id.eq(id));
  const todo = await db.select().from(todos).where(todos.id.eq(id));
  return c.json(todo[0]);
});

// 削除
app.delete('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const db = getDrizzleClient(c.env.DB);
  await db.delete(todos).where(todos.id.eq(id));
  return c.json({ id });
});

export default app; 