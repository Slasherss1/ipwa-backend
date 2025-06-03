import { SimpleMessage } from "@/notif"
import mongoose, { Types, Schema } from "mongoose"

export interface IInbox {
    message: SimpleMessage,
    sentDate: Date,
    rcpt: Types.ObjectId[],
    ack: Types.ObjectId[]
}

const inboxSchema = new Schema<IInbox>({
    message: {type: Object, required: true},
    sentDate: {type: Date, required: true, default: Date.now()},
    rcpt: [{type: Schema.Types.ObjectId, ref: "logins", required: true}],
    ack: [{type: Schema.Types.ObjectId, ref: "logins", required: true, default: []}],
})

export default mongoose.model("inbox", inboxSchema)