const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pin: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ location: "2dsphere" });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
