

import { db, } from "./db";
import * as schema from "./schema"
import { eq } from "drizzle-orm";

const bcrypt = require("bcrypt");


const passport = require("passport")
const LocalStrategy = require("passport-local");

passport.serializeUser((user:any, done:Function) => {
        done(null, user.id);
});
    
passport.deserializeUser(async (id:number, done:Function) => {
        try {
                const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
                const user = rows[0];
                done(null, user);
        } catch (err) {
                done(err);
        }
});

passport.use(new LocalStrategy({ usernameField: "username" },async (username:string, password:string, done:Function) => {
    try {
        console.log("username", username, "password", password);
        const rows = await db.select().from(schema.users).where(eq(schema.users.username, username));
        const user = rows[0];

        if (!user) {
            return done(null, false, { message: "Incorrect username" });
        }

        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return done(null, false, { message: "Incorrect password" })
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}))