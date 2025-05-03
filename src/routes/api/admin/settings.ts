import { Router } from "express";
import { adminPerm, Perms, project } from "@/utility";
import usettings from "@/usettings";

export const settingsRouter = Router()

settingsRouter.use(adminPerm(Perms.Superadmin))

settingsRouter.get('/', (req, res) => {
    res.send(usettings.settings)
})

settingsRouter.post('/', (req, res) => {
    usettings.settings = project(req.body, {keyrooms: true, cleanThings: true, rooms: true, menu: true})
    res.send({status: 200})
})

settingsRouter.get('/reload', (req, res) => {
    usettings.reload()
    res.send({status: 200})
})