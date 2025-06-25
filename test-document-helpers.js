// Test file to verify document helper functions

// Mock data similar to what you provided
const testData = {
  authorised_signatories: [],
  authorisation_letter: [],
  iec_copy: [
    "https://exim-test-upload.s3.ap-south-1.amazonaws.com/kyc_documents/default-customer/iec_copy/sample_4__1750758537753.pdf",
    "https://exim-test-upload.s3.ap-south-1.amazonaws.com/kyc_documents/default-customer/iec_copy/dummy_6__1750758549254.pdf"
  ],
  pan_copy: [],
  individual_passport_img: [],
  company_certificate_of_incorporation_img: []
};

// Test the isValidFileUrl function logic
function isValidFileUrl(url) {
  if (!url) return false;
  
  if (Array.isArray(url)) {
    return url.length > 0 && url.some(item => typeof item === 'string' && item.trim() !== '');
  }
  
  if (typeof url !== 'string') {
    return false;
  }
  
  return url.trim() !== '';
}

// Test cases
console.log('Testing document helper functions:');
console.log('');

console.log('Empty arrays (should return false):');
console.log('authorised_signatories:', isValidFileUrl(testData.authorised_signatories));
console.log('authorisation_letter:', isValidFileUrl(testData.authorisation_letter));
console.log('pan_copy:', isValidFileUrl(testData.pan_copy));
console.log('individual_passport_img:', isValidFileUrl(testData.individual_passport_img));
console.log('');

console.log('Array with valid URLs (should return true):');
console.log('iec_copy:', isValidFileUrl(testData.iec_copy));
console.log('');

console.log('MultipleViewButtons should render null for empty arrays and components for valid arrays');
