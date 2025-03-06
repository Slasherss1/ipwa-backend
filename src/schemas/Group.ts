import { ObjectId, Schema, model } from "mongoose"

interface IGroup {
    name: string;
    rooms?: number[];
    unames?: string[];
}

const groupSchema = new Schema<IGroup>({
    name: {type: String, required: true},
    rooms: [Schema.Types.Number],
    unames: [Schema.Types.String]
})

export default model("group", groupSchema)