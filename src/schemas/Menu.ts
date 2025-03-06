import mongoose, { Schema } from "mongoose"

interface IMenu {
    sn: {
        fancy: string[];
        second: string;
    };
    ob: {
        soup: string;
        vege: string;
        meal: string;
        condiments: string[];
        drink: string;
        other: string[];
    };
    kol: string;
    day: Date;
    dayTitle?: string;
}

const menuSchema = new Schema<IMenu>({
    sn: {
        fancy: {type: [String]},
        second: {type: String, default: ""}
    },
    ob: {
        soup: {type: String, default: ""},
        vege: {type: String, default: ""},
        meal: {type: String, default: ""},
        condiments: {type: [String]},
        drink: {type: String, default: ""},
        other: {type: [String]},
    },
    kol: {type: String, default: ""},
    day: {type: Date, required: true},
    dayTitle: {type: String, default: ""}
})

export default mongoose.model("menu", menuSchema, "menu")