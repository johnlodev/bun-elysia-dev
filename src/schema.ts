import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

    export const todos = sqliteTable('todos', {
      id: integer('id').primaryKey({ autoIncrement: true }),
      content: text('content').notNull(),
      completed: integer('completed', { mode: 'boolean' }).default(false),
      createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    });