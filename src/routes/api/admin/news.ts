import { Router } from "express";
import News from "@schemas/News"
import { Perms, adminPerm } from "@/utility";
import capability, { Features } from "@/capability";

const newsRouter = Router()

newsRouter.use(adminPerm(Perms.News))
newsRouter.use(capability.mw(Features.News))

newsRouter.get('/', async (req,res)=>{
    res.send(await News.find({},null,{sort: {pinned: -1 ,date: -1}}))
})
newsRouter.post('/', async (req,res)=>{
    await News.create({title: req.body.title, content: req.body.content})
    res.status(201).send({status: 201})
})
newsRouter.delete('/:id', async (req,res)=>{
    await News.findByIdAndDelete(req.params.id)
    res.send({status: 200})
})
newsRouter.put('/:id', async (req,res)=>{
    await News.findByIdAndUpdate(req.params.id, req.body)
    res.send({status: 200})
})

export {newsRouter};