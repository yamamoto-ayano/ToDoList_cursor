import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert; 