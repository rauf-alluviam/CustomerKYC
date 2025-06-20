import express from "express";
import CustomerKycModel from "./models/customerKycModel.mjs";

const router = express.Router();

router.patch("/update-customer-kyc/:_id", async (req, res) => {
  const { _id } = req.params;
  const updateData = req.body;

  if (!_id) {
    return res.status(400).json({ message: "Customer KYC ID is required" });
  }

  try {
    // Find the specific record by _id and update it
    const updatedKyc = await CustomerKycModel.findByIdAndUpdate(
      _id,
      { 
        ...updateData, 
        approval: "Pending", // Reset to pending after revision
        remarks: "", // Clear any previous remarks
        draft: "false" // Ensure it's not a draft
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validation
      }
    );

    if (!updatedKyc) {
      return res.status(404).json({ message: "Customer KYC record not found" });
    }

    res.status(200).json({ 
      message: "KYC details updated successfully",
      data: updatedKyc 
    });
  } catch (error) {
    console.error("Error updating customer KYC:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
