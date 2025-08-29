import { RequestOptions, SendResult, VapidKeys, WebPushError, sendNotification } from "web-push";
import Notification, { INotification } from "./schemas/Notification";
import vapidKeys from "./vapidKeys";
import User, { IUser } from "./schemas/User";
import Inbox from "./schemas/Inbox";
import { Types } from "mongoose";
import sync from "./helpers/sync";

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
    private subscriptions: INotification[] | any[]
    private rcptIds: Types.ObjectId[]

    constructor(title: string, body: string, rcptType: "uid" | "room" | "group", rcpt: string) {
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

    private async findUserNotif(uid: string) {
        let notif = await Notification.find().populate<{ user: Pick<IUser, 'uname'> & { _id: Types.ObjectId } }>('user', ['uname', '_id']).exec()
        return notif.filter(val => val.user._id.toString() == uid)
    }

    private async findRoomNotif(room: string) {
        let notif = await Notification.find().populate<{ user: Pick<IUser, 'room'> & { _id: Types.ObjectId } }>('user', ['room', '_id']).exec()
        return notif.filter(val => val.user.room == room)
    }

    private async findGroupNotif(groupId: string) {
        let notif = await Notification.find().populate<{ user: Pick<IUser, 'groups'> & { _id: Types.ObjectId } }>('user', ['groups', '_id']).exec()
        return notif.filter(val => val.user.groups.find(x => x.toString() == groupId))
    }

    public async send(): Promise<PushResult | false> {
        await this.findRcpt()
        if (this.rcptIds.length > 0) {
            await Inbox.create({ message: this.message.notification, rcpt: this.rcptIds })
            for (const element of this.rcptIds) {
                sync.next(element, {type: "notif"})
            }
            return await this.push()
        } else {
            return false
        }
    }

    private async findRcpt() {
        switch (this.rcptType) {
            case "uid":
                this.subscriptions = await this.findUserNotif(this.rcpt)
                this.rcptIds = [new Types.ObjectId(this.rcpt)]
                break;
            case "room":
                this.subscriptions = await this.findRoomNotif(this.rcpt)
                this.rcptIds = (await User.find({ room: this.rcpt })).map(v => v._id)
                break;
            case "group":
                this.subscriptions = await this.findGroupNotif(this.rcpt)
                this.rcptIds = (await User.find({ groups: this.rcpt })).map(v => v._id)
                break;
            default:
                throw new Error(`Wrong recipient type used: ${this.rcptType}`);
        }
        return
    }

    private async push() {
        let count = 0;
        let subslen = this.subscriptions.length
        for (const v of this.subscriptions) {
            let result: SendResult
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

        return { sent: count, possible: subslen } as PushResult
    }
}