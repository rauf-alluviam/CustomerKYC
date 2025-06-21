import mongoose from 'mongoose';
import CustomerKyc from './models/customerKycModel.mjs';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/customerkyc';

async function fixNullApprovalStatus() {
    try {
        // Connect to MongoDB
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB');

        // First, let's get a count of all records by status and approval_status
        const allCounts = await CustomerKyc.aggregate([
            {
                $group: {
                    _id: { status: '$status', approval_status: '$approval_status' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.status': 1, '_id.approval_status': 1 } }
        ]);

        console.log('\n📊 Current data distribution:');
        allCounts.forEach(item => {
            console.log(`   status: "${item._id.status}", approval_status: "${item._id.approval_status}" => ${item.count} records`);
        });

        // First, let's check the actual data structure
        const sampleRecord = await CustomerKyc.findOne();
        console.log('\n🔍 Sample record structure:', {
            approval_status: sampleRecord?.approval_status,
            status: sampleRecord?.status,
            customer_name: sampleRecord?.customer_name
        });

        // Find records with null/undefined approval status that are not drafts
        const recordsWithNullApproval = await CustomerKyc.find({
            $and: [
                { status: { $ne: 'draft' } },
                { status: { $ne: '' } }, // Exclude empty status
                { $or: [
                    { approval_status: null },
                    { approval_status: { $exists: false } },
                    { approval_status: 'undefined' },
                    { approval_status: undefined }
                ]}
            ]
        });

        console.log(`\n🔍 Found ${recordsWithNullApproval.length} records with null/missing approval status:`);
        
        if (recordsWithNullApproval.length > 0) {
            // Show sample records before update
            console.log('\n📋 Sample records to be updated:');
            recordsWithNullApproval.slice(0, 5).forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.customer_name} (${record.status}) - approval_status: ${record.approval_status}`);
            });

            if (recordsWithNullApproval.length > 5) {
                console.log(`   ... and ${recordsWithNullApproval.length - 5} more records`);
            }

            // Update all records with null/missing approval_status to "Pending"
            const updateResult = await CustomerKyc.updateMany(
                {
                    $and: [
                        { status: { $ne: 'draft' } },
                        { $or: [
                            { approval_status: null },
                            { approval_status: { $exists: false } }
                        ]}
                    ]
                },
                {
                    $set: { approval_status: 'Pending' }
                }
            );

      

            // Verify the fix
    
            const verificationCounts = await CustomerKyc.aggregate([
                { $match: { status: { $ne: 'draft' } } },
                {
                    $group: {
                        _id: '$approval_status',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            console.log('\n📊 Updated approval status distribution:');
            let totalPending = 0;
            verificationCounts.forEach(item => {
                console.log(`   ${item._id || 'null'}: ${item.count}`);
                if (item._id === 'Pending') {
                    totalPending = item.count;
                }
            });


        } else {
            console.log('✅ No records found with null approval status. Data is already clean!');
        }

    } catch (error) {
        console.error('❌ Error fixing null approval status:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the fix
fixNullApprovalStatus();
