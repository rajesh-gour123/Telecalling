const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    callDate: {
      type: Date,
      required: true,
    },
    callTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Interested", "Not Interested", "Call later", "Not reachable"],
      required: true,
    },
    feedback: String,
    followUpDate: Date,
  },
  { timestamps: true }
);

// ✅ SAFE follow-up rule (no next)
callSchema.pre("save", async function () {
  if (this.status === "Call later" && !this.followUpDate) {
    throw new Error("Follow-up date required for Call later status");
  }
});

module.exports = mongoose.model("Call", callSchema);
