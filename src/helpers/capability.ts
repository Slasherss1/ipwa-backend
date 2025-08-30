import { readFileSync, rmSync } from "fs";
import usettings from "./usettings";

/**
 * @deprecated in favor of {@link usettings}
 */
class Settings {
    constructor() {
        try {
            usettings.value = { ...usettings.value, modules: JSON.parse(readFileSync('./config/options.json', 'utf-8')) }
            rmSync('./config/options.json')
        } catch (error) {
            if (error instanceof Error) {
                if ('code' in error) {
                    if (error.code == "ENOENT") {
                        this.createUSettingsFlags()
                    }
                }
            }
        }
    }

    /**
     * Read settings or create them if null
     * @returns IUSettings[modules]
     */
    private createUSettingsFlags() {
        if (!usettings.value.modules) {
            usettings.value = { ...usettings.value, modules: { clean: true, groups: true, key: true, menu: true, news: true, notif: true } }
        }
        return usettings.value.modules
    }
}

export default new Settings()