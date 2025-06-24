#!/usr/bin/env node

// Test script to verify form validation is working
console.log("Testing Customer KYC Form Validation...");

// Check if validation schema is properly imported
try {
  const validationSchema = require('./client/src/schemas/customerKyc/customerKycSchema.js');
  console.log("✅ Validation schema imported successfully");
  
  // Test validation with empty form data
  const testData = {
    category: "",
    name_of_individual: "",
    status: "",
    permanent_address_line_1: "",
    permanent_address_city: "",
    permanent_address_state: "",
    permanent_address_pin_code: "",
    permanent_address_telephone: "",
    permanent_address_email: "",
    principle_business_address_line_1: "",
    principle_business_address_city: "",
    principle_business_address_state: "",
    principle_business_address_pin_code: "",
    principle_business_telephone: "",
    principle_address_email: "",
    iec_no: "",
    pan_no: "",
    factory_addresses: [{
      factory_address_line_1: "",
      factory_address_city: "",
      factory_address_state: "",
      factory_address_pin_code: "",
      gst: "",
    }],
    banks: [{
      bankers_name: "",
      branch_address: "",
      account_no: "",
      ifsc: "",
      adCode: "",
    }]
  };

  validationSchema.validationSchema.validateSync(testData);
  console.log("❌ Validation should have failed for empty form");
} catch (error) {
  if (error.name === 'ValidationError') {
    console.log("✅ Validation correctly failed for empty form");
    console.log("   Required field errors:", error.errors.length);
  } else {
    console.log("❌ Unexpected error:", error.message);
  }
}

console.log("Test completed!");
