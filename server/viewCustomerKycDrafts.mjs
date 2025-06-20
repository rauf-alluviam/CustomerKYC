import express from "express";
import CustomerKycModel from "./models/customerKycModel.mjs";

const router = express.Router();

router.get("/view-customer-kyc-drafts", async (req, res) => {
  try {
    const data = await CustomerKycModel.find({ draft: "true" }).select(
      "_id name_of_individual category status iec_no approval remarks"
    );
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
});

export default router;
