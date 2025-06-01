import { project } from "@/utility";
import { readFileSync, writeFileSync } from "node:fs";

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
    }
}

class UOptions {
    private _settings: IUSettings;
    public get settings(): IUSettings {
        return this._settings;
    }
    public set settings(value: IUSettings) {
        this._settings = project<typeof value>(value, ['cleanThings', 'keyrooms', 'menu', 'rooms', 'security']) as typeof value
        this.save()
    }

    constructor() {
        this.reload()
    }

    private save() {
        writeFileSync("./config/usettings.json", JSON.stringify(this._settings, undefined, 2))
    }
    
    reload() {
        this.settings = JSON.parse(readFileSync("./config/usettings.json", {encoding: "utf-8"}))
        console.log("Reloaded user settings");
    }
}

export default new UOptions();