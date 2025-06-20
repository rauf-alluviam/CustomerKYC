# Database Schema Migration Summary

## Issue
The frontend file upload enhancement caused validation errors because the database schema expected string values for file fields, but the frontend now sends arrays due to multiple upload support.

## Database Schema Changes Made

### File Fields Updated to Accept Arrays

#### Banking Schema (`bankSchema`)
- **adCode_file**: Changed from `String` to `[{type: String}]`

#### Factory Address Schema (`factoryAddressSchema`)
- **gst_reg**: Changed from `String` to `[{type: String}]`

#### Main Customer KYC Schema (`customerKycSchema`)

**Authorization Documents:**
- **authorised_signatories**: Changed from `String` to `[{type: String}]`
- **authorisation_letter**: Changed from `String` to `[{type: String}]`

**IEC Documents:**
- **iec_copy**: Changed from `String` to `[{type: String}]`

**PAN Documents:**
- **pan_copy**: Changed from `String` to `[{type: String}]`

**Other Documents:**
- **spcb_reg**: Changed from `String` to `[{type: String}]`

**Individual/Proprietary Firm Documents:**
- **individual_passport_img**: Changed from `String` to `[{type: String}]`
- **individual_voter_card_img**: Changed from `String` to `[{type: String}]`
- **individual_driving_license_img**: Changed from `String` to `[{type: String}]`
- **individual_bank_statement_img**: Changed from `String` to `[{type: String}]`
- **individual_ration_card_img**: Changed from `String` to `[{type: String}]`
- **individual_aadhar_card**: Changed from `String` to `[{type: String}]`

**Partnership Firm Documents:**
- **partnership_registration_certificate_img**: Changed from `String` to `[{type: String}]`
- **partnership_deed_img**: Changed from `String` to `[{type: String}]`
- **partnership_power_of_attorney_img**: Changed from `String` to `[{type: String}]`
- **partnership_valid_document**: Changed from `String` to `[{type: String}]`
- **partnership_aadhar_card_front_photo**: Changed from `String` to `[{type: String}]`
- **partnership_aadhar_card_back_photo**: Changed from `String` to `[{type: String}]`
- **partnership_telephone_bill**: Changed from `String` to `[{type: String}]`

**Company Documents:**
- **company_certificate_of_incorporation_img**: Changed from `String` to `[{type: String}]`
- **company_memorandum_of_association_img**: Changed from `String` to `[{type: String}]`
- **company_articles_of_association_img**: Changed from `String` to `[{type: String}]`
- **company_power_of_attorney_img**: Changed from `String` to `[{type: String}]`
- **company_telephone_bill_img**: Changed from `String` to `[{type: String}]`
- **company_pan_allotment_letter_img**: Changed from `String` to `[{type: String}]`

**Trust/Foundation Documents:**
- **trust_certificate_of_registration_img**: Changed from `String` to `[{type: String}]`
- **trust_power_of_attorney_img**: Changed from `String` to `[{type: String}]`
- **trust_officially_valid_document_img**: Changed from `String` to `[{type: String}]`
- **trust_resolution_of_managing_body_img**: Changed from `String` to `[{type: String}]`
- **trust_telephone_bill_img**: **ADDED NEW FIELD** as `[{type: String}]`

## Additional Fixes Applied

### Frontend Changes
1. **Fixed AD Code File Upload**: Replaced manual file input with FileUpload component in banking section
2. **Added Missing Trust Document**: Added `trust_telephone_bill_img` to supporting documents hook
3. **Enhanced File Upload Logic**: All file upload sections now properly handle multiple files

### Validation Fixes
- All cast errors should be resolved as database now accepts arrays for file fields
- Backward compatibility maintained for existing single file uploads

## Migration Notes
- **Existing Data**: Single string values in existing documents will still work (MongoDB accepts both single values and arrays)
- **New Data**: All new uploads will be stored as arrays
- **No Data Loss**: Existing file URLs remain valid and accessible

## Files Modified
1. `/server/models/customerKycModel.mjs` - Database schema updates
2. `/client/src/components/CustomerKycForm.js` - Fixed AD Code file upload
3. `/client/src/customHooks/useSupportingDocuments.js` - Added missing trust telephone bill

## Testing Required
- Test form submission with multiple file uploads
- Verify existing data still displays correctly
- Test all document types across different customer categories
- Confirm file deletion and replacement functionality
