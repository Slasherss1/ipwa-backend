import { Router } from "express";
import { Perms, adminPerm } from "@/utility";
import usettings, { Features } from "@/helpers/usettings";
import Grade from "@schemas/Grade";
import User from "@/schemas/User";
import attendence from "@/helpers/attendence";

const cleanRouter = Router()
cleanRouter.use(adminPerm(Perms.Clean))
cleanRouter.use(usettings.mw(Features.Clean))

cleanRouter.get("/:date([0-9]{4}-[0-9]{2}-[0-9]{2})/:room", async (req, res) => {
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
    var byRoom: {[room: string]: any[]} = {}
    data.forEach((v) => {
        let roomarray = byRoom[v.room] ? byRoom[v.room] : [];
        byRoom[v.room] = [...roomarray, {...v, room: undefined}]
    })
    var stat: {room: string, avg: number}[] = []
    for (let i in byRoom) {
        var sum: number = 0
        for (let j of byRoom[i]) {
            sum += j.grade
        }
        let avrg = sum/byRoom[i].length
        stat.push({room: i, avg: avrg})
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
        rooms: usettings.value.rooms,
        things: usettings.value.cleanThings
    })
})

cleanRouter.get('/attendence/:room', async (req, res) => {
    res.send({
        users: await User.find({room: req.params.room}, {fname: true, surname: true, _id: true}),
        attendence: attendence.getRoom(req.params.room)
    })
})

cleanRouter.post('/attendence/:room', async (req, res) => {
    attendence.setRoom(req.params.room, req.body)
    res.send({status: 200})
})

cleanRouter.delete('/attendence/:room', async (req, res) => {
    attendence.clearRoom(req.params.room)
    res.send({status: 200})
})

cleanRouter.get('/attendenceSummary', async (req, res) => {
    var allRooms = usettings.value.rooms
    var graded = (await Grade.find({date: new Date().setUTCHours(24,0,0,0)})).map(v => v.room)
    var ungraded = allRooms.filter(x => !graded.includes(x))
    var summary = attendence.summary()
    var unchecked: typeof summary = ungraded.filter(x => !summary.map(v => v.room).includes(x)).map(v => ({room: v, hours: [] as string[], notes: "Nie sprawdzono", auto: true}))
    res.send([...summary, ...unchecked])
})

export {cleanRouter}