import mongoose, { Schema } from "mongoose";

interface IVote {
    timestamp: Date;
    user: mongoose.Types.ObjectId;
    dom: Date;
    tom: "sn" | "ob" | "kol" | "soup" | "cd" | "dr" | "other";
    name: string;
    vote: {
        "rating": number;
        "comment": string;
        "tags": string[];
    }
}

const voteSchema = new Schema<IVote>({
    timestamp: {type: Date, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, required: true},
    dom: {type: Date, required: true},
    tom: {type: String, required: true},
    vote: {type: Object, required: true},
    name: {type: String, required: true}
})

export default mongoose.model("vote", voteSchema)