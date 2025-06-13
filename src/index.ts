import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from 'bcryptjs';
import MongoStore from "connect-mongo";
import mongoose from "mongoose"
import User, { IUser } from "./schemas/User";
import routes from "./routes/index";
import process from "node:process"
import security from "./helpers/security";
const connectionString = process.env.ATLAS_URI || "mongodb://mongodb:27017/ipwa";

if (!process.env.DOMAIN) {
    console.log("CORS origin undefined")
    process.exit(1)
}

declare global {
    namespace Express {
        export interface User extends IUser {
            _id: mongoose.Types.ObjectId;
        }
    }
}

//#region express initialization
var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:4200", `https://${process.env.DOMAIN}`,],
    credentials: true
}))
app.use(session({
    resave: false,
    rolling: true,
    secret: process.env.SECRET,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: connectionString, dbName: "ipwa", collectionName: "sessions", touchAfter: 60, autoRemove: 'disabled' }),
    cookie: {
        maxAge: 1209600000,
    }
}))
app.use(passport.session())
//#endregion

//#region Passport strategies initialization
passport.use("normal", new LocalStrategy(async function verify(uname, pass, done) {
    let query = await User.findOne({ uname: uname.toLowerCase() })
    if (query) {
        if (query.locked == true) return done({ type: "locked", message: "Twoje konto jest zablokowane. Skontaktuj się z administratorem." }, false)
        var timeout = security.check(query._id)
        if (timeout) {
            timeout = Math.ceil(timeout / 1000 / 60)
            return done({ type: "timeout", message: `Zbyt wiele nieudanych prób logowania. Odczekaj ${timeout} minut lub skontaktuj się z administratorem.` }, false)
        }
        if (await bcrypt.compare(pass, query.pass)) {
            return done(null, query)
        } else {
            security.addAttempt(query._id)
            done({ type: "unf" }, false)
        }
    } else {
        done({ type: "unf" }, false)
    }
}))
//#endregion

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    let query = await User.findById(id)
    if (query) {
        done(null, query)
    } else {
        done(null, false)
    }
});

var server = app.listen(8080, async () => {
    await mongoose.connect(connectionString);
    await dataMigration()
    if (process.send) process.send("ready")
})

app.use('/', routes)

process.on('SIGINT', () => {
    server.close()
    mongoose.disconnect().then(() => process.exit(0), () => process.exit(1))
})

async function dataMigration() {
    //#region User
    var users = await User.find({ admin: { $type: "int" } }).lean()
    users.forEach(async v => {
        var oldFlags = v.admin as unknown as number
        var newFlags: string[] | undefined = []
        if ((oldFlags & 1) == 1) newFlags.push("news")
        if ((oldFlags & 2) == 2) newFlags.push("menu")
        if ((oldFlags & 4) == 4) newFlags.push("notif")
        if ((oldFlags & 8) == 8) newFlags.push("groups")
        if ((oldFlags & 16) == 16) newFlags.push("accs")
        if ((oldFlags & 32) == 32) newFlags.push("super")
        if ((oldFlags & 64) == 64) newFlags.push("keys")
        if ((oldFlags & 128) == 128) newFlags.push("grades")
        if (newFlags.length == 0) newFlags = undefined
        await User.findByIdAndUpdate(v._id, { $set: { admin: newFlags } })
    })
    //#endregion
}
