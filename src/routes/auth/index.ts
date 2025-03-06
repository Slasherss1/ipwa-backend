import { Router } from "express";
import passport from "passport";
import User from "@schemas/User";
import { islogged } from "@/utility";
import bcrypt from "bcryptjs"
import cap from "@/capability";
import usettings from "@/usettings";

const authRouter = Router()

authRouter.post("/login", passport.authenticate('normal'), (req, res) => {
    if (req.user.admin != null) res.send({status: 200, admin: req.user.admin})
    else res.send({status: 200})
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
    res.send({"admin": req.user.admin, "features": cap.flags, "room": req.user.room, "menu": {"defaultItems": usettings.settings.menu.defaultItems}})
})

export { authRouter };
