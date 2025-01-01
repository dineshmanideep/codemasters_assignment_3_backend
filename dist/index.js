"use strict";
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
const db_1 = require("./drizzle/db");
require("./drizzle/authmiddleware");
const db_2 = require("./drizzle/db");
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require("express-session");
const passport = require("passport");
const Local = require('passport-local').Strategy;
const app = express();
const port = 3000;
app.use(express.json());
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [];
app.use(cors({
    origin: (origin, callback) => {
        callback(null, origin || '*');
    },
    credentials: true,
}));
//middleware for passport
app.use(session({ secret: "cats",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false
    },
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
const Startfxn = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.client.connect();
});
app.post("/signup", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("signup api hit :", req.body);
    try {
        const result = yield (0, db_1.createUser)(req.body);
        console.log("result:", result);
        console.log("user created");
        res.status(200).send({ success: true, message: "user created" });
    }
    catch (err) {
        console.log("err :", err);
        next(err);
    }
}));
app.post("/login", passport.authenticate("local"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("user was authenticated");
    res.status(200).send({ success: true, message: "user was authenticated" });
}));
app.get("/", (req, res) => {
    console.log("received request");
    if (req.user) {
        console.log(req.user);
        res.status(200).send({ success: true, message: "user is logged in", user: req.user });
    }
    else {
        console.log("not logged in");
        res.status(401).send({ success: true, message: "not logged in" });
    }
});
app.post("/createblog", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Request body:", req.body);
        // Create a new post using the `createPost` function
        const data = yield (0, db_1.createPost)(Object.assign(Object.assign({}, req.body), { authorId: req.user.id }));
        console.log("Created Post:", data);
        // Respond with the created post
        res.status(200).send({ success: true, post: data });
    }
    catch (err) { // Correct way to annotate the error type
        if (err instanceof Error) {
            console.log("Error:", err.message);
        }
        else {
            console.log("An unknown error occurred");
        }
        res.status(500).send({ success: false, message: "An error occurred" });
    }
}));
app.get("/blogs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, db_1.getPosts)();
    console.log(data);
    res.status(200).send(data);
}));
app.get("/blog/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const data = yield (0, db_1.getPost)(Number(id));
        res.status(200).send(data);
    }
    catch (error) {
        res.status(404).send({ message: "Post not found" });
    }
}));
app.put("/blog/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, content, imageurl } = req.body;
    try {
        if (!req.user) {
            return res.status(401).send({ success: false, message: "User is not authenticated" });
        }
        const loggedInUserId = req.user.id; // Adjust the type based on your user object structure
        // Fetch the blog post to verify ownership
        const post = yield (0, db_1.getPost)(Number(id));
        if (!post) {
            return res.status(404).send({ success: false, message: "Post not found" });
        }
        if (post.authorId !== loggedInUserId) {
            return res.status(403).send({ success: false, message: "User is not authorized to update this post" });
        }
        // Update the post
        const updatedPost = yield (0, db_2.updatePost)(Number(id), { title, content, imageurl });
        res.status(200).send({ success: true, message: "Post updated successfully", post: updatedPost });
    }
    catch (err) { // Correct way to annotate the error type
        if (err instanceof Error) {
            console.log("Error:", err.message);
        }
        else {
            console.log("An unknown error occurred");
        }
        res.status(500).send({ success: false, message: "Failed to update post" });
    }
}));
app.get("/logout", (req, res) => {
    try {
        if (!req.user) {
            res.status(401).send({ success: false, message: "user was not authenticated" });
        }
        req.logout((err) => {
            if (err) {
                return res.status(500).send({ success: false, message: "Logout failed" });
            }
            res.status(200).send({ success: true, message: "User was logged out" });
        });
    }
    catch (err) {
        console.log(err);
    }
});
// Startfxn();
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
