import { readFileSync, writeFileSync } from "node:fs";
import webpush from "web-push";

class VapidKeysSettings {
    private _keys: webpush.VapidKeys;
    public get keys(): webpush.VapidKeys {
        return this._keys;
    }
    public set keys(value: webpush.VapidKeys) {
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
                        this.keys = webpush.generateVAPIDKeys();
                    }
                }
            }
        } finally {
            if (!(this.keys.privateKey && this.keys.publicKey)) {
                this.keys = webpush.generateVAPIDKeys()
            }
            console.log("Reloaded VAPID keys");
        }
    }
}

export default new VapidKeysSettings();