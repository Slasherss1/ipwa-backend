import { NextFunction, Request, Response } from "express"

var islogged = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.sendStatus(401)
}

var isadmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user.admin != null) {
        return next()
    }
    res.sendStatus(401)
}

enum Perms {
    News = 1,
    Menu = 2,
    Notif = 4,
    Groups = 8,
    Accs = 16,
    Superadmin = 32,
    Key = 64,
    Clean = 128,
}

var adminPerm = (perm: Perms) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (adminCond(req.user.admin, perm)) {
            return next()
        }
        res.sendStatus(401)
    }
}

var adminCond = (adminInt = 0, perm: Perms) => {
    return (adminInt & perm) == perm
}

var project = (obj: any, projection: any) => {
    let obj2: any = {}
    for (let key in projection) {
        if (key in obj) obj2[key] = obj[key]
    }
    return obj2
}

export {islogged, isadmin, adminPerm, Perms, adminCond, project};