import { Router } from "express";
import passport from "passport";
import User, { userVisibleFields } from "@schemas/User";
import { islogged } from "@/utility";
import bcrypt from "bcryptjs"
import cap from "@/helpers/capability";
import usettings from "@/helpers/usettings";
import vapidKeys from "@/vapidKeys";
import { IVerifyOptions } from "passport-local";

const authRouter = Router()

authRouter.post("/login", (req, res) => {
    passport.authenticate('normal', (err: { type: string, message: string } | null, user?: Express.User | false, options?: IVerifyOptions) => {
        if (user) {
            req.login(user, (error) => {
                if (error) {
                    res.status(500).send(error)
                } else {
                    res.send({ status: 200, admin: req.user.admin || undefined, redirect: req.user.defaultPage })
                }
            })
        } else {
            if (err) {
                switch (err.type) {
                    case "unf":
                        res.sendStatusMessage(404, "Zła nazwa użytkownika lub hasło.")
                        break;
                    case "timeout":
                    case "locked":
                        res.sendStatusMessage(403, err.message)
                        break;
                    default:
                        res.sendStatusMessage(500, err.message)
                        break;
                }
            } else {
                res.sendStatusMessage(403, "Brak hasła lub loginu.")
            }
        }
    })(req, res)
})

authRouter.post("/chpass", islogged, async (req, res) => {
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
        if (err) { next(err) }
        res.send({ "status": 200 })
    })
})

authRouter.get("/check", islogged, (req, res, next) => {
    if (req.user.locked) {
        req.logout((err) => {
            if (err) next(err)
            res.status(401).send({ status: 401, message: "Your account has been locked." })
        })
    }
    res.send({ "admin": req.user.admin, "features": cap.flags, "user": userVisibleFields(req.user), "menu": { "defaultItems": usettings.value.menu.defaultItems }, "vapid": vapidKeys.keys.publicKey })
})

authRouter.put("/redirect", islogged, async (req, res) => {
    if (["", "/", "/login", "/login/", "login"].find(v => v == req.body.redirect)) return res.status(400).send({ status: 400, message: "Path in blacklist" })
    const update = await User.findByIdAndUpdate(req.user._id, { defaultPage: req.body.redirect })
    if (update) {
        res.send({ status: 200 }).end()
    } else {
        res.status(500).send({ status: 500 }).end()
    }
})

export { authRouter };
