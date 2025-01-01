"use strict";
//this file is only for writing shchemas after writing schema run npx drizzle-kit generate to generate the normal sql file 
// to migrate the changes npx drizzle-kit migrate ,to check npx drizzle-kit studio  
Object.defineProperty(exports, "__esModule", { value: true });
exports.posts = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    username: (0, pg_core_1.text)("username").notNull().unique(), // Added unique constraint
    email: (0, pg_core_1.text)("email").notNull().unique(),
    age: (0, pg_core_1.integer)("age").notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
});
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    imageurl: (0, pg_core_1.text)("image_url").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    authorId: (0, pg_core_1.integer)("authorId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
});
