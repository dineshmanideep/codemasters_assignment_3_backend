// to write function to connect database to project

import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema"
import { eq } from "drizzle-orm";

require("dotenv").config()
const DATABASE = process.env.DATABASE_URL

const bcrypt = require("bcrypt");



export const client = new Client({
    connectionString: DATABASE,
    
});

client.connect()
    .then(() => console.log('Connected to Neon DB'))
    .catch((err) => console.error('Connection error', err.stack));

export const db = drizzle(client, { schema, logger: true });


export const createUser = async (newUser: schema.NewUser): Promise<schema.User> => {
    console.log("creating user::", newUser);

    const saltRounds = 10;
    newUser.password = await bcrypt.hash(newUser.password, saltRounds);

    const [createdUser] = await db.insert(schema.users).values(newUser).returning();

    if (!createdUser) { throw new Error("User not created") };

    return createdUser
};

const truncateContent = (content: string, maxLength: number): string =>
    content.length > maxLength ? content.substring(0, maxLength) + "..." : content;

// Create a new post
export const createPost = async (newPost: schema.NewPost): Promise<schema.Post> => {
    console.log("creating post::", newPost);
    console.log("Creating post:", newPost);
    const [createdPost] = await db.insert(schema.posts).values(newPost).returning();
    if (!createdPost) throw new Error("Post not created");
    return createdPost;
};

// Get all posts with truncated content and authorName (JOIN with users)
export const getPosts = async (): Promise<Array<schema.Post & { authorName: string|null }>> => {
    const rows = await db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            content: schema.posts.content,
            imageurl: schema.posts.imageurl,
            createdAt: schema.posts.createdAt,
            updatedAt: schema.posts.updatedAt,
            authorName: schema.users.username,
            authorId: schema.posts.authorId // Get username via join
        })
        .from(schema.posts)
        .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id)); // Join posts with users

    return rows.map((post) => ({
        ...post,
        content: truncateContent(post.content, 50), // Truncate content
    }));
};

// Get a single post by ID
export const getPost = async (id: number): Promise<schema.Post & { authorName: string | null }> => {
    const [post] = await db
        .select({
            id: schema.posts.id,
            title: schema.posts.title,
            content: schema.posts.content,
            imageurl: schema.posts.imageurl,
            createdAt: schema.posts.createdAt,
            updatedAt: schema.posts.updatedAt,
            authorName: schema.users.username,
            authorId: schema.posts.authorId // Get username via join
        })
        .from(schema.posts)
        .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id)) // Join posts with users
        .where(eq(schema.posts.id, id));

    if (!post) throw new Error(`Post with ID ${id} not found`);
    return post;
};


export const updatePost = async (
    id: number,
    { title, content, imageurl }: { title: string; content: string; imageurl: string }
): Promise<schema.Post> => {
    console.log(`Updating post with ID: ${id}`);

    const [updatedPost] = await db
        .update(schema.posts)
        .set({ title, content, imageurl }) // Update only these fields
        .where(eq(schema.posts.id, id)) // Match the post by ID
        .returning(); // Return the updated post details

    if (!updatedPost) {
        throw new Error(`Post with ID ${id} not found`);
    }

    console.log("Post updated successfully:", updatedPost);
    return updatedPost;
};