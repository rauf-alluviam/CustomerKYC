import express from "express";
import CustomerKycModel from "./models/customerKycModel.mjs";

const router = express.Router();

router.get("/view-completed-kyc", async (req, res) => {
  try {
    const data = await CustomerKycModel.find({
      approval: { $in: ["Approved", "Approved by HOD"] },
    }).select(
      "_id name_of_individual category status iec_no approval approved_by remarks"
    );
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching completed KYC data:", err);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: "Failed to fetch completed KYC data" 
    });
  }
});

export default router;
