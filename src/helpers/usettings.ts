import { project } from "@/utility";
import { readFileSync, writeFileSync } from "node:fs";
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
    }
}

class UOptions extends FileHandler<IUSettings> {
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
            }
        }
        super("./config/usettings.json", {defaultContent: defaultSettings, name: "user settings", project: ['cleanThings', 'keyrooms', 'menu', 'rooms', 'security']})
    }
}

export default new UOptions();