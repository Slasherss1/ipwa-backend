import { PushSubscription, RequestOptions, SendResult, sendNotification } from "web-push";
import { readFileSync } from "fs";
import Notification from "./schemas/Notification";
import { allNotif, groupNotif, roomNotif, userNotif } from "./pipelines/notif";

export class NotifcationHelper {
    private options: RequestOptions
    constructor () {
        let keys = JSON.parse(readFileSync("./config/keys.json", 'utf-8'))
        this.options = {
            vapidDetails: {
                subject: "CHANGE ME",
                privateKey: keys.privateKey,
                publicKey: keys.publicKey
            }
        }
    }

    private async send(message: string, subscriptions: PushSubscription[]) {
        var count = 0;
        var subslen = subscriptions.length
        for (const v of subscriptions) {
            var result
            try {
                result = await sendNotification(v, message, this.options)
                count++
            } catch (error) {
                if (error.statusCode == 410) {
                    console.log("GONE")
                    await Notification.findOneAndDelete({endpoint: v.endpoint, keys: v.keys})
                    subslen--
                }
                else console.log(error)
            }
        }
        return {sent: count, possible: subslen}
    }

    private rcpt(message: string) {
        return {
            user: async (uname: string) => {
                return await this.send(message, await Notification.aggregate(userNotif(uname))) 
            },
            room: async (room: string) => {
                return await this.send(message, await Notification.aggregate(roomNotif(room)))
            },
            group: async (group: string) => {
                return await this.send(message, [])
            },
            withRoom: async () => {
                return await this.send(message, await Notification.aggregate(allNotif()))
            }
        }
    }
    
    simpleMessage(title: string, body: string) {
        return this.rcpt(JSON.stringify({notification: {title: title, body: body}}))
    }

}