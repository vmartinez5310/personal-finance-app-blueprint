import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('finance_records', {
 owner: text('owner').notNull(), collection: text('collection').notNull(), id: text('id').notNull(), body: text('body').notNull(),
}, t => [primaryKey({ columns: [t.owner,t.collection,t.id] })]);
