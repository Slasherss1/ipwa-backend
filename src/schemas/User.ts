import mongoose, { Types, Schema } from "mongoose"

// TODO: Unify `fname` and `surename` into single field

export interface IUser {
    uname: string;
    pass: string;
    room?: string;
    admin?: number;
    locked?: boolean;
    fname?: string;
    surname?: string;
    groups: Types.ObjectId[];
    regDate: Date;
}

const userSchema = new Schema<IUser>({
    uname: {type: String, required: true},
    pass: {type: String, required: true, default: "$2y$10$wxDhf.XiXkmdKrFqYUEa0.F4Bf.pDykZaMmgjvyLyeRP3E/Xy0hbC"},
    room: String,
    admin: Number,
    locked: {type: Boolean, default: false},
    fname: String,
    surname: String,
    groups: [{type: mongoose.Types.ObjectId, ref: "Group"}],
    regDate: {type: Date, default: Date.now}
})

export default mongoose.model("logins", userSchema)