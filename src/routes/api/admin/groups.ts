import Group from "@schemas/Group";
import { Router } from "express"
import { Perms, adminPerm } from "@/utility";
import capability, { Features } from "@/capability";

const groupsRouter = Router()

groupsRouter.use(adminPerm(Perms.Groups))
groupsRouter.use(capability.mw(Features.Groups))

groupsRouter.get('/', async (req, res)=> {
    res.send(await Group.find({}))
})

groupsRouter.post('/', async (req, res)=> {
    if (await Group.create({name: req.body.name})) {
        res.status(201).send({status: 201})
    } else {
        res.sendStatus(500)
    }
})

groupsRouter.put('/:id', async (req, res) => {
    let group = await Group.findById(req.params.id)
    if (!group) {
        res.status(404).send("Group not found")
        return
    }
    if (await group.set(req.body).save()) {
        res.send({status: 200}).end()
        return
    } else {
        res.sendStatus(500)
    }
})

groupsRouter.delete('/:id', async (req, res) => {
    await Group.findByIdAndRemove(req.params.id)
    res.send({status: 200})
})

export {groupsRouter};