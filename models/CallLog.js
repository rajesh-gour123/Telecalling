const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    // Employee who made the call
    employeeName: {
      type: String,
      required: true,
      trim: true
    },

    // Client details
    clientName: {
      type: String,
      required: true,
      trim: true
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true
    },

    // Manual call date & time
    callDate: {
      type: String, // YYYY-MM-DD
      required: true
    },

    callTime: {
      type: String, // HH:MM
      required: true
    },

    // Call result
    callStatus: {
      type: String,
      enum: [
        "Not Picked",
        "Busy",
        "Interested",
        "Not Interested",
        "Call Later"
      ],
      required: true
    },

    // What client said
    feedback: {
      type: String,
      trim: true
    },

    // Required only when Call Later
    followUpDate: {
      type: String // YYYY-MM-DD
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

module.exports = mongoose.model("CallLog", callLogSchema);
