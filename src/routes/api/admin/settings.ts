import { Router } from "express";
import { adminPerm, Perms } from "@/utility";
import usettings from "@/helpers/usettings";

export const settingsRouter = Router()

settingsRouter.use(adminPerm(Perms.Superadmin))

settingsRouter.get('/', (req, res) => {
    res.send(usettings.value)
})

settingsRouter.post('/', (req, res) => {
    usettings.value = req.body
    res.send({status: 200})
})

settingsRouter.get('/reload', (req, res) => {
    usettings.reload()
    res.send({status: 200})
})