import { Router } from "express";
import Notification from "@schemas/Notification";
import { islogged } from "@/utility";
import { adminRouter } from "./api/adminRouter";
import { appRouter } from "./api/appRouter";
import { authRouter } from "./auth/index";
import { Schema } from 'mongoose'
import capability, { Features } from "@/capability";

const router = Router();

router.use('/app', appRouter)
router.use('/admin', adminRouter)
router.use('/auth', authRouter)

router.post("/notif", islogged, capability.mw(Features.Notif), async (req, res) => {
    var obj = {user: new Schema.ObjectId(req.user.uname), ...req.body}
    await Notification.findOneAndUpdate(obj, obj, {upsert: true})
    res.send({"status": 200})
})

export default router;