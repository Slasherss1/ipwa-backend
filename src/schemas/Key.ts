import { Schema, Types, model } from "mongoose"

interface IKey {
    room: string;
    whom: Types.ObjectId;
    borrow: Date;
    tb?: Date;
}

const keySchema = new Schema<IKey>({
    room: {type: String, required: true},
    whom: {type: Schema.Types.ObjectId, ref: "logins", required: true},
    borrow: {type: Date, default: Date.now, required: true},
    tb: {type: Date}
})

export default model("key", keySchema)