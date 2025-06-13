import { NextFunction, Request, Response } from "express"

var islogged = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.sendStatus(401)
}

var isadmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user.admin) {
        return next()
    }
    res.sendStatus(401)
}

enum Perms {
    News = "news",
    Menu = "menu",
    Notif = "notif",
    Groups = "groups",
    Accs = "accs",
    Superadmin = "super",
    Key = "keys",
    Clean = "grades",
}

var adminPerm = (perm: Perms) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (adminCond(req.user.admin, perm)) {
            return next()
        }
        res.sendStatus(401)
    }
}

var adminCond = (perms: Perms[], perm: Perms) => {
    return perms.includes(perm)
}

export function project<T extends object>(obj: T | any, projection?: (keyof T)[] | { [key in keyof T]: any}): Partial<T> {
    let obj2: Partial<T> = {}
    if (projection) {
        if (projection instanceof Array) {
            for (let key of projection) {
                if (key in obj) obj2[key] = obj[key]
            }
        } else {
            for (let key in projection) {
                if (key in obj) obj2[key] = obj[key]
            }
        }
        return obj2
    } else {
        return obj
    }
}

export {islogged, isadmin, adminPerm, Perms, adminCond};