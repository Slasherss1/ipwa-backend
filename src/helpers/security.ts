import { Job, scheduleJob } from "node-schedule";
import usettings from "./usettings";
import { Types } from "mongoose";

interface IAccTimeout {
    firstAttempt: Date;
    expire: Job;
    attempts: number;
}

class SecurityHelper {
    private timeouts = new Map<string, IAccTimeout>();
    private onTimeout = new Map<string, Job>(); // key: user id, value: unlock date
    constructor () { }

    addAttempt (userId: Types.ObjectId) {
        var uid = userId.toString()
        if (this.timeouts.has(uid)) {
            var t = this.timeouts.get(uid)
            t.attempts += 1
            if (t.attempts > usettings.settings.security.loginTimeout.attempts) {
                this.onTimeout.set(uid, scheduleJob(new Date(Date.now() + usettings.settings.security.loginTimeout.lockout * 1000), () => {
                    this.onTimeout.get(uid).cancel()
                    this.onTimeout.delete(uid)
                }))
            } else {
                this.timeouts.set(uid, t)
            }
        } else {
            this.timeouts.set(uid, {
                attempts: 1,
                firstAttempt: new Date(),
                expire: scheduleJob(new Date(Date.now() + usettings.settings.security.loginTimeout.time * 1000), () => {
                    this.timeouts.get(uid).expire.cancel()
                    this.timeouts.delete(uid)
                })
            })
            
        }
    }

    check(userId: Types.ObjectId) {
        var timeout = this.onTimeout.get(userId.toString())
        if (timeout) {
            // @ts-ignore
            return timeout.nextInvocation().toDate().valueOf() - Date.now().valueOf()
        } else {
            return false
        }
    }

    clearAcc(userId: string) {
        return this.onTimeout.delete(userId)
    }
}

export default new SecurityHelper()