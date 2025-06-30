import mongoose, { Types, Schema } from "mongoose"

export interface INotification {
    endpoint: string;
    keys: {
        auth: string;
        p256dh: string;
    };
    user: Types.ObjectId
    expirationTime?: number
}

const notifSchema = new Schema<INotification>({
    endpoint: {type: String, required: true},
    keys: {
        auth: String,
        p256dh: String,
    },
    user: {type: Schema.ObjectId, required: true, ref: "logins"},
    expirationTime: Number
})

export default mongoose.model("Notification", notifSchema)