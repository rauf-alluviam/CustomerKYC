// Test script for customer name sanitization
// Run with: node test-customer-name-sanitization.js

// Copy the sanitization function for testing
const sanitizeCustomerName = (customerName) => {
  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    return 'Unknown_Customer';
  }
  
  // Sanitize the customer name:
  // 1. Trim whitespace
  // 2. Replace spaces with underscores
  // 3. Replace special characters with underscores
  // 4. Remove consecutive underscores
  // 5. Remove leading/trailing underscores
  // 6. Ensure it's not empty after sanitization
  const sanitized = customerName
    .trim()
    .replace(/\s+/g, '_')                    // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_-]/g, '_')         // Replace special chars with underscores
    .replace(/_+/g, '_')                     // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '');               // Remove leading/trailing underscores
  
  return sanitized || 'Unknown_Customer';
};

// Test cases
const testCases = [
  { input: 'John Doe', expected: 'John_Doe' },
  { input: 'John   Doe', expected: 'John_Doe' },
  { input: '  John Doe  ', expected: 'John_Doe' },
  { input: 'John & Doe Inc.', expected: 'John_Doe_Inc' },
  { input: 'ABC@123 Company!', expected: 'ABC_123_Company' },
  { input: 'Company-Name', expected: 'Company-Name' },
  { input: 'company_name', expected: 'company_name' },
  { input: '___John___Doe___', expected: 'John_Doe' },
  { input: '', expected: 'Unknown_Customer' },
  { input: '   ', expected: 'Unknown_Customer' },
  { input: null, expected: 'Unknown_Customer' },
  { input: undefined, expected: 'Unknown_Customer' },
  { input: 'José María González', expected: 'Jos_Mar_a_Gonz_lez' },
  { input: '123 Main St. Ltd.', expected: '123_Main_St_Ltd' },
  { input: '!@#$%^&*()', expected: 'Unknown_Customer' },
];

console.log('🧪 Testing Customer Name Sanitization Function\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = sanitizeCustomerName(testCase.input);
  const passed = result === testCase.expected;
  
  if (passed) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: PASSED`);
  } else {
    console.log(`❌ Test ${index + 1}: FAILED`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got: "${result}"`);
  }
});

console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! The sanitization function is working correctly.');
} else {
  console.log('⚠️  Some tests failed. Please review the sanitization logic.');
}

// Example S3 paths that would be generated
console.log('\n📁 Example S3 paths that would be generated:');
const examples = [
  'John Doe',
  'ABC Company Ltd.',
  'José María González',
  '',
  'Special@Characters#123!'
];

examples.forEach(name => {
  const sanitized = sanitizeCustomerName(name);
  console.log(`"${name}" → customers/${sanitized}/documents/`);
});
