import { readFileSync, writeFileSync } from "node:fs";
import { generateVAPIDKeys, VapidKeys } from "web-push";

class VapidKeysSettings {
    private _keys: VapidKeys;
    public get keys(): VapidKeys {
        return this._keys;
    }
    public set keys(value: VapidKeys) {
        this._keys = value;
        this.save()
    }

    constructor() {
        this.reload()
    }

    private save() {
        writeFileSync("./config/keys.json", JSON.stringify(this._keys, undefined, 2))
    }
    
    reload() {
        try {
            this._keys = JSON.parse(readFileSync("./config/keys.json", {encoding: "utf-8"}))
        } catch (error) {
            if (error instanceof Error) {
                if ('code' in error) {
                    if (error.code === "ENOENT") {
                        this.keys = generateVAPIDKeys();
                    }
                }
            }
        } finally {
            if (!(this.keys.privateKey && this.keys.publicKey)) {
                this.keys = generateVAPIDKeys()
            }
            console.log("Reloaded VAPID keys");
        }
    }
}

export default new VapidKeysSettings();