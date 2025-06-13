import { Perms } from "@/utility";
import mongoose, { Types, Schema } from "mongoose"

export interface IUser {
    uname: string;
    pass: string;
    room?: string;
    admin?: Perms[];
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
    admin: [{type: String}],
    locked: {type: Boolean, default: false},
    fname: {type: String, default: ""},
    surname: {type: String, default: ""},
    groups: [{type: mongoose.Types.ObjectId, ref: "Group"}],
    regDate: {type: Date, default: Date.now},
    defaultPage: {type: String, default: ""},
})

userSchema.index({uname: "text", room: "text", fname: "text", surname: "text"}, {weights: {fname: 3, surname: 4, room: 2, uname: 1}, default_language: "none"})

export default mongoose.model("logins", userSchema)