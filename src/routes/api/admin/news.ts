import { Router } from "express";
import News from "@schemas/News"
import { Perms, adminPerm } from "@/utility";
import { IUser } from "@/schemas/User";
import sync, { SyncEvent } from "@/helpers/sync";
import usettings, { Features } from "@/helpers/usettings";

const newsRouter = Router()

newsRouter.use(adminPerm(Perms.News))
newsRouter.use(usettings.mw(Features.News))
// TODO: Update sync condition
newsRouter.get('/', async (req, res) => {
    var news = await News.find(undefined, undefined, { sort: { pinned: -1, date: -1 } }).populate<{ author: Pick<IUser, "fname" | "surname" | "uname"> }>("author", ["fname", "surname", "uname"])
    res.send(news)
})
newsRouter.post('/', async (req, res) => {
    await News.create({ title: req.body.title, content: req.body.content, author: req.user._id })
    sync.nextEach({type: "news", operation: "create"} as NewsEvent)
    res.status(201).send({ status: 201 })
})
newsRouter.delete('/:id', async (req, res) => {
    await News.findByIdAndDelete(req.params.id)
    res.send({ status: 200 })
})
newsRouter.put('/:id', async (req, res) => {
    await News.findByIdAndUpdate(req.params.id, { ...req.body, author: req.user._id })
    sync.nextEach({type: "news", operation: "update"} as NewsEvent)
    res.send({ status: 200 })
})

interface NewsEvent extends SyncEvent {
    type: "news",
    operation: "create" | "update"
}

export { newsRouter };