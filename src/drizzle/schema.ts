//this file is only for writing shchemas after writing schema run npx drizzle-kit generate to generate the normal sql file 
// to migrate the changes npx drizzle-kit migrate ,to check npx drizzle-kit studio  

import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey().notNull(),
    username: text("username").notNull().unique(), // Added unique constraint
    email:text("email").notNull().unique(),
    age: integer("age").notNull(),
    password: text("password").notNull(),
   
});

export const posts = pgTable("posts", {
    id: serial("id").primaryKey().notNull(),
    title: text("title").notNull(),
    imageurl: text("image_url").notNull(),
    content: text("content").notNull(),
    authorId: integer("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
