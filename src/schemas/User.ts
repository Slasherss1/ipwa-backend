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
    defaultPage: string;
}

const userSchema = new Schema<IUser>({
    uname: {type: String, required: true},
    pass: {type: String, required: true, default: "$2y$10$wxDhf.XiXkmdKrFqYUEa0.F4Bf.pDykZaMmgjvyLyeRP3E/Xy0hbC"},
    room: {type: String, default: ""},
    admin: Number,
    locked: {type: Boolean, default: false},
    fname: {type: String, default: ""},
    surname: {type: String, default: ""},
    groups: [{type: mongoose.Types.ObjectId, ref: "Group"}],
    regDate: {type: Date, default: Date.now},
    defaultPage: {type: String, default: ""},
})

export default mongoose.model("logins", userSchema)