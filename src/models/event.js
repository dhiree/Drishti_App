const mongoose = require("mongoose");
const { TIME_INTERVALS } = require("../common/utils/constants");

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
}, { _id: false });

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["online", "offline"],
    },
    aol: {
      type: [String],
      enum: ["event", "course", "follow-up"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      from: { type: mongoose.Schema.Types.Date },
      to: { type: mongoose.Schema.Types.Date },
    },
    timeOffset: String,
    duration: [
      {
        from: { type: String, enum: TIME_INTERVALS },
        to: { type: String, enum: TIME_INTERVALS },
      },
    ],
    meetingLink: {
      type: String,
      trim: true,
    },
    recurring: Boolean,
    description: [],
    address: [],
    phoneNumber: String,
    registrationLink: String,
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number],
    },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: {
      type: mongoose.Schema.Types.Date,
    },
    notifyTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    imagesAndCaptions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        images: [
          {
            caption: String,
            isPrivate: false,
            image: String,
          },
        ],
      },
    ],
    subscribers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, name: { type: String } }],
    participants: [participantSchema],
  },
  {
    timestamps: true,
  }
);
eventSchema.index({ "location.coordinates": "2dsphere" });

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
