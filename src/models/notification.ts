import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    category: {
        type: String,
        enum: ["scholarship", "announcement", "reminder"],
    },
    requires_action: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date,
        default: null
    },
    recipients: {
        type: [String],
        default: ["everyone"]
    },
    date_posted: {
        type: Date,
        default: Date.now
    },
    published_by: {
        type: String,
        default: "System"
    },
    is_read_by: {
        type: [String],
        default: []
    },
    is_acted_by: {
        type: [String],
        default: []
    },
});

// Create & Export Model
const Notifications = mongoose.models.Notifications || mongoose.model("Notifications", schema);
export default Notifications;
