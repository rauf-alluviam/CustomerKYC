import React, { useState, useEffect } from "react";
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
import FileUpload from "../utils/FileUpload";
import ImagePreview from "../utils/ImagePreview";
import { handleFileUpload } from "../utils/awsFileUpload";
import Checkbox from "@mui/material/Checkbox";
import Preview from "./Preview";
import { getCityAndStateByPinCode } from "../utils/getCityAndStateByPinCode";
import BackButton from "./BackButton";
import { useSnackbar } from "../contexts/SnackbarContext";

function CustomerKycForm() {
  const [submitType, setSubmitType] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { showError, showSuccess, showWarning } = useSnackbar();

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
    onSubmit: async (values, { resetForm }) => {
      try {
        validateBanks(values.banks);

        let res;
        if (submitType === "save_draft") {
          if (values.iec_no === "") {
            showWarning("IEC number is required");
            return;
          } else {
            res = await axios.post(
              `${process.env.REACT_APP_API_STRING}/customer-kyc-draft`,
              { ...values, draft: "true" }
            );
            showSuccess(res.data.message);
            resetForm();
          }
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
      <div className="form-grid-section">
        <FormControl sx={{ marginBottom: "24px" }}>
          <FormLabel 
            id="category-label"
            sx={{ 
              fontWeight: 500,
              color: '#374151',
              marginBottom: '12px',
              fontSize: '0.95rem',
            }}
          >
            Category
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
          <div className="error-message">{formik.errors.category}</div>
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
            label="Name of Individual/Firm/Company"
            value={formik.values.name_of_individual}
            onChange={formik.handleChange}
            error={
              formik.touched.name_of_individual &&
              Boolean(formik.errors.name_of_individual)
            }
            helperText={
              formik.touched.name_of_individual && formik.errors.name_of_individual
            }
            className="clean-input"
          />
        </div>

        {/* Status Section */}
        <FormControl sx={{ marginTop: "24px" }}>
          <FormLabel 
            id="status-label"
            sx={{ 
              fontWeight: 500,
              color: '#374151',
              marginBottom: '12px',
              fontSize: '0.95rem',
            }}
          >
            Status of Exporter/Importer
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
          <div className="error-message">{formik.errors.status}</div>
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
            label="Address Line 1"
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
            className="clean-input"
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
            label="PIN Code"
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
            className="clean-input"
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_city"
            name="permanent_address_city"
            label="City"
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
            className="clean-input"
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_state"
            name="permanent_address_state"
            label="State"
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
            className="clean-input"
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
            label="Mobile"
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
            className="clean-input"
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="permanent_address_email"
            name="permanent_address_email"
            label="Email"
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
            className="clean-input"
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
            label="Address Line 1"
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
            className="clean-input"
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
            label="PIN Code"
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
            className="clean-input"
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_city"
            name="principle_business_address_city"
            label="City"
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
            className="clean-input"
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_business_address_state"
            name="principle_business_address_state"
            label="State"
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
            className="clean-input"
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
            label="Mobile"
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
            className="clean-input"
          />
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="outlined"
            id="principle_address_email"
            name="principle_address_email"
            label="Email"
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
            className="clean-input"
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
             style={{ marginBottom: '24px'  }}
             
          >
            <div className="form-grid">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_line_1`}
                name={`factory_addresses[${index}].factory_address_line_1`}
                label={`Factory Address Line 1`}
                value={address.factory_address_line_1}
                onChange={formik.handleChange}
                className="clean-input"
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
                label="PIN Code"
                value={address.factory_address_pin_code}
                onChange={formik.handleChange}
                className="clean-input"
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_city`}
                name={`factory_addresses[${index}].factory_address_city`}
                label={`City`}
                value={address.factory_address_city}
                onChange={formik.handleChange}
                className="clean-input"
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`factory_addresses[${index}].factory_address_state`}
                name={`factory_addresses[${index}].factory_address_state`}
                label={`State`}
                value={address.factory_address_state}
                onChange={formik.handleChange}
                className="clean-input"
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
                label={`GST`}
                value={address.gst}
                onChange={formik.handleChange}
                className="clean-input"
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
              </label>
              <FileUpload
                label="Upload GST Registration"
                onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                  const currentFiles = address.gst_reg || [];
                  const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                  formik.setFieldValue(`factory_addresses[${index}].gst_reg`, newFiles);
                  setFileSnackbar(true);
                }}
                bucketPath={`gst-registration-${index}`}
                multiple={true}
                customerName={formik.values.name_of_individual}
                acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
              />
              {address.gst_reg?.length > 0 && (
                <ImagePreview
                  images={address.gst_reg}
                  onDeleteImage={(deleteIndex) => {
                    const updatedImages = address.gst_reg.filter((_, i) => i !== deleteIndex);
                    formik.setFieldValue(`factory_addresses[${index}].gst_reg`, updatedImages);
                  }}
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.authorised_signatories || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("authorised_signatories", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="authorised-signatories"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.authorisation_letter || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("authorisation_letter", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="authorisation_letter"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
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
            label="IEC No"
            value={formik.values.iec_no}
            onChange={formik.handleChange}
            error={formik.touched.iec_no && Boolean(formik.errors.iec_no)}
            helperText={formik.touched.iec_no && formik.errors.iec_no}
            className="login-input"
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.iec_copy || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("iec_copy", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="iec_copy"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
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
            label="PAN No"
            value={formik.values.pan_no}
            onChange={formik.handleChange}
            error={formik.touched.pan_no && Boolean(formik.errors.pan_no)}
            helperText={formik.touched.pan_no && formik.errors.pan_no}
            className="login-input"
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.pan_copy || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("pan_copy", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="pan-copy"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
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
           
            style={{ marginBottom: '24px' }}
          >
            <div className="form-grid">
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].bankers_name`}
                name={`banks[${index}].bankers_name`}
                label={`Bankers Name`}
                value={bank.bankers_name}
                onChange={formik.handleChange}
                error={
                  formik.touched[`banks[${index}].bankers_name`] &&
                  Boolean(formik.errors[`banks[${index}].bankers_name`])
                }
                helperText={
                  formik.touched[`banks[${index}].bankers_name`] &&
                  formik.errors[`banks[${index}].bankers_name`]
                }
                className="clean-input"
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].branch_address`}
                name={`banks[${index}].branch_address`}
                label={`Branch Address`}
                value={bank.branch_address}
                onChange={formik.handleChange}
                error={
                  formik.touched[`banks[${index}].branch_address`] &&
                  Boolean(formik.errors[`banks[${index}].branch_address`])
                }
                helperText={
                  formik.touched[`banks[${index}].branch_address`] &&
                  formik.errors[`banks[${index}].branch_address`]
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
                id={`banks[${index}].account_no`}
                name={`banks[${index}].account_no`}
                label={`Account No`}
                value={bank.account_no}
                onChange={formik.handleChange}
                error={
                  formik.touched[`banks[${index}].account_no`] &&
                  Boolean(formik.errors[`banks[${index}].account_no`])
                }
                helperText={
                  formik.touched[`banks[${index}].account_no`] &&
                  formik.errors[`banks[${index}].account_no`]
                }
                className="clean-input"
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].ifsc`}
                name={`banks[${index}].ifsc`}
                label={`IFSC`}
                value={bank.ifsc}
                onChange={formik.handleChange}
                error={
                  formik.touched[`banks[${index}].ifsc`] &&
                  Boolean(formik.errors[`banks[${index}].ifsc`])
                }
                helperText={
                  formik.touched[`banks[${index}].ifsc`] &&
                  formik.errors[`banks[${index}].ifsc`]
                }
                className="clean-input"
              />
              <TextField
                fullWidth
                size="small"
                margin="none"
                variant="outlined"
                id={`banks[${index}].adCode`}
                name={`banks[${index}].adCode`}
                label={`AD Code`}
                value={bank.adCode}
                onChange={formik.handleChange}
                error={
                  formik.touched[`banks[${index}].adCode`] &&
                  Boolean(formik.errors[`banks[${index}].adCode`])
                }
                helperText={
                  formik.touched[`banks[${index}].adCode`] &&
                  formik.errors[`banks[${index}].adCode`]
                }
                className="clean-input"
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
                onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                  const currentFiles = bank.adCode_file || [];
                  const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                  formik.setFieldValue(`banks[${index}].adCode_file`, newFiles);
                  setFileSnackbar(true);
                }}
                bucketPath={`ad-code-${index}`}
                multiple={true}
                customerName={formik.values.name_of_individual}
                acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
              />
              {bank.adCode_file?.length > 0 && (
                <ImagePreview
                  images={bank.adCode_file}
                  onDeleteImage={(deleteIndex) => {
                    const updatedImages = bank.adCode_file.filter((_, i) => i !== deleteIndex);
                    formik.setFieldValue(`banks[${index}].adCode_file`, updatedImages);
                  }}
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.other_documents || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("other_documents", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="other-documents"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.spcb_reg || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("spcb_reg", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="spcb-registration"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.kyc_verification_images || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("kyc_verification_images", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="kyc-verification-images"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
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
              onFilesUploaded={(uploadedUrls, appendFiles = true) => {
                const currentFiles = formik.values.gst_returns || [];
                const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
                formik.setFieldValue("gst_returns", newFiles);
                setFileSnackbar(true);
              }}
              bucketPath="gst-returns"
              multiple={true}
              customerName={formik.values.name_of_individual}
              acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.xls', '.xlsx']}
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
        borderTop: '1px solid rgba(243, 163, 16, 0.2)',
        marginTop: 'var(--spacing-xl)',
      }}>
        <button
          type="button"
          className="btn btn-secondary"
          aria-label="preview-btn"
          onClick={handleOpen}
        >
          Preview
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          aria-label="save-draft-btn"
          onClick={() => setSubmitType("save_draft")}
        >
          Save Draft
        </button>
        <button
          type="submit"
          className="btn btn-success"
          aria-label="submit-btn"
          onClick={() => setSubmitType("save")}
        >
          Submit
        </button>
      </div>
      <Snackbar
        open={fileSnackbar}
        message="File uploaded successfully!"
        sx={{ left: "auto !important", right: "24px !important" }}
      />
      <Preview open={open} handleClose={handleClose} data={formik.values} />
    </form>
  );
}

export default React.memo(CustomerKycForm);
