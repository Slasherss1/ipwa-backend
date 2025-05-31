import { Router } from "express";
import Notification from "@schemas/Notification";
import { islogged } from "@/utility";
import { adminRouter } from "./api/adminRouter";
import { appRouter } from "./api/appRouter";
import { authRouter } from "./auth/index";
import capability, { Features } from "@/helpers/capability";
import mongoose from "mongoose";

const router = Router();

router.use('/app', appRouter)
router.use('/admin', adminRouter)
router.use('/auth', authRouter)

router.get("/healthcheck", async (req, res) => {
    res.status(200).send({
        uptime: process.uptime(),
        date: new Date(),
        db: mongoose.connection.readyState
    })
})

router.post("/notif", islogged, capability.mw(Features.Notif), async (req, res) => {
    var obj = {user: req.user._id, ...req.body}
    await Notification.findOneAndUpdate(obj, obj, {upsert: true})
    res.send({"status": 200})
})

export default router;