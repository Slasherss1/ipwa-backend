import { PushSubscription, RequestOptions, VapidKeys, WebPushError, sendNotification } from "web-push";
import Notification from "./schemas/Notification";
import vapidKeys from "./vapidKeys";
import { IUser } from "./schemas/User";

export class NotifcationHelper {
    private options: RequestOptions
    constructor () {
        let keys: VapidKeys = vapidKeys.keys
        this.options = {
            vapidDetails: {
                subject: `https://${process.env.DOMAIN}`,
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
                if (error instanceof WebPushError) {
                    switch (error.statusCode) {
                        case 410:
                            console.log("GONE")
                            await Notification.findOneAndDelete({endpoint: v.endpoint, keys: v.keys})
                            subslen--
                            break;
                        case 404:
                            console.warn("NOT FOUND", error.message)
                            await Notification.findOneAndDelete(v)
                            subslen--
                            break;
                        default:
                            console.log(error)
                            break;
                    }
                }
            }
        }
        return {sent: count, possible: subslen}
    }

    private rcpt(message: string) {
        return {
            user: async (uname: string) => {
                return await this.send(message, await this.findUserNotif(uname)) 
            },
            room: async (room: string) => {
                return await this.send(message, await this.findRoomNotif(room))
            },
            group: async (group: string) => {
                return await this.send(message, await this.findGroupNotif(group))
            }
        }
    }
    
    simpleMessage(title: string, body: string) {
        return this.rcpt(JSON.stringify({notification: {title: title, body: body}}))
    }

    async findUserNotif(uname: string): Promise<Array<any>> {
        var notif = await Notification.find().populate<{user: Pick<IUser, 'uname'>}>('user', 'uname').exec()
        return notif.filter(val => val.user.uname == uname)
    }

    async findRoomNotif(room: string): Promise<Array<any>> {
        var notif = await Notification.find().populate<{user: Pick<IUser, 'room'>}>('user', 'room').exec()
        return notif.filter(val => val.user.room == room)
    }

    async findGroupNotif(groupId: string): Promise<Array<any>>  {
        var notif = await Notification.find().populate<{user: Pick<IUser, 'groups'>}>('user', 'groups').exec()
        return notif.filter(val => val.user.groups.find(x => x.toString() == groupId))
    }
}