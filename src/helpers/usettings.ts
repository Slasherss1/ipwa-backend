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
            }
        }
        super("./config/usettings.json", {defaultContent: defaultSettings, name: "user settings"})
    }
}

export default new UOptions();