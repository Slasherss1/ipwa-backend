import User from "@schemas/User";
import { Router } from "express"
import { Perms, adminCond, adminPerm } from "@/utility";
import capability from "@/helpers/capability";
import Group from "@/schemas/Group";

const accsRouter = Router()

accsRouter.use(adminPerm(Perms.Accs))

accsRouter.get('/', async (req, res)=> {
    var data = {
        users: await User.find({"uname": {"$ne": req.user.uname}}, {pass: 0}),
        groups: capability.settings.groups ? await Group.find() : undefined
    }
    res.send(data)
})

accsRouter.post('/', async (req, res)=> {
    if (req.body.uname == "admin") return res.status(400).send("This name is reserved").end()
    if (req.body.flags) {
        if (adminCond(req.user.admin, Perms.Superadmin)) {
            if (adminCond(req.body.flags, Perms.Superadmin)) {
                res.status(400).send("Cannot set superadmin")
            } else {
                await User.create({uname: req.body.uname, room: req.body.room, admin: req.body.flags, fname: req.body.fname, surname: req.body.surname})
                res.status(201).send({status: 201})
            }
        }
    } else {
        await User.create({uname: req.body.uname, room: req.body.room, fname: req.body.fname, surname: req.body.surname})
        res.status(201).send({status: 201})
    }
})

accsRouter.put('/:id', async (req, res)=> {
    let user = await User.findById(req.params.id)
    if (!user) {
        res.status(404).send("User not found")
        return
    }
    if (req.body.flags != undefined) {
        if (adminCond(req.user.admin, Perms.Superadmin)) {
            if (adminCond(user.admin, Perms.Superadmin)) {
                res.status(400).send("Cannot edit other superadmins")
            } else {
                if (adminCond(req.body.flags, Perms.Superadmin)) {
                    res.status(400).send("Cannot set superadmin")
                } else {
                    await user.set({uname: req.body.uname, room: req.body.room, admin: req.body.flags, fname: req.body.fname, surname: req.body.surname, groups: req.body.groups}).save()
                    res.send({status: 200})
                }
            }
        } else {
            res.sendStatus(403)
        }
    } else {
        await user.set(req.body).save()
        res.send({status: 200})
    }
})

accsRouter.patch('/:id/reset', async (req, res) => {
    let user = await User.findById(req.params.id)
    if (!user) {
        res.status(404).send("User not found")
        return
    }
    if (await user.set({pass: "$2y$10$miwF6PrsbLpRzFsj8XKjY.0flJWzWDQJ7iT81HuX1ic/1s0mfmvk."}).save()) { // Pass: reset
        res.send({status: 200}).end()
        return
    } else {
        res.sendStatus(500)
    }
})

accsRouter.delete('/:id', async (req, res) => {
    if (await User.findByIdAndDelete(req.params.id)) {
        res.send({status: 200}).end()
    } else {
        res.sendStatus(404)
    }
})

export {accsRouter};