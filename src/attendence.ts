import { Job, scheduleJob } from "node-schedule";

class Attendence {
    private attendence = new Map<string, {_id: string, hour?: string}[]>();
    private job: Job
    constructor () {
        this.job = scheduleJob("0 0 * * *", () => {
            this.attendence.clear()
        })
    }

    setRoom (room: string, att: {_id: string, hour?: string}[]) {
        this.attendence.set(room, att)
    }

    getRoom (room: string) {
        return this.attendence.get(room)
    }

    summary () {
        var summary: {room: string, hours: string[]}[] = []
        this.attendence.forEach((v, k) => {
            summary.push({room: k, hours: v.map(i => i.hour)})
        })
        return summary
    }
}

export default new Attendence()