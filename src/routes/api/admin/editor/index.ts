import { Router } from "express";
import Menu from "@schemas/Menu";
import Vote from "@/schemas/Vote";
import { voteStats } from "@/pipelines/vote";

const editorRouter = Router()

editorRouter.get('/', async (req, res) => {
    if (req.query.start && req.query.end) {
        const start = new Date(req.query.start.toString())
        const end = new Date(req.query.end.toString())
        res.send(await Menu.find({day: {$gte: start, $lte: end}}))
    } else {
        res.status(400).end()
    }
})

editorRouter.get('/stats', async (req, res) => {
    if (req.query.date && req.query.item) {
        const date = new Date(req.query.date.toString())
        const item = req.query.item.toString()
        const menu = (await Vote.aggregate(voteStats(date, item)))[0]
        res.send({
            name: item,
            value: menu
        })
    } else {
        res.status(400).end()
    }
})

export { editorRouter }