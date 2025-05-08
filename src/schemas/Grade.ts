import { Schema, model } from "mongoose"

export interface GradeNote {
    label: string;
    weight: number;
}

interface IGrade {
    grade?: number;
    date: Date;
    gradeDate?: Date;
    room: string;
    notes?: GradeNote[];
    tips: string;
}

const gradeSchema = new Schema<IGrade>({
    grade: Number,
    date: {type: Date, required: true},
    gradeDate: Date,
    room: {type: String, required: true},
    notes: [Object],
    tips: String,
})

export default model("grade", gradeSchema)