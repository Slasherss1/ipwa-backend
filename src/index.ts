import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from 'bcryptjs';
import MongoStore from "connect-mongo";
import mongoose from "mongoose"
import User from "./schemas/User";
import routes from "./routes/index";
import process from "node:process"
const connectionString = process.env.ATLAS_URI || "mongodb://mongodb:27017/ipwa";

if (!process.env.DOMAIN) {
    console.log("CORS origin undefined")
    process.exit(1)
}

declare global {
    namespace Express {
        export interface User {
            _id: mongoose.Types.ObjectId;
            pass: string;
            uname: string;
            admin?: number;
            locked?: boolean;
            room?: string
        }
    }
}

//#region express initialization
var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({
    origin: ["http://localhost:4200", "http://localhost:3000", `htt[s://${process.env.DOMAIN}`,],
    credentials: true
}))
app.use(session({
    resave: false,
    rolling: true,
    secret: process.env.SECRET,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: connectionString, dbName: "ipwa", collectionName: "sessions", touchAfter: 60, autoRemove: 'disabled'}),
    cookie: {
        maxAge: 1209600000,
    }
}))
app.use(passport.session())
//#endregion

//#region Passport strategies initialization
passport.use("normal",new LocalStrategy(async function verify(uname,pass,done) {
    let query = await User.findOne({uname: uname.toLowerCase()})
    if (query.locked == true) return done(null, false)
    if (query) {
        if (await bcrypt.compare(pass, query.pass)) {
            return done(null, query)
        } else done(null, false)
    } else {
        done(null, false)
    }
}))
//#endregion

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
    let query = await User.findById(id)
    if (query) {
        done(null, query)
    } else {
        done(null, false)
    }
});

app.listen(8080, async () => {
    await mongoose.connect(connectionString);
    if (process.send) process.send("ready")
})

app.use('/', routes)

process.on('SIGINT', () => {
    mongoose.disconnect().then(() => process.exit(0), () => process.exit(1))
})