import mongoose from 'mongoose';
import CustomerKycModel from './models/customerKycModel.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Detailed investigation of Pending records
const investigatePendingRecords = async () => {
  try {
    console.log('🔍 Investigating Pending status records...\n');
    
    // Get all records with "Pending" status (what Customer KYC Status shows)
    const allPendingRecords = await CustomerKycModel.find({ 
      approval: "Pending",
      draft: { $ne: "true" }
    }).select('_id name_of_individual approval draft iec_no');
    
    console.log(`📊 All non-draft records with "Pending" status: ${allPendingRecords.length}`);
    
    // Get records that HOD Approval Pending endpoint returns
    const hodPendingRecords = await CustomerKycModel.find({ 
      approval: "Pending" 
    }).select('_id name_of_individual approval draft iec_no');
    
    console.log(`🏛️  Records returned by HOD Approval Pending endpoint: ${hodPendingRecords.length}`);
    
    // Find the difference
    const hodPendingIds = hodPendingRecords.map(r => r._id.toString());
    const missingRecords = allPendingRecords.filter(r => 
      !hodPendingIds.includes(r._id.toString())
    );
    
    if (missingRecords.length > 0) {
      console.log(`\n⚠️  ${missingRecords.length} records are missing from HOD Approval Pending:`);
      missingRecords.slice(0, 10).forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.name_of_individual} - ID: ${record._id} - Draft: ${record.draft}`);
      });
    }
    
    // Check for any draft records with "Pending" status
    const draftPendingRecords = await CustomerKycModel.find({ 
      approval: "Pending",
      draft: "true"
    }).select('_id name_of_individual approval draft iec_no');
    
    if (draftPendingRecords.length > 0) {
      console.log(`\n📝 Draft records with "Pending" status: ${draftPendingRecords.length}`);
      draftPendingRecords.slice(0, 5).forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.name_of_individual} - ID: ${record._id}`);
      });
    }
    
    // Verify the exact query that HOD Approval Pending uses
    console.log('\n🔍 Testing exact HOD Approval Pending query...');
    const exactHodQuery = await CustomerKycModel.find({ approval: "Pending" });
    console.log(`   Direct query result: ${exactHodQuery.length} records`);
    
    // Check for any data type issues
    const pendingWithDraftCheck = await CustomerKycModel.find({ 
      approval: "Pending"
    }).select('approval draft');
    
    const draftTypes = {};
    pendingWithDraftCheck.forEach(record => {
      const draftValue = record.draft;
      const draftType = typeof draftValue;
      const key = `${draftValue} (${draftType})`;
      draftTypes[key] = (draftTypes[key] || 0) + 1;
    });
    
    console.log('\n📊 Draft field analysis for Pending records:');
    Object.entries(draftTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} records`);
    });
    
  } catch (error) {
    console.error('❌ Error investigating records:', error);
  }
};

// Main execution
const main = async () => {
  console.log('🔍 Investigating Pending Records Discrepancy\n');
  
  await connectDB();
  await investigatePendingRecords();
  
  console.log('\n✅ Investigation completed');
  await mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});
