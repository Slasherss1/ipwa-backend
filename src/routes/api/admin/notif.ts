import { Router } from "express";
import { Perms, adminPerm } from "@/utility";
import Group from "@schemas/Group";
import { NotifcationHelper } from "@/notif";
import capability, { Features } from "@/capability";

const notifRouter = Router()

const nh = new NotifcationHelper()

notifRouter.use(adminPerm(Perms.Notif))
notifRouter.use(capability.mw(Features.Notif))

notifRouter.post("/send", async (req, res) => {
    const message = nh.simpleMessage(req.body.title, req.body.body)
    let recp: string | number
    let result;
    switch (req.body.recp.type) {
        case "uname":
            recp = req.body.recp.uname as string
            result = await message.user(recp);
            break;
        case "room":
            recp = req.body.recp.room as string
            result = await message.room(recp)
            break;
        case "group":
            if (!capability.settings.groups) return res.sendStatus(406).end()
            recp = req.body.recp.group as string
            result = await message.group(recp)
            break;
        default:
            res.status(400).end()
            break;
    }
    console.log(`
        From: ${req.user.uname} (${req.user._id})
        To: ${recp}
        Subject: ${req.body.title}

        ${req.body.body}
    `);
    res.send(result)
})

notifRouter.get("/groups", async (req,res) => {
    res.send(await Group.find({}, {name: 1, _id: 1}))
})

export {notifRouter}