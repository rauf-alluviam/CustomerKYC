import mongoose from 'mongoose';
import CustomerKycModel from './models/customerKycModel.mjs';
import dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Simple counts
    const totalRecords = await CustomerKycModel.countDocuments();
    const nonDraftRecords = await CustomerKycModel.countDocuments({ draft: { $ne: "true" } });
    const pendingRecords = await CustomerKycModel.countDocuments({ approval: "Pending" });
    const draftRecords = await CustomerKycModel.countDocuments({ draft: "true" });
    
    console.log('📊 Current Database State:');
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Non-draft records: ${nonDraftRecords}`);
    console.log(`   Draft records: ${draftRecords}`);
    console.log(`   Pending approval records: ${pendingRecords}`);
    
    // Get approval status breakdown for non-drafts
    const statusAggregation = await CustomerKycModel.aggregate([
      { $match: { draft: { $ne: "true" } } },
      { $group: { _id: "$approval", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📋 Non-draft records by approval status:');
    statusAggregation.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

main();
