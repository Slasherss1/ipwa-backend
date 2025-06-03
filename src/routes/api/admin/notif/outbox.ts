import Inbox from "@/schemas/Inbox";
import { IUser } from "@/schemas/User";
import { Response, Router } from "express";

export const outboxRouter = Router()

outboxRouter.get("/", async (req, res: Response) => {
    var result = await Inbox.find({}, {message: 1, sentDate: 1}, {sort: {sentDate: -1}})
    var final = result.map(v => {
        return {
            _id: v._id,
            sentDate: v.sentDate,
            title: v.message.title
        }
    })
    res.send(final)
})

outboxRouter.get("/:id/message", async (req, res) => {
    var msg = await Inbox.findById(req.params.id, {message: 1})
    if (msg) {
        res.send(msg.message.body)
    } else {
        res.status(404).send({message: "ERR: 404 Message id not found"})
    }
})

outboxRouter.get("/:id/rcpts", async (req, res) => {
    var msg = await Inbox.findById(req.params.id, {rcpt: 1}).populate<{rcpt: Pick<IUser, "uname" | "room" | "fname" | "surname">}>({path: "rcpt", select: ["uname", "room", "fname", "surname"]}).exec()
    if (msg) {
        res.send(msg.rcpt)
    } else {
        res.status(404).send({message: "ERR: 404 Message id not found"})
    }
})