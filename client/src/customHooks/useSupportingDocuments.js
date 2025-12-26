import { useState } from 'react';
import FileUpload from '../utils/FileUpload';
import ImagePreview from '../utils/ImagePreview';

const useSupportingDocuments = (formik, onDbUpdate = null) => {
  const [fileSnackbar, setFileSnackbar] = useState(false);

  // Helper to render a file input block
  const renderFileInput = (label, fieldName, multiple = false) => (
    <div key={fieldName} style={{ marginBottom: '1.5rem' }}>
      <label className="form-label" style={{ color: 'var(--slate-700)' }}>
        {label}
      </label>
      <FileUpload
        label={`Upload ${label}`}
        onFilesUploaded={(uploadedUrls, appendFiles = true) => {
          if (multiple) {
            const currentFiles = formik.values[fieldName] || [];
            const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
            formik.setFieldValue(fieldName, newFiles);
          } else {
            formik.setFieldValue(fieldName, uploadedUrls[0]);
          }
          setFileSnackbar(true);
          setTimeout(() => setFileSnackbar(false), 3000);
        }}
        bucketPath={fieldName.replace(/_/g, '-')}
        multiple={multiple}
        appendFiles={multiple}
        customerName={formik.values.name_of_individual}
        acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
      />
      {formik.values[fieldName] && (formik.values[fieldName].length > 0 || typeof formik.values[fieldName] === 'string') && (
        <div style={{ marginTop: '0.75rem' }}>
          <ImagePreview
            images={Array.isArray(formik.values[fieldName]) ? formik.values[fieldName] : [formik.values[fieldName]]}
            onDeleteImage={(index) => {
              if (Array.isArray(formik.values[fieldName])) {
                const updatedImages = formik.values[fieldName].filter((_, i) => i !== index);
                formik.setFieldValue(fieldName, updatedImages);
              } else {
                formik.setFieldValue(fieldName, "");
              }
              // Call database update if callback is provided
              if (onDbUpdate) {
                onDbUpdate(index, fieldName);
              }
            }}
            showDeleteForAdmin={true}
          />
        </div>
      )}
    </div>
  );

  const getSupportingDocs = () => {
    const category = formik.values.category;

    const renderSection = (title, inputs) => (
      <div className="form-section">
        <h4 className="section-title" style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-700)' }}>
          {title}
        </h4>
        <div className="grid-2">
          {inputs}
        </div>
      </div>
    );

    switch (category) {
      case 'Individual/ Proprietary Firm':
        return renderSection('Supporting Documents - Individual/Proprietary Firm', [
          renderFileInput('Passport', 'individual_passport_img', true),
          renderFileInput('Voter Card', 'individual_voter_card_img', true),
          renderFileInput('Driving License', 'individual_driving_license_img', true),
          renderFileInput('Bank Statement', 'individual_bank_statement_img', true),
          renderFileInput('Ration Card', 'individual_ration_card_img', true),
          renderFileInput('Aadhar Card', 'individual_aadhar_card', true)
        ]);

      case 'Partnership Firm':
        return renderSection('Supporting Documents - Partnership Firm', [
          renderFileInput('Registration Certificate', 'partnership_registration_certificate_img', true),
          renderFileInput('Partnership Deed', 'partnership_deed_img', true),
          renderFileInput('Power of Attorney', 'partnership_power_of_attorney_img', true),
          renderFileInput('Valid Document', 'partnership_valid_document', true),
          renderFileInput('Aadhar Card Front Photo', 'partnership_aadhar_card_front_photo', true),
          renderFileInput('Aadhar Card Back Photo', 'partnership_aadhar_card_back_photo', true),
          renderFileInput('Telephone Bill', 'partnership_telephone_bill', true)
        ]);

      case 'Company':
        return renderSection('Supporting Documents - Company', [
          renderFileInput('Certificate of Incorporation', 'company_certificate_of_incorporation_img', true),
          renderFileInput('Memorandum of Association', 'company_memorandum_of_association_img', true),
          renderFileInput('Articles of Association', 'company_articles_of_association_img', true),
          renderFileInput('Power of Attorney', 'company_power_of_attorney_img', true),
          renderFileInput('Telephone Bill', 'company_telephone_bill_img', true),
          renderFileInput('PAN Allotment Letter', 'company_pan_allotment_letter_img', true)
        ]);

      case 'Trust Foundations':
        return renderSection('Supporting Documents - Trust/Foundation', [
          renderFileInput('Certificate of Registration', 'trust_certificate_of_registration_img', true),
          renderFileInput('Power of Attorney', 'trust_power_of_attorney_img', true),
          renderFileInput('Officially Valid Document', 'trust_officially_valid_document_img', true),
          renderFileInput('Resolution of Managing Body', 'trust_resolution_of_managing_body_img', true),
          renderFileInput('Telephone Bill', 'trust_telephone_bill_img', true)
        ]);

      default:
        return null;
    }
  };

  return {
    getSupportingDocs,
    fileSnackbar,
    setFileSnackbar
  };
};

export default useSupportingDocuments;
