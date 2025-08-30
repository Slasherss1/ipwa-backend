import { NextFunction, Request, Response } from "express";
import { FileHandler } from "./filehandler";

export interface IUSettings {
    keyrooms: string[];
    rooms: string[];
    cleanThings: string[];
    menu: {
        defaultItems: {
            sn: string[];
            kol: string[];
        }
    },
    security: {
        loginTimeout: {
            attempts: number;
            time: number;
            lockout: number;
        }
    },
    modules: {
        news: boolean,
        menu: boolean,
        notif: boolean,
        groups: boolean,
        clean: boolean,
        key: boolean
    }
}

export enum Features {
    News,
    Menu,
    Notif,
    Groups,
    Clean,
    Key
}

class UOptions extends FileHandler<IUSettings> {
    construct(value: IUSettings | any): IUSettings {
        return {
            keyrooms: value.keyrooms ?? [],
            rooms: value.rooms ?? [],
            cleanThings: value.cleanThings ?? [],
            menu: {
                defaultItems: {
                    sn: value.menu.defaultItems.sn ?? [],
                    kol: value.menu.defaultItems.kol ?? []
                }
            },
            security: {
                loginTimeout: {
                    attempts: value.security.loginTimeout.attempts ?? 0,
                    time: value.security.loginTimeout.time ?? 0,
                    lockout: value.security.loginTimeout.lockout ?? 0
                }
            },
            modules: {
                news: value.modules.news ?? true,
                menu: value.modules.menu ?? true,
                notif: value.modules.notif ?? true,
                groups: value.modules.groups ?? true,
                clean: value.modules.clean ?? true,
                key: value.modules.key ?? true
            }
        }
    }
    constructor() {
        const defaultSettings: IUSettings = {
            keyrooms: [],
            rooms: [],
            cleanThings: [],
            menu: {
                defaultItems: {
                    sn: [],
                    kol: [],
                }
            },
            security: {
                loginTimeout: {
                    attempts: 0,
                    time: 0,
                    lockout: 0
                }
            },
            modules: {
                news: true,
                menu: true,
                notif: true,
                groups: true,
                clean: true,
                key: true
            }
        }
        super("./config/usettings.json", { defaultContent: defaultSettings, name: "user settings" })
    }

    public mw(f: Features) {
        return (_req: Request, res: Response, next: NextFunction) => {
            switch (f) {
                case Features.News:
                    if (this.value.modules.news) return next()
                    break;
                case Features.Menu:
                    if (this.value.modules.menu) return next()
                    break;
                case Features.Notif:
                    if (this.value.modules.notif) return next()
                    break;
                case Features.Groups:
                    if (this.value.modules.groups) return next()
                    break;
                case Features.Clean:
                    if (this.value.modules.clean) return next()
                    break;
                case Features.Key:
                    if (this.value.modules.key) return next()
                    break;
                default:
                    break;
            }
            res.sendStatus(406)
        }
    }
}

export default new UOptions();
