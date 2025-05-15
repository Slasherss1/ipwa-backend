import { NextFunction, Request, Response } from "express";
import { readFileSync } from "fs";

interface Options {
    "news": boolean,
    "menu": boolean,
    "notif": boolean,
    "groups": boolean,
    "clean": boolean,
    "key": boolean
}

enum Features {
    News,
    Menu,
    Notif,
    Groups,
    Clean,
    Key,
}

class Settings {
    private _flags: number = 0
    public settings: Options;
    constructor () {
        this.reloadSettings()
    }
    
    private optionsToFlags() {
        this._flags = 0
        this._flags += this.settings.news && 1
        this._flags += this.settings.menu && 2
        this._flags += this.settings.notif && 4
        this._flags += this.settings.groups && 8
        this._flags += this.settings.clean && 16
        this._flags += this.settings.key && 32
    }
    
    public reloadSettings() {
        this.settings = JSON.parse(readFileSync('./config/options.json', 'utf-8'))
        this.optionsToFlags()    
    }
    
    public get flags() : number {
        return this._flags;
    }
    
    public mw(f: Features) {
        return (_req: Request, res: Response, next: NextFunction) => {
            switch (f) {
                case Features.News:
                    if (this.settings.news) return next()
                    break;
                case Features.Menu:
                    if (this.settings.menu) return next()
                    break;
                case Features.Notif:
                    if (this.settings.notif) return next()
                    break;
                case Features.Groups:
                    if (this.settings.groups) return next()
                    break;
                case Features.Clean:
                    if (this.settings.clean) return next()
                    break;
                case Features.Key:
                    if (this.settings.key) return next()
                    break;
                default:
                    break;
            }
            res.sendStatus(406)
        }
    }

}

export default new Settings()
export { Features }