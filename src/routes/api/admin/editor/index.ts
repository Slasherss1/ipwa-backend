import { Router } from "express";
import Menu from "@schemas/Menu";

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

export { editorRouter }