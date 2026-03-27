import { Router } from "express";
import Menu from "@schemas/Menu";
import Vote from "@/schemas/Vote";

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
        // const date = new Date(req.query.date.toString())
        // const item = req.query.item.toString()
        // const menu = await Vote.find({day: date, name: item})
        // const ratings = menu.map(v => v.rating).filter(r => r !== null) as number[]
        // const tags = menu.flatMap(v => v.tags)
        // const comments = menu.map(v => v.comment).find(c => c !== null) ?? null
        // res.send({
        //     name: item,
        //     type: "other",
        //     value: {
        //         rating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        //         tags,
        //         comments
        //     }
        // })

        //return dummy data for now
        res.send({
            name: req.query.item.toString(),
            type: "other",
            value: {
                rating: 3.5,
                tags: {
                    "Rozgotowane": 4
                },
                comments: [
                    "całkiem dobre",
                    "Ziemniaki bardzo dobre"
                ]
            }
        })
    } else {
        res.status(400).end()
    }
})

export { editorRouter }