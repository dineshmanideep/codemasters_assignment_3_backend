"use strict";
// to write function to connect database to project
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.getPost = exports.getPosts = exports.createPost = exports.createUser = exports.db = exports.client = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema = __importStar(require("./schema"));
const drizzle_orm_1 = require("drizzle-orm");
require("dotenv").config();
const DATABASE = process.env.DATABASE_URL;
const bcrypt = require("bcrypt");
exports.client = new pg_1.Client({
    connectionString: DATABASE,
});
exports.client.connect()
    .then(() => console.log('Connected to Neon DB'))
    .catch((err) => console.error('Connection error', err.stack));
exports.db = (0, node_postgres_1.drizzle)(exports.client, { schema, logger: true });
const createUser = (newUser) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("creating user::", newUser);
    const saltRounds = 10;
    newUser.password = yield bcrypt.hash(newUser.password, saltRounds);
    const [createdUser] = yield exports.db.insert(schema.users).values(newUser).returning();
    if (!createdUser) {
        throw new Error("User not created");
    }
    ;
    return createdUser;
});
exports.createUser = createUser;
const truncateContent = (content, maxLength) => content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
// Create a new post
const createPost = (newPost) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("creating post::", newPost);
    console.log("Creating post:", newPost);
    const [createdPost] = yield exports.db.insert(schema.posts).values(newPost).returning();
    if (!createdPost)
        throw new Error("Post not created");
    return createdPost;
});
exports.createPost = createPost;
// Get all posts with truncated content and authorName (JOIN with users)
const getPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield exports.db
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
        .leftJoin(schema.users, (0, drizzle_orm_1.eq)(schema.posts.authorId, schema.users.id)); // Join posts with users
    return rows.map((post) => (Object.assign(Object.assign({}, post), { content: truncateContent(post.content, 50) })));
});
exports.getPosts = getPosts;
// Get a single post by ID
const getPost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [post] = yield exports.db
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
        .leftJoin(schema.users, (0, drizzle_orm_1.eq)(schema.posts.authorId, schema.users.id)) // Join posts with users
        .where((0, drizzle_orm_1.eq)(schema.posts.id, id));
    if (!post)
        throw new Error(`Post with ID ${id} not found`);
    return post;
});
exports.getPost = getPost;
const updatePost = (id_1, _a) => __awaiter(void 0, [id_1, _a], void 0, function* (id, { title, content, imageurl }) {
    console.log(`Updating post with ID: ${id}`);
    const [updatedPost] = yield exports.db
        .update(schema.posts)
        .set({ title, content, imageurl }) // Update only these fields
        .where((0, drizzle_orm_1.eq)(schema.posts.id, id)) // Match the post by ID
        .returning(); // Return the updated post details
    if (!updatedPost) {
        throw new Error(`Post with ID ${id} not found`);
    }
    console.log("Post updated successfully:", updatedPost);
    return updatedPost;
});
exports.updatePost = updatePost;
