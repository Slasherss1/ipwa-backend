import { ObjectId, Schema, model } from "mongoose"

interface IGroup {
    name: string;
}

const groupSchema = new Schema<IGroup>({
    name: {type: String, required: true}
})

export default model("group", groupSchema)