import { useState } from 'react';
import FileUpload from '../utils/FileUpload';
import ImagePreview from '../utils/ImagePreview';

const useSupportingDocuments = (formik) => {
  const [fileSnackbar, setFileSnackbar] = useState(false);

  const getSupportingDocs = () => {
    const category = formik.values.category;
    
  const renderFileInput = (label, fieldName, multiple = false) => (
    <div key={fieldName} style={{ 
      background: '#fffefe',
      border: '1px solid #d6e6ff',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <label style={{ 
        display: 'block',
        fontWeight: 'bold',
        fontSize: '16px',
        color: '#2c3e50',
        marginBottom: '12px'
      }}>
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
      {formik.values[fieldName] && (
        <div style={{ marginTop: '12px' }}>
          <ImagePreview
            images={Array.isArray(formik.values[fieldName]) ? formik.values[fieldName] : [formik.values[fieldName]]}
            onDeleteImage={(index) => {
              if (Array.isArray(formik.values[fieldName])) {
                const updatedImages = formik.values[fieldName].filter((_, i) => i !== index);
                formik.setFieldValue(fieldName, updatedImages);
              } else {
                formik.setFieldValue(fieldName, "");
              }
            }}
          />
        </div>
      )}
    </div>
  );

    switch (category) {
      case 'Individual/ Proprietary Firm':
        return (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '24px',
              borderBottom: '2px solid #d6e6ff',
              paddingBottom: '8px'
            }}>
              Supporting Documents - Individual/Proprietary Firm
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginTop: '16px'
            }}>
              {renderFileInput('Passport', 'individual_passport_img', true)}
              {renderFileInput('Voter Card', 'individual_voter_card_img', true)}
              {renderFileInput('Driving License', 'individual_driving_license_img', true)}
              {renderFileInput('Bank Statement', 'individual_bank_statement_img', true)}
              {renderFileInput('Ration Card', 'individual_ration_card_img', true)}
              {renderFileInput('Aadhar Card', 'individual_aadhar_card', true)}
            </div>
          </div>
        );

      case 'Partnership Firm':
        return (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '24px',
              borderBottom: '2px solid #d6e6ff',
              paddingBottom: '8px'
            }}>
              Supporting Documents - Partnership Firm
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginTop: '16px'
            }}>
              {renderFileInput('Registration Certificate', 'partnership_registration_certificate_img', true)}
              {renderFileInput('Partnership Deed', 'partnership_deed_img', true)}
              {renderFileInput('Power of Attorney', 'partnership_power_of_attorney_img', true)}
              {renderFileInput('Valid Document', 'partnership_valid_document', true)}
              {renderFileInput('Aadhar Card Front Photo', 'partnership_aadhar_card_front_photo', true)}
              {renderFileInput('Aadhar Card Back Photo', 'partnership_aadhar_card_back_photo', true)}
              {renderFileInput('Telephone Bill', 'partnership_telephone_bill', true)}
            </div>
          </div>
        );

      case 'Company':
        return (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '24px',
              borderBottom: '2px solid #d6e6ff',
              paddingBottom: '8px'
            }}>
              Supporting Documents - Company
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginTop: '16px'
            }}>
              {renderFileInput('Certificate of Incorporation', 'company_certificate_of_incorporation_img', true)}
              {renderFileInput('Memorandum of Association', 'company_memorandum_of_association_img', true)}
              {renderFileInput('Articles of Association', 'company_articles_of_association_img', true)}
              {renderFileInput('Power of Attorney', 'company_power_of_attorney_img', true)}
              {renderFileInput('Telephone Bill', 'company_telephone_bill_img', true)}
              {renderFileInput('PAN Allotment Letter', 'company_pan_allotment_letter_img', true)}
            </div>
          </div>
        );

      case 'Trust Foundations':
        return (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '24px',
              borderBottom: '2px solid #d6e6ff',
              paddingBottom: '8px'
            }}>
              Supporting Documents - Trust/Foundation
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginTop: '16px'
            }}>
              {renderFileInput('Certificate of Registration', 'trust_certificate_of_registration_img', true)}
              {renderFileInput('Power of Attorney', 'trust_power_of_attorney_img', true)}
              {renderFileInput('Officially Valid Document', 'trust_officially_valid_document_img', true)}
              {renderFileInput('Resolution of Managing Body', 'trust_resolution_of_managing_body_img', true)}
              {renderFileInput('Telephone Bill', 'trust_telephone_bill_img', true)}
            </div>
          </div>
        );

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
