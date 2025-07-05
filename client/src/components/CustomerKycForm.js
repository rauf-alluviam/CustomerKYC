import React, { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import useSupportingDocuments from "../customHooks/useSupportingDocuments";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import FileUpload from "../utils/FileUpload";
import ImagePreview from "../utils/ImagePreview";
import { handleFileUpload } from "../utils/awsFileUpload";
import Checkbox from "@mui/material/Checkbox";
import Preview from "./Preview";
import { getCityAndStateByPinCode } from "../utils/getCityAndStateByPinCode";
import BackButton from "./BackButton";
import { useSnackbar } from "../contexts/SnackbarContext";
import { UserContext } from "../contexts/UserContext";
import { validationSchema } from "../schemas/customerKyc/customerKycSchema";
import { draftValidationSchema, hasMinimumDraftData } from "../schemas/customerKyc/draftValidationSchema";

function CustomerKycForm() {
  // Get current user context for permission checks
  const { user } = useContext(UserContext);
  
  const [submitType, setSubmitType] = useState("");
  const [open, setOpen] = React.useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [validationSnackbar, setValidationSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
    fieldCount: 0,
    submitType: ""
  });
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  
  const { showError, showSuccess, showWarning } = useSnackbar();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Auto-dismiss validation snackbar after 6 seconds
  useEffect(() => {
    if (validationSnackbar.open) {
      const timer = setTimeout(() => {
        setValidationSnackbar(prev => ({ ...prev, open: false }));
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [validationSnackbar.open]);

  const formik = useFormik({
    initialValues: {
      category: "",
      name_of_individual: "",
      status: "",
      // Branch addresses
      factory_addresses: [
        {
          factory_address_line_1: "",
          factory_address_line_2: "",
          factory_address_city: "",
          factory_address_state: "",
          factory_address_pin_code: "",
          gst: "",
          gst_reg: [],
        },
      ],
      permanent_address_line_1: "",
      permanent_address_line_2: "",
      permanent_address_city: "",
      permanent_address_state: "",
      permanent_address_pin_code: "",
      permanent_address_telephone: "",
      permanent_address_email: "",
      // Principal business addresses
      principle_business_address_line_1: "",
      principle_business_address_line_2: "",
      principle_business_address_city: "",
      principle_business_address_state: "",
      principle_business_address_pin_code: "",
      principle_business_telephone: "",
      principle_address_email: "",
      principle_business_website: "",
      sameAsPermanentAddress: false,

      authorised_signatories: [],
      authorisation_letter: [],
      iec_no: "",
      iec_copy: [],
      pan_no: "",
      pan_copy: [],
      banks: [
        {
          bankers_name: "",
          branch_address: "",
          account_no: "",
          ifsc: "",
          adCode: "",
          adCode_file: [],
        },
      ],
      other_documents: [],
      spcb_reg: [],
      kyc_verification_images: [],
      gst_returns: [],

      // individual
      individual_passport_img: [],
      individual_voter_card_img: [],
      individual_driving_license_img: [],
      individual_bank_statement_img: [],
      individual_ration_card_img: [],
      individual_aadhar_card: [],

      // partnership
      partnership_registration_certificate_img: [],
      partnership_deed_img: [],
      partnership_power_of_attorney_img: [],
      partnership_valid_document: [],
      partnership_aadhar_card_front_photo: [],
      partnership_aadhar_card_back_photo: [],
      partnership_telephone_bill: [],

      // company
      company_certificate_of_incorporation_img: [],
      company_memorandum_of_association_img: [],
      company_articles_of_association_img: [],
      company_power_of_attorney_img: [],
      company_telephone_bill_img: [],
      company_pan_allotment_letter_img: [],

      // trust
      trust_certificate_of_registration_img: [],
      trust_power_of_attorney_img: [],
      trust_officially_valid_document_img: [],
      trust_resolution_of_managing_body_img: [],
      trust_telephone_bill_img: [],
      trust_name_of_trustees: "",
      trust_name_of_founder: "",
      trust_address_of_founder: "",
      trust_telephone_of_founder: "",
      trust_email_of_founder: "",
    },
    // Use a dynamic validation function that checks submit type
    validate: (values) => {
      // Choose schema based on submit type
      const schema = submitType === "save_draft" ? draftValidationSchema : validationSchema;
      
      try {
        // Synchronously validate using Yup
        schema.validateSync(values, { abortEarly: false });
        return {}; // No errors
      } catch (err) {
        // Convert Yup ValidationError to formik errors format
        const errors = {};
        if (err.inner) {
          err.inner.forEach((error) => {
            if (error.path) {
              errors[error.path] = error.message;
            }
          });
        }
        return errors;
      }
    },
    onSubmit: async (values, { resetForm, setErrors, setTouched, validateForm }) => {
      try {
        // Validate form based on submit type
        const errors = await validateForm();
        
        // Check if form has validation errors
        if (Object.keys(errors).length > 0) {
          console.log("Validation errors:", errors);
          console.log("Submit type:", submitType);
          
          if (submitType === "save_draft") {
            // For draft, only show errors if basic requirements aren't met
            if (errors.iec_no || errors.name_of_individual) {
              setValidationSnackbar({
                open: true,
                message: "Please fill IEC number and name to save as draft",
                severity: "warning",
                fieldCount: Object.keys(errors).length,
                submitType: "save_draft"
              });
              
              // Touch only the required draft fields
              setTouched({
                iec_no: true,
                name_of_individual: true,
              });
              
              return;
            }
            // If only IEC and name are filled, proceed with draft save
          } else {
            // For final submission, enforce full validation
            setTouched({
              category: true,
              name_of_individual: true,
              status: true,
              permanent_address_line_1: true,
              permanent_address_city: true,
              permanent_address_state: true,
              permanent_address_pin_code: true,
              permanent_address_telephone: true,
              permanent_address_email: true,
              principle_business_address_line_1: true,
              principle_business_address_city: true,
              principle_business_address_state: true,
              principle_business_address_pin_code: true,
              principle_business_telephone: true,
              principle_address_email: true,
              iec_no: true,
              pan_no: true,
              factory_addresses: values.factory_addresses?.map(() => ({
                factory_address_line_1: true,
                factory_address_city: true,
                factory_address_state: true,
                factory_address_pin_code: true,
                gst: true,
              })),
              banks: values.banks?.map(() => ({
                bankers_name: true,
                branch_address: true,
                account_no: true,
                ifsc: true,
                adCode: true,
              })),
            });
            
            // Find the first error field and scroll to it
            scrollToFirstError(errors);
            
            // Show custom validation snackbar with field-specific message
            const errorCount = countErrors(errors);
            const firstErrorField = getFirstErrorFieldName(errors);
            
            // Enhanced user-friendly message
            let userMessage = "";
            
            if (errorCount === 1) {
              userMessage = `Please fill the required field to submit for approval: ${firstErrorField}`;
            } else if (errorCount <= 5) {
              userMessage = `Please fill ${errorCount} required fields to submit for approval. First missing: ${firstErrorField}`;
            } else {
              userMessage = `Please complete the form to submit for approval. ${errorCount} required fields are missing. First: ${firstErrorField}`;
            }
            
            setValidationSnackbar({
              open: true,
              message: userMessage,
              severity: "error",
              fieldCount: errorCount,
              submitType: submitType
            });
            
            return;
          }
        }

        validateBanks(values.banks);

        let res;
        if (submitType === "save_draft") {
          console.log("Saving draft with values:", { iec_no: values.iec_no, name_of_individual: values.name_of_individual });
          res = await axios.post(
            `${process.env.REACT_APP_API_STRING}/customer-kyc-draft`,
            { ...values, draft: "true" }
          );
          showSuccess(res.data.message);
          resetForm();
        } else if (submitType === "save") {
          const res = await axios.post(
            `${process.env.REACT_APP_API_STRING}/add-customer-kyc`,
            { ...values, approval: "Pending" }
          );

          showSuccess(res.data.message);
          resetForm();
        }
        localStorage.removeItem("kycFormValues");
      } catch (error) {
        console.error("Error during submission", error);
      }
    },
  });

  const { getSupportingDocs, fileSnackbar, setFileSnackbar } =
    useSupportingDocuments(formik);

  // Clear All Form Function
  const handleClearAll = () => {
    // Reset formik to initial values
    formik.resetForm();
    
    // Clear localStorage
    localStorage.removeItem("kycFormValues");
    
    // Reset all state
    setSubmitType("");
    setSubmissionAttempted(false);
    setValidationSnackbar({
      open: false,
      message: "",
      severity: "error",
      fieldCount: 0,
      submitType: ""
    });
    setShowClearConfirmation(false);
    
    // Show success message
    showSuccess("Form cleared successfully! All data has been reset.");
  };

  const handleClearConfirmation = () => {
    setShowClearConfirmation(true);
  };

  // Save form data to localStorage every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("kycFormValues", JSON.stringify(formik.values));
    }, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [formik.values]);

  useEffect(() => {
    // Load form values from localStorage
    const storedValues = JSON.parse(localStorage.getItem("kycFormValues"));
    if (storedValues) {
      formik.setValues(storedValues);
    }
  }, []);

  const handleAddField = () => {
    formik.setValues({
      ...formik.values,
      factory_addresses: [
        ...formik.values.factory_addresses,
        {
          factory_address_line_1: "",
          factory_address_line_2: "",
          factory_address_city: "",
          factory_address_state: "",
          factory_address_pin_code: "",
          gst: "",
          gst_reg: [],
        },
      ],
    });
  };

  const handleAddBanks = () => {
    formik.setValues({
      ...formik.values,
      banks: [
        ...formik.values.banks,
        {
          bankers_name: "",
          branch_address: "",
          account_no: "",
          ifsc: "",
          adCode: "",
          adCode_file: [],
        },
      ],
    });
  };

  const handleRemoveField = (index) => {
    if (formik.values.factory_addresses.length > 1) {
      const updatedAddresses = formik.values.factory_addresses.filter((_, i) => i !== index);
      formik.setValues({
        ...formik.values,
        factory_addresses: updatedAddresses,
      });
    }
  };

  const handleRemoveBank = (index) => {
    if (formik.values.banks.length > 1) {
      const updatedBanks = formik.values.banks.filter((_, i) => i !== index);
      formik.setValues({
        ...formik.values,
        banks: updatedBanks,
      });
    }
  };

  const handleSameAsPermanentAddress = (event) => {
    if (event.target.checked) {
      formik.setValues({
        ...formik.values,
        principle_business_address_line_1:
          formik.values.permanent_address_line_1,
        principle_business_address_line_2:
          formik.values.permanent_address_line_2,
        principle_business_address_city: formik.values.permanent_address_city,
        principle_business_address_state: formik.values.permanent_address_state,
        principle_business_address_pin_code:
          formik.values.permanent_address_pin_code,
        principle_business_telephone: formik.values.permanent_address_telephone,
        principle_address_email: formik.values.permanent_address_email,
        sameAsPermanentAddress: true,
      });
    } else {
      formik.setValues({
        ...formik.values,
        sameAsPermanentAddress: false,
      });
    }
  };

  useEffect(() => {
    const fetchCityAndState = async () => {
      if (formik.values.permanent_address_pin_code?.length === 6) {
        const data = await getCityAndStateByPinCode(
          formik.values.permanent_address_pin_code
        );
        if (data) {
          formik.setFieldValue("permanent_address_city", data.city);
          formik.setFieldValue("permanent_address_state", data.state);
        }
      }

      if (formik.values.principle_business_address_pin_code?.length === 6) {
        const data = await getCityAndStateByPinCode(
          formik.values.principle_business_address_pin_code
        );
        if (data) {
          formik.setFieldValue("principle_business_address_city", data.city);
          formik.setFieldValue("principle_business_address_state", data.state);
        }
      }
    };

    fetchCityAndState();

    // eslint-disable-next-line
  }, [
    formik.values.permanent_address_pin_code,
    formik.values.principle_business_address_pin_code,
  ]);

  const validateBanks = (banks) => {
    const errors = [];

    // banks.forEach((bank, index) => {
    //   if (bank.adCode?.length !== 7) {
    //     errors.push("Invalid AD code");
    //   }

    //   // Check if bankers_name contains special characters
    //   if (/[^a-zA-Z0-9\s]/.test(bank.bankers_name)) {
    //     errors.push("Banker's Name should not contain special characters");
    //   }

    //   // Check if account_no contains non-digit characters
    //   if (!/^\d+$/.test(bank.account_no)) {
    //     errors.push("Account No should contain digits only");
    //   }
    // });

    if (errors?.length > 0) {
      showError(errors.join("\n"));
    }

    return errors;
  };

  // Start a new form
  const handleNewForm = () => {
    formik.resetForm();
  };

  // Helper function to count total errors
  const countErrors = (errors) => {
    let count = 0;
    const countNestedErrors = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          countNestedErrors(obj[key]);
        } else if (Array.isArray(obj[key])) {
          obj[key].forEach(item => {
            if (typeof item === 'object' && item !== null) {
              countNestedErrors(item);
            } else if (item) {
              count++;
            }
          });
        } else if (obj[key]) {
          count++;
        }
      });
    };
    countNestedErrors(errors);
    return count;
  };

  // Helper function to get the first error field name in a user-friendly format
  const getFirstErrorFieldName = (errors) => {
    const fieldNames = {
      category: "Category",
      name_of_individual: "Name of Individual/Firm/Company",
      status: "Status of Exporter/Importer",
      permanent_address_line_1: "Permanent Address Line 1",
      permanent_address_city: "Permanent Address City",
      permanent_address_state: "Permanent Address State",
      permanent_address_pin_code: "Permanent Address PIN Code",
      permanent_address_telephone: "Permanent Address Mobile",
      permanent_address_email: "Permanent Address Email",
      principle_business_address_line_1: "Principal Business Address Line 1",
      principle_business_address_city: "Principal Business Address City",
      principle_business_address_state: "Principal Business Address State",
      principle_business_address_pin_code: "Principal Business Address PIN Code",
      principle_business_telephone: "Principal Business Mobile",
      principle_address_email: "Principal Business Email",
      iec_no: "IEC Number",
      pan_no: "PAN Number",
      factory_addresses: "Factory Address",
      banks: "Banking Information"
    };

    const findFirstError = (obj, prefix = '') => {
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          const result = findFirstError(obj[key], fullKey);
          if (result) return result;
        } else if (Array.isArray(obj[key])) {
          for (let i = 0; i < obj[key].length; i++) {
            if (typeof obj[key][i] === 'object' && obj[key][i] !== null) {
              const result = findFirstError(obj[key][i], `${fullKey}[${i}]`);
              if (result) return result;
            } else if (obj[key][i]) {
              return fieldNames[key] || key;
            }
          }
        } else if (obj[key]) {
          return fieldNames[key] || key;
        }
      }
      return null;
    };

    return findFirstError(errors) || "Unknown field";
  };

  // Helper function to scroll to the first error field
  const scrollToFirstError = (errors) => {
    const findFirstErrorElement = (obj, prefix = '') => {
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          const result = findFirstErrorElement(obj[key], fullKey);
          if (result) return result;
        } else if (Array.isArray(obj[key])) {
          for (let i = 0; i < obj[key].length; i++) {
            if (typeof obj[key][i] === 'object' && obj[key][i] !== null) {
              const result = findFirstErrorElement(obj[key][i], `${fullKey}[${i}]`);
              if (result) return result;
            } else if (obj[key][i]) {
              return `${fullKey}[${i}]`;
            }
          }
        } else if (obj[key]) {
          return fullKey;
        }
      }
      return null;
    };

    const firstErrorField = findFirstErrorElement(errors);
    if (firstErrorField) {
      // Convert field name to element ID
      const elementId = firstErrorField.replace(/\[(\d+)\]/g, '[$1]');
      const element = document.getElementById(elementId);
      
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add visual highlight to the field
        element.style.transition = 'box-shadow 0.3s ease';
        element.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          element.style.boxShadow = '';
        }, 3000);
        
        // Focus the element
        element.focus();
      }
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="kyc-form-container">
      {/* Clean Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '16px 0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          color: '#1f2937', 
          margin: '0 auto',
          textAlign: 'center',
          flex: 1,
          fontWeight: 500,
          fontSize: '1.75rem'
        }}>
          Customer KYC Form
        </h2>
      </div>
      
      {/* Category Section */}
      <div className={`form-grid-section ${formik.touched.category && formik.errors.category ? 'validation-error-field' : ''}`}>
        <FormControl sx={{ marginBottom: "24px" }}>
          <FormLabel 
            id="category-label"
            sx={{ 
              fontWeight: 500,
              color: formik.touched.category && formik.errors.category ? '#ef4444' : '#374151',
              marginBottom: '12px',
              fontSize: '0.95rem',
            }}
          >
            Category *
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="category-label"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            sx={{
              gap: '24px',
              '& .MuiFormControlLabel-root': {
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                  color: '#4b5563'
                },
              },
            }}
          >
            <FormControlLabel
              value="Individual/ Proprietary Firm"
              control={<Radio />}
              label="Individual/Proprietary Firm"
            />
            <FormControlLabel
              value="Partnership Firm"
              control={<Radio />}
              label="Partnership Firm"
            />
            <FormControlLabel
              value="Company"
              control={<Radio />}
              label="Company"
            />
            <FormControlLabel
              value="Trust Foundations"
              control={<Radio />}
              label="Trust/ Foundation"
            />
          </RadioGroup>
        </FormControl>
        {formik.touched.category && formik.errors.category ? (
          <div className="enhanced-error-message">{formik.errors.category}</div>
        ) : null}
      </div>

      {/* Individual Information Section */}
      <div className="form-grid-section">
        <h4 className="section-title">Individual Information</h4>
        <div className="form-grid">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="name_of_individual"
            name="name_of_individual"
            label="Name of Individual/Firm/Company * (Required for Draft)"
            value={formik.values.name_of_individual}
            onChange={formik.handleChange}
            error={
              formik.touched.name_of_individual &&
              Boolean(formik.errors.name_of_individual)
            }
            helperText={
              formik.touched.name_of_individual && formik.errors.name_of_individual
            }
            className={`clean-input ${formik.touched.name_of_individual && formik.errors.name_of_individual ? 'validation-error-field' : ''}`}
          />
        </div>

        {/* Status Section */}
        <FormControl sx={{ marginTop: "24px" }}>
          <FormLabel 
            id="status-label"
            sx={{ 
              fontWeight: 500,
              color: formik.touched.status && formik.errors.status ? '#ef4444' : '#374151',
              marginBottom: '12px',
              fontSize: '0.95rem',
            }}
          >
            Status of Exporter/Importer *
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="status-label"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            sx={{
              gap: '24px',
              '& .MuiFormControlLabel-root': {
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                  color: '#4b5563'
                },
              },
            }}
          >
            <FormControlLabel
              value="Manufacturer"
              control={<Radio />}
              label="Manufacturer"
            />
            <FormControlLabel 
              value="Trader" 
              control={<Radio />} 
              label="Trader" 
            />
          </RadioGroup>
        </FormControl>
        {formik.touched.status && formik.errors.status ? (
          <div className="enhanced-error-message">{formik.errors.status}</div>
        ) : null}
      </div>

      {/* Permanent Address Section */}
      <div className="form-grid-section">
        <h4 className="section-title">Permanent Address</h4>
        <div className="form-grid">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_line_1"
            name="permanent_address_line_1"
            label="Address Line 1 *"
            value={formik.values.permanent_address_line_1}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_line_1 &&
              Boolean(formik.errors.permanent_address_line_1)
            }
            helperText={
              formik.touched.permanent_address_line_1 &&
              formik.errors.permanent_address_line_1
            }
            className={`clean-input ${formik.touched.permanent_address_line_1 && formik.errors.permanent_address_line_1 ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_line_2"
            name="permanent_address_line_2"
            label="Address Line 2"
            value={formik.values.permanent_address_line_2}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_line_2 &&
              Boolean(formik.errors.permanent_address_line_2)
            }
            helperText={
              formik.touched.permanent_address_line_2 &&
              formik.errors.permanent_address_line_2
            }
            className="clean-input"
          />
        </div>

        <div className="form-grid form-grid-3">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_pin_code"
            name="permanent_address_pin_code"
            label="PIN Code *"
            value={formik.values.permanent_address_pin_code}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_pin_code &&
              Boolean(formik.errors.permanent_address_pin_code)
            }
            helperText={
              formik.touched.permanent_address_pin_code &&
              formik.errors.permanent_address_pin_code
            }
            className={`clean-input ${formik.touched.permanent_address_pin_code && formik.errors.permanent_address_pin_code ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_city"
            name="permanent_address_city"
            label="City *"
            value={formik.values.permanent_address_city}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_city &&
              Boolean(formik.errors.permanent_address_city)
            }
            helperText={
              formik.touched.permanent_address_city &&
              formik.errors.permanent_address_city
            }
            className={`clean-input ${formik.touched.permanent_address_city && formik.errors.permanent_address_city ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_state"
            name="permanent_address_state"
            label="State *"
            value={formik.values.permanent_address_state}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_state &&
              Boolean(formik.errors.permanent_address_state)
            }
            helperText={
              formik.touched.permanent_address_state &&
              formik.errors.permanent_address_state
            }
            className={`clean-input ${formik.touched.permanent_address_state && formik.errors.permanent_address_state ? 'validation-error-field' : ''}`}
          />
        </div>

        <div className="form-grid form-grid-2">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_telephone"
            name="permanent_address_telephone"
            label="Mobile *"
            value={formik.values.permanent_address_telephone}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_telephone &&
              Boolean(formik.errors.permanent_address_telephone)
            }
            helperText={
              formik.touched.permanent_address_telephone &&
              formik.errors.permanent_address_telephone
            }
            className={`clean-input ${formik.touched.permanent_address_telephone && formik.errors.permanent_address_telephone ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_email"
            name="permanent_address_email"
            label="Email *"
            value={formik.values.permanent_address_email}
            onChange={formik.handleChange}
            error={
              formik.touched.permanent_address_email &&
              Boolean(formik.errors.permanent_address_email)
            }
            helperText={
              formik.touched.permanent_address_email &&
              formik.errors.permanent_address_email
            }
            className={`clean-input ${formik.touched.permanent_address_email && formik.errors.permanent_address_email ? 'validation-error-field' : ''}`}
          />
        </div>
      </div>

      {/* Principal Business Address Section */}
      <div className="form-grid-section">
        <h4 className="section-title">Principal Business Address</h4>
        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values.sameAsPermanentAddress}
              onChange={handleSameAsPermanentAddress}
              sx={{
                color: '#6b7280',
                '&.Mui-checked': {
                  color: '#3b82f6',
                },
              }}
            />
          }
          label="Same as Permanent Address"
          sx={{ 
            marginBottom: '16px',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.9rem',
              color: '#4b5563'
            },
          }}
        />

        <div className="form-grid">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_line_1"
            name="principle_business_address_line_1"
            label="Address Line 1 *"
            value={formik.values.principle_business_address_line_1}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_address_line_1 &&
              Boolean(formik.errors.principle_business_address_line_1)
            }
            helperText={
              formik.touched.principle_business_address_line_1 &&
              formik.errors.principle_business_address_line_1
            }
            className={`clean-input ${formik.touched.principle_business_address_line_1 && formik.errors.principle_business_address_line_1 ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_line_2"
            name="principle_business_address_line_2"
            label="Address Line 2"
            value={formik.values.principle_business_address_line_2}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_address_line_2 &&
              Boolean(formik.errors.principle_business_address_line_2)
            }
            helperText={
              formik.touched.principle_business_address_line_2 &&
              formik.errors.principle_business_address_line_2
            }
            className="clean-input"
          />
        </div>

        <div className="form-grid form-grid-3">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_pin_code"
            name="principle_business_address_pin_code"
            label="PIN Code *"
            value={formik.values.principle_business_address_pin_code}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_address_pin_code &&
              Boolean(formik.errors.principle_business_address_pin_code)
            }
            helperText={
              formik.touched.principle_business_address_pin_code &&
              formik.errors.principle_business_address_pin_code
            }
            className={`clean-input ${formik.touched.principle_business_address_pin_code && formik.errors.principle_business_address_pin_code ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_city"
            name="principle_business_address_city"
            label="City *"
            value={formik.values.principle_business_address_city}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_address_city &&
              Boolean(formik.errors.principle_business_address_city)
            }
            helperText={
              formik.touched.principle_business_address_city &&
              formik.errors.principle_business_address_city
            }
            className={`clean-input ${formik.touched.principle_business_address_city && formik.errors.principle_business_address_city ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_state"
            name="principle_business_address_state"
            label="State *"
            value={formik.values.principle_business_address_state}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_address_state &&
              Boolean(formik.errors.principle_business_address_state)
            }
            helperText={
              formik.touched.principle_business_address_state &&
              formik.errors.principle_business_address_state
            }
            className={`clean-input ${formik.touched.principle_business_address_state && formik.errors.principle_business_address_state ? 'validation-error-field' : ''}`}
          />
        </div>

        <div className="form-grid form-grid-3">
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_telephone"
            name="principle_business_telephone"
            label="Mobile *"
            value={formik.values.principle_business_telephone}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_telephone &&
              Boolean(formik.errors.principle_business_telephone)
            }
            helperText={
              formik.touched.principle_business_telephone &&
              formik.errors.principle_business_telephone
            }
            className={`clean-input ${formik.touched.principle_business_telephone && formik.errors.principle_business_telephone ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_address_email"
            name="principle_address_email"
            label="Email *"
            value={formik.values.principle_address_email}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_address_email &&
              Boolean(formik.errors.principle_address_email)
            }
            helperText={
              formik.touched.principle_address_email &&
              formik.errors.principle_address_email
            }
            className={`clean-input ${formik.touched.principle_address_email && formik.errors.principle_address_email ? 'validation-error-field' : ''}`}
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_website"
            name="principle_business_website"
            label="Website"
            value={formik.values.principle_business_website}
            onChange={formik.handleChange}
            error={
              formik.touched.principle_business_website &&
              Boolean(formik.errors.principle_business_website)
            }
            helperText={
              formik.touched.principle_business_website &&
              formik.errors.principle_business_website
            }
            className="clean-input"
          />
        </div>
      </div>      
      {/* Factory Address Section */}
      <div className="form-grid-section">
        <h4 className="section-title">Factory Address</h4>
        {formik.values.factory_addresses?.map((address, index) => (
          <div 
            key={index}
            // className="card"
             style={{ 
               marginBottom: '24px',
               border: '1px solid #e5e7eb',
               borderRadius: '8px',
               padding: '20px',
               position: 'relative'
             }}
             
          >
            {/* Delete Button - Only show if more than one factory address */}
            {formik.values.factory_addresses.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'background-color 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#c82333'}
                onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                title="Remove Factory Address"
              >
                ✕ Remove
              </button>
            )}
            
            <div className="form-grid">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_line_1`}
                name={`factory_addresses[${index}].factory_address_line_1`}
                label={`Factory Address Line 1 *`}
                value={address.factory_address_line_1}
                onChange={formik.handleChange}
                error={
                  formik.touched.factory_addresses?.[index]?.factory_address_line_1 &&
                  Boolean(formik.errors.factory_addresses?.[index]?.factory_address_line_1)
                }
                helperText={
                  formik.touched.factory_addresses?.[index]?.factory_address_line_1 &&
                  formik.errors.factory_addresses?.[index]?.factory_address_line_1
                }
                className={`clean-input ${formik.touched.factory_addresses?.[index]?.factory_address_line_1 && formik.errors.factory_addresses?.[index]?.factory_address_line_1 ? 'validation-error-field' : ''}`}
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_line_2`}
                name={`factory_addresses[${index}].factory_address_line_2`}
                label={`Factory Address Line 2`}
                value={address.factory_address_line_2}
                onChange={formik.handleChange}
                className="clean-input"
              />
            </div>

            <div className="form-grid form-grid-3">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_pin_code`}
                name={`factory_addresses[${index}].factory_address_pin_code`}
                label="PIN Code *"
                value={address.factory_address_pin_code}
                onChange={formik.handleChange}
                error={
                  formik.touched.factory_addresses?.[index]?.factory_address_pin_code &&
                  Boolean(formik.errors.factory_addresses?.[index]?.factory_address_pin_code)
                }
                helperText={
                  formik.touched.factory_addresses?.[index]?.factory_address_pin_code &&
                  formik.errors.factory_addresses?.[index]?.factory_address_pin_code
                }
                className={`clean-input ${formik.touched.factory_addresses?.[index]?.factory_address_pin_code && formik.errors.factory_addresses?.[index]?.factory_address_pin_code ? 'validation-error-field' : ''}`}
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_city`}
                name={`factory_addresses[${index}].factory_address_city`}
                label={`City *`}
                value={address.factory_address_city}
                onChange={formik.handleChange}
                error={
                  formik.touched.factory_addresses?.[index]?.factory_address_city &&
                  Boolean(formik.errors.factory_addresses?.[index]?.factory_address_city)
                }
                helperText={
                  formik.touched.factory_addresses?.[index]?.factory_address_city &&
                  formik.errors.factory_addresses?.[index]?.factory_address_city
                }
                className={`clean-input ${formik.touched.factory_addresses?.[index]?.factory_address_city && formik.errors.factory_addresses?.[index]?.factory_address_city ? 'validation-error-field' : ''}`}
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_state`}
                name={`factory_addresses[${index}].factory_address_state`}
                label={`State *`}
                value={address.factory_address_state}
                onChange={formik.handleChange}
                error={
                  formik.touched.factory_addresses?.[index]?.factory_address_state &&
                  Boolean(formik.errors.factory_addresses?.[index]?.factory_address_state)
                }
                helperText={
                  formik.touched.factory_addresses?.[index]?.factory_address_state &&
                  formik.errors.factory_addresses?.[index]?.factory_address_state
                }
                className={`clean-input ${formik.touched.factory_addresses?.[index]?.factory_address_state && formik.errors.factory_addresses?.[index]?.factory_address_state ? 'validation-error-field' : ''}`}
              />
            </div>

            <div className="form-grid">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].gst`}
                name={`factory_addresses[${index}].gst`}
                label={`GST *`}
                value={address.gst}
                onChange={formik.handleChange}
                error={
                  formik.touched.factory_addresses?.[index]?.gst &&
                  Boolean(formik.errors.factory_addresses?.[index]?.gst)
                }
                helperText={
                  formik.touched.factory_addresses?.[index]?.gst &&
                  formik.errors.factory_addresses?.[index]?.gst
                }
                className={`clean-input ${formik.touched.factory_addresses?.[index]?.gst && formik.errors.factory_addresses?.[index]?.gst ? 'validation-error-field' : ''}`}
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <label 
                style={{ 
                  display: 'block',
                  fontWeight: 500,
                  marginBottom: '12px',
                  color: '#374151',
                  fontSize: '0.95rem',
                }}
              >
                GST Registration
              </label>            <FileUpload
              label="Upload GST Registration"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue(`factory_addresses[${index}].gst_reg`, [...(address.gst_reg || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath={`gst-registration-${index}`}
              multiple={true}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
              customerName={formik.values.name_of_individual}
              />
              {address.gst_reg?.length > 0 && (
                <ImagePreview
                  images={address.gst_reg}
                  onDeleteImage={(deleteIndex) => {
                    const updatedImages = address.gst_reg.filter((_, i) => i !== deleteIndex);
                    formik.setFieldValue(`factory_addresses[${index}].gst_reg`, updatedImages);
                  }}
                  allowUserDelete={true}
                  applicationStatus="draft"
                  currentUserId={user?.id}
                  applicationCreatorId={user?.id}
                />
              )}
            </div>
          </div>
        ))}

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          marginBottom: '16px' 
        }}>
          <button 
            type="button"
            onClick={handleAddField}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'block',
              marginLeft: '0',
              marginTop: '12px',
              textAlign: 'left'
            }}
          >
            Add Factory/Branch Address
          </button>
        </div>
      </div>

      {/* Authorised Signatory Section - Compact Layout */}
      <div className="form-grid-section" style={{ marginBottom: 'var(--spacing-md)' }}>
        <h4 className="section-title" style={{ marginBottom: 'var(--spacing-sm)' }}>
          Authorised Signatory Information
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-sm)'
        }}>
          {/* Signatory Photos */}
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--primary-orange)',
              fontSize: '0.9rem'
            }}>
              Signatory Photos <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(passport size, self-attested)</span>
            </label>
            <FileUpload
              label="Upload Photos"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("authorised_signatories", [...(formik.values.authorised_signatories || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="authorised-signatories"
              multiple={true}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.authorised_signatories && formik.errors.authorised_signatories && (
              <div className="error-message" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {formik.errors.authorised_signatories}
              </div>
            )}
            {formik.values.authorised_signatories && (
              <ImagePreview
                images={formik.values.authorised_signatories}
                onDeleteImage={(index) => {
                  const updatedImages = formik.values.authorised_signatories.filter((_, i) => i !== index);
                  formik.setFieldValue("authorised_signatories", updatedImages);
                }}
                allowUserDelete={true}
                applicationStatus="draft"
                currentUserId={user?.id}
                applicationCreatorId={user?.id}
              />
            )}
          </div>

          {/* Authorisation Letter */}
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--primary-orange)',
              fontSize: '0.9rem'
            }}>
              Authorisation Letter
            </label>
            <FileUpload
              label="Upload Letter"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("authorisation_letter", [...(formik.values.authorisation_letter || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="authorisation_letter"
              multiple={true}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.authorisation_letter && formik.errors.authorisation_letter && (
              <div className="error-message" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {formik.errors.authorisation_letter}
              </div>
            )}
            {formik.values.authorisation_letter && (
              <ImagePreview
                images={formik.values.authorisation_letter}
                onDeleteImage={(index) => {
                  const updatedImages = formik.values.authorisation_letter.filter((_, i) => i !== index);
                  formik.setFieldValue("authorisation_letter", updatedImages);
                }}
                allowUserDelete={true}
                applicationStatus="draft"
                currentUserId={user?.id}
                applicationCreatorId={user?.id}
              />
            )}
          </div>
        </div>
      </div>        
      {/* IEC and PAN Section - Side by Side */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px',
        marginBottom: 'var(--spacing-xl)' 
      }}>
        {/* IEC Section */}
        <div>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            variant="filled"
            id="iec_no"
            name="iec_no"
            label="IEC No * (Required for Draft)"
            value={formik.values.iec_no}
            onChange={formik.handleChange}
            error={formik.touched.iec_no && Boolean(formik.errors.iec_no)}
            helperText={formik.touched.iec_no && formik.errors.iec_no}
            className={`login-input ${formik.touched.iec_no && formik.errors.iec_no ? 'validation-error-field' : ''}`}
          />

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label 
              style={{ 
                display: 'block',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--primary-orange)',
              }}
            >
              IEC Copy
            </label>
            <FileUpload
              label="Upload IEC Copy"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("iec_copy", [...(formik.values.iec_copy || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="iec_copy"
              multiple={true}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.iec_copy && formik.errors.iec_copy ? (
              <div className="error-message">{formik.errors.iec_copy}</div>
            ) : null}
            {formik.values.iec_copy && (
              <ImagePreview
                images={formik.values.iec_copy}
                onDeleteImage={(index) => {
                  const updatedImages = formik.values.iec_copy.filter((_, i) => i !== index);
                  formik.setFieldValue("iec_copy", updatedImages);
                }}
                allowUserDelete={true}
                applicationStatus="draft"
                currentUserId={user?.id}
                applicationCreatorId={user?.id}
              />
            )}
          </div>
        </div>

        {/* PAN Section */}
        <div>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            variant="filled"
            id="pan_no"
            name="pan_no"
            label="PAN No *"
            value={formik.values.pan_no}
            onChange={formik.handleChange}
            error={formik.touched.pan_no && Boolean(formik.errors.pan_no)}
            helperText={formik.touched.pan_no && formik.errors.pan_no}
            className={`login-input ${formik.touched.pan_no && formik.errors.pan_no ? 'validation-error-field' : ''}`}
          />

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label 
              style={{ 
                display: 'block',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--primary-orange)',
              }}
            >
              PAN Copy
            </label>
            <FileUpload
              label="Upload PAN Copy"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("pan_copy", [...(formik.values.pan_copy || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="pan-copy"
              multiple={true}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.pan_copy && formik.errors.pan_copy ? (
              <div className="error-message">{formik.errors.pan_copy}</div>
            ) : null}
            {formik.values.pan_copy && (
              <ImagePreview
                images={Array.isArray(formik.values.pan_copy) ? formik.values.pan_copy : [formik.values.pan_copy]}
                onDeleteImage={(index) => {
                  if (Array.isArray(formik.values.pan_copy)) {
                    const updatedImages = formik.values.pan_copy.filter((_, i) => i !== index);
                    formik.setFieldValue("pan_copy", updatedImages);
                  } else {
                    formik.setFieldValue("pan_copy", []);
                  }
                }}
                allowUserDelete={true}
                applicationStatus="draft"
                currentUserId={user?.id}
                applicationCreatorId={user?.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Banking Information Section */}
      <div className="form-grid-section">
        <h4 className="section-title">Banking Information</h4>
        {formik.values.banks?.map((bank, index) => (
          <div 
            key={index}
           
            style={{ 
              marginBottom: '24px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              position: 'relative'
            }}
          >
            {/* Delete Button - Only show if more than one bank */}
            {formik.values.banks.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveBank(index)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'background-color 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#c82333'}
                onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                title="Remove AD Code Section"
              >
                ✕ Remove
              </button>
            )}
            
            <div className="form-grid">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].bankers_name`}
                name={`banks[${index}].bankers_name`}
                label={`Bankers Name *`}
                value={bank.bankers_name}
                onChange={formik.handleChange}
                error={
                  formik.touched.banks?.[index]?.bankers_name &&
                  Boolean(formik.errors.banks?.[index]?.bankers_name)
                }
                helperText={
                  formik.touched.banks?.[index]?.bankers_name &&
                  formik.errors.banks?.[index]?.bankers_name
                }
                className={`clean-input ${formik.touched.banks?.[index]?.bankers_name && formik.errors.banks?.[index]?.bankers_name ? 'validation-error-field' : ''}`}
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].branch_address`}
                name={`banks[${index}].branch_address`}
                label={`Branch Address *`}
                value={bank.branch_address}
                onChange={formik.handleChange}
                error={
                  formik.touched.banks?.[index]?.branch_address &&
                  Boolean(formik.errors.banks?.[index]?.branch_address)
                }
                helperText={
                  formik.touched.banks?.[index]?.branch_address &&
                  formik.errors.banks?.[index]?.branch_address
                }
                className={`clean-input ${formik.touched.banks?.[index]?.branch_address && formik.errors.banks?.[index]?.branch_address ? 'validation-error-field' : ''}`}
              />
            </div>

            <div className="form-grid form-grid-3">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].account_no`}
                name={`banks[${index}].account_no`}
                label={`Account No *`}
                value={bank.account_no}
                onChange={formik.handleChange}
                error={
                  formik.touched.banks?.[index]?.account_no &&
                  Boolean(formik.errors.banks?.[index]?.account_no)
                }
                helperText={
                  formik.touched.banks?.[index]?.account_no &&
                  formik.errors.banks?.[index]?.account_no
                }
                className={`clean-input ${formik.touched.banks?.[index]?.account_no && formik.errors.banks?.[index]?.account_no ? 'validation-error-field' : ''}`}
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].ifsc`}
                name={`banks[${index}].ifsc`}
                label={`IFSC *`}
                value={bank.ifsc}
                onChange={formik.handleChange}
                error={
                  formik.touched.banks?.[index]?.ifsc &&
                  Boolean(formik.errors.banks?.[index]?.ifsc)
                }
                helperText={
                  formik.touched.banks?.[index]?.ifsc &&
                  formik.errors.banks?.[index]?.ifsc
                }
                className={`clean-input ${formik.touched.banks?.[index]?.ifsc && formik.errors.banks?.[index]?.ifsc ? 'validation-error-field' : ''}`}
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].adCode`}
                name={`banks[${index}].adCode`}
                label={`AD Code *`}
                value={bank.adCode}
                onChange={formik.handleChange}
                error={
                  formik.touched.banks?.[index]?.adCode &&
                  Boolean(formik.errors.banks?.[index]?.adCode)
                }
                helperText={
                  formik.touched.banks?.[index]?.adCode &&
                  formik.errors.banks?.[index]?.adCode
                }
                className={`clean-input ${formik.touched.banks?.[index]?.adCode && formik.errors.banks?.[index]?.adCode ? 'validation-error-field' : ''}`}
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <label 
                style={{ 
                  display: 'block',
                  fontWeight: 500,
                  marginBottom: '12px',
                  color: '#374151',
                  fontSize: '0.95rem',
                }}
              >
                AD Code File
              </label>
              <FileUpload
                label="Upload AD Code File"
                onFilesUploaded={(uploadedFiles) => {
                  const current = bank.adCode_file || [];
                  formik.setFieldValue(`banks[${index}].adCode_file`, [...current, ...uploadedFiles]);
                  setFileSnackbar(true);
                }}
                bucketPath={`ad-code-${index}`}
                multiple={true}
                acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                customerName={formik.values.name_of_individual}
              />
              {bank.adCode_file?.length > 0 && (
                <ImagePreview
                  images={bank.adCode_file}
                  onDeleteImage={(deleteIndex) => {
                    const updatedImages = bank.adCode_file.filter((_, i) => i !== deleteIndex);
                    formik.setFieldValue(`banks[${index}].adCode_file`, updatedImages);
                  }}
                  allowUserDelete={true}
                  applicationStatus="draft"
                  currentUserId={user?.id}
                  applicationCreatorId={user?.id}
                />
              )}
            </div>
          </div>
        ))}
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          marginBottom: '32px' 
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="add-bank"
            onClick={handleAddBanks}
           style={{
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'block',
    marginLeft: '0',
    marginTop: '12px',
    textAlign: 'left'
  }}
          >
            Add AD Code
          </button>
        </div>
      </div>
      {getSupportingDocs()}

      {/* Additional Documents Section - Structured Layout */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h4 style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '24px',
          borderBottom: '2px solid #d6e6ff',
          paddingBottom: '8px'
        }}>
          Additional Documents
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginTop: '16px'
        }}>
          {/* Other Documents Card */}
          <div style={{ 
            background: '#fffefe',
            border: '1px solid #d6e6ff',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              Other Documents
            </label>
            <FileUpload
              label="Upload Other Documents"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("other_documents", [...(formik.values.other_documents || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="other-documents"
              multiple={true}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.zip', '.xls', '.xlsx']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.other_documents && formik.errors.other_documents && (
              <div className="error-message" style={{ marginTop: '8px' }}>{formik.errors.other_documents}</div>
            )}
            {formik.values.other_documents?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <ImagePreview
                  images={formik.values.other_documents}
                  onDeleteImage={(index) => {
                    const updatedImages = formik.values.other_documents.filter((_, i) => i !== index);
                    formik.setFieldValue("other_documents", updatedImages);
                  }}
                  allowUserDelete={true}
                  applicationStatus="draft"
                  currentUserId={user?.id}
                  applicationCreatorId={user?.id}
                />
              </div>
            )}
          </div>

          {/* SPCB Registration Certificate Card */}
          <div style={{ 
            background: '#fffefe',
            border: '1px solid #d6e6ff',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              SPCB Registration Certificate
            </label>
            <FileUpload
              label="Upload SPCB Registration Certificate"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("spcb_reg", [...(formik.values.spcb_reg || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="spcb-registration"
              multiple={true}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.spcb_reg && formik.errors.spcb_reg && (
              <div className="error-message" style={{ marginTop: '8px' }}>{formik.errors.spcb_reg}</div>
            )}
            {formik.values.spcb_reg && (
              <div style={{ marginTop: '12px' }}>
                <ImagePreview
                  images={Array.isArray(formik.values.spcb_reg) ? formik.values.spcb_reg : [formik.values.spcb_reg]}
                  onDeleteImage={(index) => {
                    if (Array.isArray(formik.values.spcb_reg)) {
                      const updatedImages = formik.values.spcb_reg.filter((_, i) => i !== index);
                      formik.setFieldValue("spcb_reg", updatedImages);
                    } else {
                      formik.setFieldValue("spcb_reg", []);
                    }
                  }}
                  allowUserDelete={true}
                  applicationStatus="draft"
                  currentUserId={user?.id}
                  applicationCreatorId={user?.id}
                />
              </div>
            )}
          </div>

          {/* KYC Verification Images Card */}
          <div style={{ 
            background: '#fffefe',
            border: '1px solid #d6e6ff',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              KYC Verification Images
            </label>
            <FileUpload
              label="Upload KYC Verification Images"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("kyc_verification_images", [...(formik.values.kyc_verification_images || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="kyc-verification-images"
              multiple={true}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.kyc_verification_images && formik.errors.kyc_verification_images && (
              <div className="error-message" style={{ marginTop: '8px' }}>
                {formik.errors.kyc_verification_images}
              </div>
            )}
            {formik.values.kyc_verification_images?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <ImagePreview
                  images={formik.values.kyc_verification_images}
                  onDeleteImage={(index) => {
                    const updatedImages = formik.values.kyc_verification_images.filter((_, i) => i !== index);
                    formik.setFieldValue("kyc_verification_images", updatedImages);
                  }}
                  allowUserDelete={true}
                  applicationStatus="draft"
                  currentUserId={user?.id}
                  applicationCreatorId={user?.id}
                />
              </div>
            )}
          </div>

          {/* GST Returns Card */}
          <div style={{ 
            background: '#fffefe',
            border: '1px solid #d6e6ff',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              GST Returns
            </label>
            <FileUpload
              label="Upload GST Returns"
              onFilesUploaded={(uploadedFiles) => {
                formik.setFieldValue("gst_returns", [...(formik.values.gst_returns || []), ...uploadedFiles]);
                setFileSnackbar(true);
              }}
              bucketPath="gst-returns"
              multiple={true}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.zip', '.doc', '.docx']}
              customerName={formik.values.name_of_individual}
            />
            {formik.touched.gst_returns && formik.errors.gst_returns && (
              <div className="error-message" style={{ marginTop: '8px' }}>{formik.errors.gst_returns}</div>
            )}
            {formik.values.gst_returns?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <ImagePreview
                  images={formik.values.gst_returns}
                  onDeleteImage={(index) => {
                    const updatedImages = formik.values.gst_returns.filter((_, i) => i !== index);
                    formik.setFieldValue("gst_returns", updatedImages);
                  }}
                  allowUserDelete={true}
                  applicationStatus="draft"
                  currentUserId={user?.id}
                  applicationCreatorId={user?.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-md)', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: 'var(--spacing-xl) 0',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        marginTop: 'var(--spacing-xl)',
      }}>
        {/* Draft Requirements Info */}
        <div style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-sm)',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            color: '#6c757d',
            lineHeight: '1.4'
          }}>
            💡 <strong>Save Draft:</strong> Only requires IEC Number and Name • 
            <strong>Submit:</strong> All mandatory fields must be completed
          </p>
        </div>
        
        <button
          type="button"
          className="btn btn-secondary"
          aria-label="preview-btn"
          onClick={handleOpen}
        >
          Preview
        </button>
        <button
          type="button"
          className="btn btn-warning"
          aria-label="clear-all-btn"
          onClick={handleClearConfirmation}
          title="Clear all form data and start fresh"
          style={{ 
            backgroundColor: "#f39c12", 
            borderColor: "#e67e22",
            color: "white"
          }}
        >
          🗑️ Clear All
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          aria-label="save-draft-btn"
          onClick={() => {
            setSubmitType("save_draft");
            setSubmissionAttempted(true);
          }}
          title="Save with minimal information (IEC Number + Name required)"
        >
          💾 Save Draft
        </button>
        <button
          type="submit"
          className="btn btn-success"
          aria-label="submit-btn"
          onClick={() => {
            setSubmitType("save");
            setSubmissionAttempted(true);
          }}
          title="Submit complete application (all mandatory fields required)"
        >
          📤 Submit
        </button>
      </div>
      
      {/* File Upload Snackbar */}
      <Snackbar
        open={fileSnackbar}
        message="File uploaded successfully!"
        sx={{ left: "auto !important", right: "24px !important" }}
      />
      
      {/* Enhanced Validation Snackbar */}
      <Snackbar
        open={validationSnackbar.open}
        autoHideDuration={7000}
        onClose={() => setValidationSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          top: '80px !important',
          zIndex: 9999,
        }}
        TransitionProps={{
          direction: 'down'
        }}
      >
        <Alert 
          onClose={() => setValidationSnackbar(prev => ({ ...prev, open: false }))}
          severity={validationSnackbar.severity}
          variant="filled"
          icon="⚠️"
          sx={{
            width: '100%',
            minWidth: '400px',
            maxWidth: '600px',
            backgroundColor: validationSnackbar.severity === 'error' ? '#d32f2f' : '#ed6c02',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.2)',
            '& .MuiAlert-icon': {
              color: 'white',
              fontSize: '24px'
            },
            '& .MuiAlert-action': {
              color: 'white'
            },
            '& .MuiAlert-action .MuiIconButton-root': {
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }
          }}
        >
          <div>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '6px',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Form Validation Required
            </div>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
              {validationSnackbar.message}
            </div>
            {validationSnackbar.fieldCount > 1 && (
              <div style={{ 
                fontSize: '0.85rem', 
                marginTop: '6px', 
                opacity: 0.9,
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                📊 Total fields to complete: {validationSnackbar.fieldCount}
              </div>
            )}
          </div>
        </Alert>
      </Snackbar>
      
      {/* Clear All Confirmation Dialog */}
      <Snackbar
        open={showClearConfirmation}
        autoHideDuration={null}
        onClose={() => setShowClearConfirmation(false)}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        sx={{ 
          position: 'fixed !important',
          top: '50% !important',
          left: '50% !important',
          transform: 'translate(-50%, -50%) !important',
          zIndex: 10000,
        }}
      >
        <Alert 
          severity="warning"
          variant="filled"
          sx={{
            width: '100%',
            minWidth: '400px',
            maxWidth: '500px',
            backgroundColor: '#f39c12',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderRadius: '12px',
            border: '3px solid rgba(255,255,255,0.3)',
            '& .MuiAlert-icon': {
              color: 'white',
              fontSize: '28px'
            },
            '& .MuiAlert-action': {
              display: 'none' // Hide the default close button
            }
          }}
        >
          <div>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🗑️ Clear All Form Data
            </div>
            <div style={{ fontSize: '1rem', lineHeight: '1.4', marginBottom: '16px' }}>
              Are you sure you want to clear all form data? This action cannot be undone.
              <br /><br />
              <strong>This will remove:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>All filled form fields</li>
                <li>All uploaded files</li>
                <li>Auto-saved draft data</li>
              </ul>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '16px'
            }}>
              <button
                type="button"
                onClick={() => setShowClearConfirmation(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e74c3c',
                  border: '1px solid #c0392b',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </Alert>
      </Snackbar>
      
      <Preview open={open} handleClose={handleClose} data={formik.values} />
    </form>
  );
}

export default React.memo(CustomerKycForm);
