import mongoose, { Schema, Types } from "mongoose"

interface INews {
    content: string;
    title: string;
    date: Date;
    visible?: boolean;
    pinned?: boolean;
    author: Types.ObjectId
}

const newsSchema = new Schema<INews>({
    content: {type: String, required: true},
    title: {type: String, required: true},
    date: {type: Date, requred: true, default: Date.now},
    visible: {type: Boolean, default: false},
    pinned: {type: Boolean, default: false},
    author: {type: "ObjectId", ref: "logins", required: true}
})

export default mongoose.model("news", newsSchema)