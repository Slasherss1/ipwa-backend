import mongoose, { Schema } from "mongoose"

interface INotification {
    endpoint: string;
    keys: {
        auth: string;
        p256dh: string;
    };
    user: Schema.Types.ObjectId
    expirationTime?: number
}

const notifSchema = new Schema<INotification>({
    endpoint: {type: String, required: true},
    keys: {
        auth: String,
        p256dh: String,
    },
    user: {type: Schema.ObjectId, required: true},
    expirationTime: Number
})

export default mongoose.model("Notification", notifSchema)