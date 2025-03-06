import mongoose, { Schema } from "mongoose"

interface INews {
    content: string;
    title: string;
    date: Date;
    visible?: boolean;
    pinned?: boolean
}

const newsSchema = new Schema<INews>({
    content: {type: String, required: true},
    title: {type: String, required: true},
    date: {type: Date, requred: true, default: Date.now},
    visible: {type: Boolean, default: false},
    pinned: {type: Boolean, default: false}
})

export default mongoose.model("news", newsSchema)