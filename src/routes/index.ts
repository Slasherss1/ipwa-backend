import { Router } from "express";
import Notification from "@schemas/Notification";
import { islogged } from "@/utility";
import { authRouter } from "./auth/index";
import capability, { Features } from "@/helpers/capability";
import mongoose from "mongoose";
import { apiRouter } from "./api";
import sync from "@/helpers/sync";

const router = Router();

router.use('/', apiRouter)
router.use('/auth', authRouter)

router.get("/healthcheck", async (req, res) => {
    res.status(200).send({
        uptime: process.uptime(),
        date: new Date(),
        db: mongoose.connection.readyState
    })
})

router.post("/notif", islogged, capability.mw(Features.Notif), async (req, res) => {
    var obj = { user: req.user._id, ...req.body }
    await Notification.findOneAndUpdate(obj, obj, { upsert: true })
    res.send({ "status": 200 })
})

router.get("/sync", islogged, async (req, res) => {
    const sub = sync.subscribe(req.user._id, v => {
        res.send(v)
    })

    req.once('close', () => {
        sub.unsubscribe()
    })
})

export default router;