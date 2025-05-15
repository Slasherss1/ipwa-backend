import { Job, scheduleJob } from "node-schedule";

interface IAttendence {
    auto: {
        _id: string;
        hour?: string
    }[];
    notes: string;
}

class Attendence {
    private attendence = new Map<string, IAttendence>();
    private job: Job
    constructor () {
        this.job = scheduleJob("0 0 * * *", () => {
            this.attendence.clear()
        })
    }

    setRoom (room: string, att: IAttendence) {
        this.attendence.set(room, att)
    }

    clearRoom (room: string) {
        this.attendence.delete(room)
    }

    getRoom (room: string) {
        return this.attendence.get(room)
    }

    summary () {
        var summary: {room: string, hours: string[], notes: string}[] = []
        this.attendence.forEach((v, k) => {
            summary.push({room: k, hours: v.auto.map(i => i.hour), notes: v.notes})
        })
        return summary
    }
}

export default new Attendence()