import mongoose, { Schema } from "mongoose"

// TODO: Unify `fname` and `surename` into single field

interface IUser {
    uname: string;
    pass: string;
    room?: number;
    admin?: number;
    locked?: boolean;
    fname?: string;
    surname?: string;
}

const userSchema = new Schema<IUser>({
    uname: {type: String, required: true},
    pass: {type: String, required: true, default: "$2y$10$wxDhf.XiXkmdKrFqYUEa0.F4Bf.pDykZaMmgjvyLyeRP3E/Xy0hbC"},
    room: Number,
    admin: Number,
    locked: {type: Boolean, default: false},
    fname: String,
    surname: String
})

export default mongoose.model("logins", userSchema)