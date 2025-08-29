import { Types } from "mongoose";
import { Observer, Subject } from "rxjs";

export interface SyncEvent {
    type: string
}

class SyncHelper {
    private userSubjects = new Map<string, Subject<SyncEvent>>()
    public subscribe(uid: Types.ObjectId, observer: Observer<SyncEvent> | ((value: SyncEvent) => void)) {
        const uid_s = uid.toString()
        if (!this.userSubjects.has(uid_s)) {
            this.userSubjects.set(uid_s, new Subject())
        }
        return this.userSubjects.get(uid_s).asObservable().subscribe(observer)
    }

    public next(uid: Types.ObjectId, value: SyncEvent) {
        const uid_s = uid.toString()
        if (this.userSubjects.has(uid_s)) {
            this.userSubjects.get(uid_s).next(value)
        }
    }

    nextEach(value: SyncEvent) {
        this.userSubjects.forEach(v => {
            v.next(value)
        })
    }

}

export default new SyncHelper();