import { readFileSync, writeFileSync } from "node:fs";
interface IUSettings {
    keyrooms: string[];
    rooms: number[];
    cleanThings: string[];
    menu: {
        defaultItems: {
            sn: string[];
            kol: string[];
        }
    }
}

class UOptions {
    private _settings: IUSettings;
    public get settings(): IUSettings {
        return this._settings;
    }
    public set settings(value: IUSettings) {
        this._settings = value;
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