import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const userState=sqliteTable('user_state',{
 userId:text('user_id').notNull(),key:text('state_key').notNull(),value:text('value_json').notNull(),revision:integer('revision').notNull().default(1),updatedAt:text('updated_at').notNull()
},t=>[primaryKey({columns:[t.userId,t.key]})]);
