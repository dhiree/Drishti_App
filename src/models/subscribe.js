const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);