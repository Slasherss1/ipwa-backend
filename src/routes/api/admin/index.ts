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

adminRouter.get('/usearch', (req, res) => {
    // TODO: Add search
    res.send([req.query['q']])
})