import { RequestOptions, SendResult, VapidKeys, WebPushError, sendNotification } from "web-push";
import Notification from "./schemas/Notification";
import vapidKeys from "./vapidKeys";
import User, { IUser } from "./schemas/User";
import Inbox from "./schemas/Inbox";
import { Types } from "mongoose";

export interface SimpleMessage {
    title: string;
    body: string;
}

export interface PushResult {
    sent: number;
    possible: number;
}

export class Message {
    private options: RequestOptions
    private message: { notification: SimpleMessage }
    private rcptType: "uid" | "room" | "group"
    private rcpt: string
    
    constructor (title: string, body: string, rcptType: "uid" | "room" | "group", rcpt: string) {
        let keys: VapidKeys = vapidKeys.keys
        this.options = {
            vapidDetails: {
                subject: `https://${process.env.DOMAIN}`,
                privateKey: keys.privateKey,
                publicKey: keys.publicKey
            }
        }
        this.message = { notification: { title: title, body: body } }
        this.rcptType = rcptType
        this.rcpt = rcpt
    }

    async findUserNotif(uid: string) {
        var notif = await Notification.find().populate<{user: Pick<IUser, 'uname'> & {_id: Types.ObjectId}}>('user', ['uname', '_id']).exec()
        return notif.filter(val => val.user._id.toString() == uid)
    }

    async findRoomNotif(room: string) {
        var notif = await Notification.find().populate<{user: Pick<IUser, 'room'> & {_id: Types.ObjectId}}>('user', ['room', '_id']).exec()
        return notif.filter(val => val.user.room == room)
    }

    async findGroupNotif(groupId: string)  {
        var notif = await Notification.find().populate<{user: Pick<IUser, 'groups'> & {_id: Types.ObjectId}}>('user', ['groups', '_id']).exec()
        return notif.filter(val => val.user.groups.find(x => x.toString() == groupId))
    }

    public async send(): Promise<PushResult> {
        var subscriptions
        var rcptIds: Types.ObjectId[]
        switch (this.rcptType) {
            case "uid":
                subscriptions = await this.findUserNotif(this.rcpt)
                rcptIds = [new Types.ObjectId(this.rcpt)]
                break;
            case "room":
                subscriptions = await this.findRoomNotif(this.rcpt)
                rcptIds = (await User.find({room: this.rcpt})).map(v => v._id)
                break;
            case "group":
                subscriptions = await this.findGroupNotif(this.rcpt)
                rcptIds = (await User.find({groups: this.rcpt})).map(v => v._id)
                break;
            default:
                throw new Error(`Wrong recipient type used: ${this.rcptType}`);
        }

        await Inbox.create({message: this.message.notification, rcpt: rcptIds})

        var count = 0;
        var subslen = subscriptions.length
        for (const v of subscriptions) {
            var result: SendResult
            try {
                result = await sendNotification(v, JSON.stringify(this.message), this.options)
                count++
            } catch (error) {
                if (error instanceof WebPushError) {
                    switch (error.statusCode) {
                        case 410:
                            console.log("GONE")
                            await Notification.findByIdAndRemove(v._id)
                            subslen--
                            break;
                        case 404:
                            console.warn("NOT FOUND", error.message)
                            await Notification.findByIdAndRemove(v._id)
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
}