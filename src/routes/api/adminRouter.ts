import { Router } from "express";
import { islogged, isadmin} from "@/utility";
import { newsRouter } from "./admin/news";
import { accsRouter } from "./admin/accs";
import { menuRouter } from "./admin/menu";
import { groupsRouter } from "./admin/groups";
import { notifRouter } from "./admin/notif";
import { keysRouter } from "./admin/keys";
import { cleanRouter } from "./admin/clean";
import { settingsRouter } from "./admin/settings";

const adminRouter = Router()

adminRouter.use(islogged, isadmin)
adminRouter.use('/news', newsRouter)
adminRouter.use('/accs', accsRouter)
adminRouter.use('/menu', menuRouter)
adminRouter.use('/groups', groupsRouter)
adminRouter.use('/notif', notifRouter)
adminRouter.use('/keys', keysRouter)
adminRouter.use('/clean', cleanRouter)
adminRouter.use('/settings', settingsRouter)

adminRouter.get('/usearch', (req, res) => {
    // TODO: Add search
    res.send([req.query['q']])
})

export {adminRouter};