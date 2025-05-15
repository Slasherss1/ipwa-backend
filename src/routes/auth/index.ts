import { Router } from "express";
import passport from "passport";
import User from "@schemas/User";
import { islogged } from "@/utility";
import bcrypt from "bcryptjs"
import cap from "@/helpers/capability";
import usettings from "@/helpers/usettings";
import vapidKeys from "@/vapidKeys";
import { IVerifyOptions } from "passport-local";

const authRouter = Router()

authRouter.post("/login", (req, res) => {
    passport.authenticate('normal', (err: {type: string, message: string} | null, user?: Express.User | false, options?: IVerifyOptions) => {
        if (user) {
            req.login(user, (error) => {
                if (error) {
                    res.status(500).send(error)
                } else {
                    if (req.user.admin != null) {
                        res.send({status: 200, admin: req.user.admin})
                    } else {
                        res.send({status: 200})
                    }
                }
            })
        } else {
            if (err) {
                switch (err.type) {
                    case "unf":
                        res.status(404).send({status: 404, message: "Zła nazwa użytkownika lub hasło."})
                        break;
                    case "timeout":
                        res.status(403).send({status: 403, message: err.message})
                        break;
                    case "locked":
                        res.status(403).send({status: 403, message: err.message})
                        break;
                    default:
                        res.status(500).send({status: 500, message: err.message})
                        break;
                    }
            } else {
                res.status(403).send({status: 403, message: "Brak hasła lub loginu."})
            }
        }
    })(req, res)
})

authRouter.post("/chpass", islogged, async (req,res) => {
    var id = req.user._id
    if (!await bcrypt.compare(req.body.oldPass, req.user.pass)) {
        res.sendStatus(401)
        return
    }
    var newpass = bcrypt.hashSync(req.body.newPass, 10)
    const update = await User.findByIdAndUpdate(id, {
        pass: newpass
    })
    if (update) {
        
    } else {
        
    }
    req.logOut((err) => {
        if (err) {
            res.sendStatus(500)
            console.error(err)
            return
        }
    })
    res.sendStatus(200)
})

authRouter.delete("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {next(err)}
        res.send({"status": 200})
    })
})

authRouter.get("/check", islogged, (req, res, next) => {
    if (req.user.locked) {
        req.logout((err) => {
            if (err) next(err)
            res.status(401).send("Your account has been locked.")
        })
    }
    res.send({"admin": req.user.admin, "features": cap.flags, "room": req.user.room, "menu": {"defaultItems": usettings.settings.menu.defaultItems}, "vapid": vapidKeys.keys.publicKey})
})

export { authRouter };
