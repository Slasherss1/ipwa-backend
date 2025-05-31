import { Request, Response, Router } from "express";
import { Perms, adminPerm } from "@/utility";
import Group from "@schemas/Group";
import { PushResult, Message } from "@/notif";
import capability, { Features } from "@/helpers/capability";
import Inbox from "@/schemas/Inbox";
import { Types } from "mongoose";
import { IUser } from "@/schemas/User";
import { outboxRouter } from "./outbox";

const notifRouter = Router()

notifRouter.use(adminPerm(Perms.Notif))
notifRouter.use(capability.mw(Features.Notif))

type PushSendBody = {recp:
    {type: "uname", uname: string} |
    {type: "room", room: string} |
    {type: "group", group: string},
    title: string,
    body: string
}

notifRouter.post("/send", async (req: Request<undefined, PushResult, PushSendBody>, res: Response<PushResult>) => {
    let recp: string
    switch (req.body.recp.type) {
        case "uname":
            recp = req.body.recp.uname
            break;
        case "room":
            recp = req.body.recp.room
            break;
        case "group":
            if (!capability.settings.groups) return res.sendStatus(406).end()
            recp = req.body.recp.group
            break;
        default:
            res.status(400).end()
            break;
    }
    const message = new Message(req.body.title, req.body.body, req.body.recp.type, recp)
    let result: PushResult = await message.send()
    console.log(`
        From: ${req.user.uname} (${req.user._id})
        To: ${recp}
        Subject: ${req.body.title}

        ${req.body.body}
    `);
    res.send(result)
})

notifRouter.get("/groups", async (req, res) => {
    res.send(await Group.find({}, { name: 1, _id: 1 }))
})

notifRouter.use("/outbox", outboxRouter)

export { notifRouter }