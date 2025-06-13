import User from "@schemas/User";
import { Router } from "express"
import { Perms, adminCond, adminPerm } from "@/utility";
import security from "@/helpers/security";
import { Types } from "mongoose";

const accsRouter = Router()

accsRouter.use(adminPerm(Perms.Accs))

accsRouter.get('/', async (req, res)=> {
    res.send(await User.find({"uname": {"$ne": req.user.uname}}, {pass: 0}))
})

accsRouter.get('/:id', async (req, res) => {
    res.send({
        ...(await User.findById(req.params.id, {pass: 0})).toJSON(),
        lockout: !!security.check(new Types.ObjectId(req.params.id))
    })
})

accsRouter.post('/', async (req, res)=> {
    if (req.body.uname == "admin") return res.status(400).send("This name is reserved").end()
    var createdUser
    if (req.body.admin) {
        if (adminCond(req.user.admin, Perms.Superadmin)) {
            if (adminCond(req.body.admin, Perms.Superadmin)) {
                res.status(400).send("Cannot set superadmin")
            } else {
                createdUser = await User.create({uname: req.body.uname, room: req.body.room, admin: req.body.admin, fname: req.body.fname, surname: req.body.surname})
            }
        }
    } else {
        createdUser = await User.create({uname: req.body.uname, room: req.body.room, fname: req.body.fname, surname: req.body.surname})
    }
    var responseCandidate = createdUser.toJSON()
    delete responseCandidate.pass
    res.status(201).send(responseCandidate)
})

accsRouter.put('/:id', async (req, res)=> {
    let user = await User.findById(req.params.id)
    if (!user) {
        res.status(404).send("User not found")
        return
    }
    if (req.body.flags) {
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

accsRouter.delete('/:id/lockout', async (req, res) => {
    if (security.clearAcc(req.params.id)) {
        res.send({status: 200}).end()
    } else {
        res.sendStatus(400)
    }
})

export {accsRouter};