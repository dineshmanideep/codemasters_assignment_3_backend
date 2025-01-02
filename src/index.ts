
import { client, createUser,createPost, getPost, getPosts } from "./drizzle/db"
import "./drizzle/authmiddleware"
import { updatePost } from "./drizzle/db";
import { Request, Response } from 'express';
require('dotenv').config();

const express = require('express')
const cors = require('cors')
const session = require("express-session");
const passport = require("passport");
const Local = require('passport-local').Strategy;

const app = express()
const port = 3000

app.use(express.json())


app.use(
    cors({
      origin:"https://codemasters-assignment-3-frontend.vercel.app",
      credentials: true, 
    })
  );

//middleware for passport
app.use(session({ secret: "cats",
     resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure:true,
        sameSite: 'none' 
    
    },
    }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));


const Startfxn= async()=>{
    await client.connect();
}


app.post ("/signup", async (req:Request, res:Response, next:Function) => {
    console.log("signup api hit :",req.body);
    try {
        const result= await createUser(req.body);
        console.log("result:",result);
        console.log("user created");
        res.status(200).send({success:true,message:"user created"});
    } catch (err) {
        console.log("err :", err);
        next(err);
    }
})

app.post("/login",passport.authenticate("local"), async (req:Request, res:Response, next:Function) => {
    console.log("user was authenticated");
    res.status(200).send({success:true,message:"user was authenticated"});
    
})

app.get("/", (req:Request, res:Response) => {
    console.log("received request")
    if(req.user){
        console.log(req.user)

        res.status(200).send({success:true,message:"user is logged in",user:req.user})
    }
    else{
        console.log("not logged in")
        res.status(401).send({success:true,message:"not logged in"})
    }
})

app.post("/createblog", async (req: Request, res: Response) => {
    try {
      console.log("Request body:", req.body);
  
      // Create a new post using the `createPost` function
        const data = await createPost({...req.body, authorId: req.user.id});
  
      console.log("Created Post:", data);
  
      // Respond with the created post
      res.status(200).send({ success: true, post: data });
    } catch (err: unknown) {  // Correct way to annotate the error type
        if (err instanceof Error) {
          console.log("Error:", err.message);
        } else {
          console.log("An unknown error occurred");
        }
        res.status(500).send({ success: false, message: "An error occurred" });
      }
  });

app.get("/blogs", async(req:Request, res:Response) => {  
   
        const data=await getPosts();
        console.log(data)
        res.status(200).send(data);
    })

    app.get("/blog/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const data = await getPost(Number(id));
            res.status(200).send(data);
        } catch (error) {
            res.status(404).send({ message: "Post not found" });
        }
    });



    app.put("/blog/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, content, imageurl } = req.body;
    
        try {
            if (!req.user) {
                return res.status(401).send({ success: false, message: "User is not authenticated" });
            }
    
            const loggedInUserId = (req.user as any).id; // Adjust the type based on your user object structure
    
            // Fetch the blog post to verify ownership
            const post = await getPost(Number(id));
            if (!post) {
                return res.status(404).send({ success: false, message: "Post not found" });
            }
    
            if (post.authorId !== loggedInUserId) {
                return res.status(403).send({ success: false, message: "User is not authorized to update this post" });
            }
    
            // Update the post
            const updatedPost = await updatePost(Number(id), { title, content, imageurl });
    
            res.status(200).send({ success: true, message: "Post updated successfully", post: updatedPost });
        }catch (err: unknown) {  // Correct way to annotate the error type
            if (err instanceof Error) {
              console.log("Error:", err.message);
            } else {
              console.log("An unknown error occurred");
            }
            res.status(500).send({ success: false, message: "Failed to update post" });
          }
    });


app.get("/logout", (req:Request, res:Response) => {
    try {
        if(!req.user){
            res.status(401).send({success:false,message:"user was not authenticated"});
        }
        req.logout((err) => {  // Add callback here
            if (err) {
                return res.status(500).send({ success: false, message: "Logout failed" });
            }
            res.status(200).send({ success: true, message: "User was logged out" });
        });
        
    } catch (err) {
        console.log(err);
    }
   
})





// Startfxn();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

