import { Router } from "express";
import { islogged } from "@/utility";
import News from "@schemas/News";
import Menu from "@schemas/Menu";
import Vote from "@schemas/Vote";
import { vote } from "@/pipelines/vote";
import capability, { Features } from "@/helpers/capability";
import Key, { IKey } from "@schemas/Key";
import usettings from "@/helpers/usettings";
import Grade from "@schemas/Grade";
import { createHash } from "node:crypto";
const appRouter = Router();

appRouter.use(islogged)

appRouter.get("/news", capability.mw(Features.News), async (req, res) => {
    var news = await News.find({"visible": {"$ne": false}}, {_id: 0, visible: 0}, {sort: {pinned: -1 ,date: -1}})
    res.send(news)
})

appRouter.get("/news/check", capability.mw(Features.News), async (req, res) => {
    var news = await News.find({"visible": {"$ne": false}}, {_id: 0, visible: 0}, {sort: {pinned: -1 ,date: -1}})
    const hash = createHash('sha1')
    var newsha = hash.update(news.toString()).digest('hex');
    var check: { hash: string; count: number; } = {hash: newsha, count: news.length}
    res.send(check)
})

appRouter.get("/menu/:timestamp", capability.mw(Features.Menu), async (req, res) => {
    var item = await Menu.aggregate(vote(new Date(Number.parseInt(req.params.timestamp)),req.user!._id))
    var votes = await Vote.find({dom: new Date(Number.parseInt(req.params.timestamp))})
    var grouped = votes.reduce((x, y) => {
        x[y.tom].push(y)
        return x
    }, {ob: [], kol: []})
    var count = {
        ob: (grouped.ob.filter(v=>v.vote == "+").length / grouped.ob.length * 100).toFixed(2),
        kol: (grouped.kol.filter(v=>v.vote == "+").length / grouped.kol.length * 100).toFixed(2)
    }
    var final = {
        ...item[0],
        stat: count
    }
    res.send(final)
})

appRouter.post("/menu/:timestamp", capability.mw(Features.Menu), async (req, res) => {
    const vote = await Vote.findOneAndUpdate({user: req.user._id, dom: new Date(req.params.timestamp), tom: req.body.tom}, {
        ...req.body,
        user: req.user._id,
        dom: new Date(req.params.timestamp),
    }, {upsert: true, new: true})
    if (vote) {
        res.send({status: 200})
    } else {
        res.sendStatus(500)
    }
})

appRouter.get("/keys", capability.mw(Features.Key), async (req, res) => {
    var keys = await Key.find<Pick<IKey, "room">>({tb: {$exists: false}}, {room: 1}, {sort: {room: 1}})
    var occ = keys.map(x=>x.room)
    var all = usettings.settings.keyrooms
    var free = all.filter(x=>!occ.includes(x)).sort().map(x => {
        return { room: x }
    })
    var final = [...keys, ...free]
    res.send(final)
})

appRouter.get("/clean/:date", capability.mw(Features.Clean), async (req, res) => {
    res.send(await Grade.findOne({
        room: req.user.room,
        date: new Date(req.params.date)
    }))
})

export {appRouter};