import mongoose, { Schema } from "mongoose";

const meetingscheme = new Schema(
    {
        user_id: { type: String },
        meeting_id: { type: String, required: true },
        data: { type: Date, default: Date.now, required: true }
    }
)

const Meeting = mongoose.model("Meeting", meetingscheme);

export { Meeting };