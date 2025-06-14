import { Router } from "express";
import capability, { Features } from "@/helpers/capability";
import Key from "@schemas/Key";
import usettings from "@/helpers/usettings";
import User, { IUser } from "@schemas/User";
import { Perms, adminPerm } from "@/utility";

const keysRouter = Router()

keysRouter.use(capability.mw(Features.Key))
keysRouter.use(adminPerm(Perms.Key))

keysRouter.get("/", async (req, res) => {
    var keys = await Key.find({}, undefined, {sort: {borrow: -1}}).populate<Pick<IUser, "uname" | "room"> & {_id: string}>({path: "whom", select: { _id: 1, uname: 1, room: 1}})
    res.send(keys)
})

keysRouter.post("/", async (req, res) => {
    var user = await User.findById(req.body.whom._id)
    if (!user) {
        return res.status(404).send("User not found").end()
    }
    const newKey = new Key({
        room: req.body.room,
        whom: user._id
    })
    if (await newKey.save()) {
        res.status(201).send({status: 201})
    } else {
        res.sendStatus(500)
    }
})

keysRouter.get("/available", async (req, res) => {
    var taken = await Key.find({tb: {$exists: false}}, {}, {sort: {borrow: -1}})
    var occ = Array.from(new Set(taken.map((v) => v.room)))
    var all = Array.from(new Set(usettings.value.keyrooms))
    var free = all.filter(x => !occ.includes(x))
    res.send(free)
})

keysRouter.put("/:id", async (req, res) => {
    if (await Key.findByIdAndUpdate(req.params.id, req.body)) {
        res.send({status: 200})
    } else {
        res.sendStatus(500)
    }
})

export { keysRouter }