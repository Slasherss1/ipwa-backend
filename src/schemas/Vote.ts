import mongoose, { Schema } from "mongoose";

interface IVote {
    doc: Date;
    user: mongoose.Types.ObjectId;
    dom: Date;
    tom: "ob" | "kol";
    vote: "-" | "+" | "n";
}

const voteSchema = new Schema<IVote>({
    doc: {type: Date, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, required: true},
    dom: {type: Date, required: true},
    tom: {type: String, required: true},
    vote: {type: String, required: true},
})

export default mongoose.model("vote", voteSchema)