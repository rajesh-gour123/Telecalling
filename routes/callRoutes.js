// const express = require("express");
// const router = express.Router();
// const CallLog = require("../models/CallLog");

// /*
//   POST /calls/add
//   Save one call record
// */
// router.post("/add", async (req, res) => {
//   try {
//     const {
//       employeeName,
//       clientName,
//       mobileNumber,
//       callDate,
//       callTime,
//       callStatus,
//       feedback,
//       followUpDate
//     } = req.body;

//     // basic validation
//     if (
//       !employeeName ||
//       !clientName ||
//       !mobileNumber ||
//       !callDate ||
//       !callTime ||
//       !callStatus
//     ) {
//       return res.status(400).json({
//         message: "Required fields are missing"
//       });
//     }

//     // follow-up rule
//     if (callStatus === "Call Later" && !followUpDate) {
//       return res.status(400).json({
//         message: "Follow-up date is required for Call Later"
//       });
//     }

//     const newCall = new CallLog({
//       employeeName,
//       clientName,
//       mobileNumber,
//       callDate,
//       callTime,
//       callStatus,
//       feedback,
//       followUpDate
//     });

//     await newCall.save();

//     res.status(201).json({
//       message: "Call saved successfully"
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message
//     });
//   }
// });

// /*
//   GET /calls/list
//   List all call records
// */
// router.get("/list", async (req, res) => {
//   try {
//     const calls = await CallLog.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       totalCalls: calls.length,
//       data: calls
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to fetch call logs",
//       error: err.message
//     });
//   }
// });

// module.exports = router;
