import mongoose from "mongoose";

const schema = new mongoose.Schema({
    fileUrl: {
        type: String,
        required: true,
    },
    scholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scholarship",
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    comment: {
        type: String,
    },
    recipients: {
        type: [String],
        required: true,
    },
    uploaded_by: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Contract = mongoose.models.Contract || mongoose.model("Contract", schema);
export default Contract;