import { Router } from "express";
import { Perms, adminPerm } from "@/utility";
import capability, { Features } from "@/capability";
import usettings from "@/usettings";
import Grade from "@schemas/Grade";

const cleanRouter = Router()
cleanRouter.use(adminPerm(Perms.Clean))
cleanRouter.use(capability.mw(Features.Clean))

cleanRouter.get("/:date/:room", async (req, res) => {
    res.send(await Grade.findOne({
        date: new Date(req.params.date),
        room: req.params.room
    }))
})

cleanRouter.post("/", async (req, res) => {
    let obj = {
        ...req.body,
        date: new Date(req.body.date),
        gradeDate: new Date(),
    }
    await Grade.findOneAndReplace({
        date: new Date(req.body.date),
        room: req.body.room,
    }, obj, {upsert: true})
    res.send({status: 200})
})

cleanRouter.get("/summary/:start/:stop", async (req, res) => {
    var data = await Grade.find({
        date: {
            $gte: new Date(req.params.start),
            $lte: new Date(req.params.stop)
        }
    })
    data = data.map(v => v.toJSON())
    var byRoom: {[room: number]: any[]} = {}
    data.forEach((v) => {
        let roomarray = byRoom[v.room] ? byRoom[v.room] : [];
        byRoom[v.room] = [...roomarray, {...v, room: undefined}]
    })
    var stat: {room: number, avg: number}[] = []
    for (let i in byRoom) {
        var sum: number = 0
        for (let j of byRoom[i]) {
            sum += j.grade
        }
        let avrg = sum/byRoom[i].length
        stat.push({room: Number.parseInt(i), avg: avrg})
    }
    res.send(stat)
})

cleanRouter.delete("/:id", async (req, res) => {
    if (await Grade.findByIdAndDelete(req.params.id)) {
        res.send({status: 200})
    } else {
        res.sendStatus(500)
    }
})

cleanRouter.get('/config', (req, res) => {
    res.send({
        rooms: usettings.settings.rooms,
        things: usettings.settings.cleanThings
    })
})

export {cleanRouter}