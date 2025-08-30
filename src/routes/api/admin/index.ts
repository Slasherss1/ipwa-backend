import { Router } from "express";
import { islogged, isadmin} from "@/utility";
import { newsRouter } from "./news";
import { accsRouter } from "./accs";
import { menuRouter } from "./menu";
import { groupsRouter } from "./groups";
import { notifRouter } from "./notif";
import { keysRouter } from "./keys";
import { cleanRouter } from "./clean";
import { settingsRouter } from "./settings";
import User from "@/schemas/User";
import Group from "@/schemas/Group";
import usettings from "@/helpers/usettings";

export const adminRouter = Router()

adminRouter.use(islogged, isadmin)
adminRouter.use('/news', newsRouter)
adminRouter.use('/accs', accsRouter)
adminRouter.use('/menu', menuRouter)
adminRouter.use('/groups', groupsRouter)
adminRouter.use('/notif', notifRouter)
adminRouter.use('/keys', keysRouter)
adminRouter.use('/clean', cleanRouter)
adminRouter.use('/settings', settingsRouter)

adminRouter.get('/usearch', async (req, res) => {
    var results = await User.find({$text: {$search: req.query['q'].toString()}}, {uname: 1, surname: 1, fname: 1, room: 1})
    res.send(results)
})

adminRouter.get('/sync', async (req, res) => {
    res.send({
        groups: usettings.value.modules.groups ? await Group.find() : undefined
    })
})