import { project } from "@/utility";
import { PathOrFileDescriptor, readFileSync, writeFileSync } from "node:fs";

export class FileHandler<T> {
    protected _value: T
    public get value(): T {
        return this._value;
    }
    public set value(value: T) {
        this._value = value
        this.save()
    }

    constructor(public path: PathOrFileDescriptor, public settings?: {
        defaultContent?: T,
        name?: string,
        project?: (keyof T)[] | { [key in keyof T]: any}
    }) {
        try {
            this._value = JSON.parse(readFileSync(path, 'utf-8'))
            console.log("Loaded user settings");
        } catch (error) {
            if (error instanceof Error) {
                if ('code' in error) {
                    if (error.code === "ENOENT") {
                        writeFileSync(path, JSON.stringify(settings.defaultContent, undefined, 2))
                        console.log(`Created ${settings.name}`);
                    }
                }
            }
        }
    }
    
    private save() {
        writeFileSync(this.path, JSON.stringify(project(this._value, this.settings.project), undefined, 2))
    }

    public reload() {
        this._value = JSON.parse(readFileSync(this.path, { encoding: "utf-8" }))
        console.log(`Reloaded ${this.settings.name}`);
    }
}