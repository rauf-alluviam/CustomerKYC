import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import { validationSchema } from "../schemas/customerKyc/customerKycSchema.js";
import { TextField } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Row, Col } from "react-bootstrap";
import useSupportingDocuments from "../customHooks/useSupportingDocuments";
import Snackbar from "@mui/material/Snackbar";
import FileUpload from "../utils/FileUpload";
import ImagePreview from "../utils/ImagePreview";
import { handleFileUpload } from "../utils/awsFileUpload";
import { handleSingleFileUpload } from "../utils/awsSingleFileUpload";
import Checkbox from "@mui/material/Checkbox";
import Preview from "./Preview";
import { getCityAndStateByPinCode } from "../utils/getCityAndStateByPinCode";
import BackButton from "./BackButton";
import { useSnackbar } from "../contexts/SnackbarContext";
import { ViewButton, MultipleViewButtons } from "../utils/documentHelpers";
import { useFileUploadQueue } from "../contexts/FileUploadQueueContext";

function ReviseCustomerKyc() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { showSuccess, showError } = useSnackbar();
   const { queueFiles, processQueue, queuedFiles, isProcessing } = useFileUploadQueue();

  useEffect(() => {
    async function getData() {
      console.log("Fetching data for ID:", _id);
      const res = await axios(
        `${process.env.REACT_APP_API_STRING}/view-customer-kyc-details/${_id}`
      );
      console.log("Fetched data:", res.data);
      setData(res.data);
    }

    getData();
  }, [_id]);

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
          gst_reg: "",
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

      authorised_signatories: "",
      authorisation_letter: "",
      iec_no: "",
      iec_copy: "",
      pan_no: "",
      pan_copy: "",
      banks: [
        {
          bankers_name: "",
          branch_address: "",
          account_no: "",
          ifsc: "",
          adCode: "",
          adCode_file: "",
        },
      ],
      other_documents: [],
      spcb_reg: "",
      kyc_verification_images: [],

      // individual
      individual_passport_img: "",
      individual_voter_card_img: "",
      individual_driving_license_img: "",
      individual_bank_statement_img: "",
      individual_ration_card_img: "",

      // partnership
      partnership_registration_certificate_img: "",
      partnership_deed_img: "",
      partnership_power_of_attorney_img: "",
      partnership_valid_document: "",
      partnership_aadhar_card_front_photo: "",
      partnership_aadhar_card_back_photo: "",
      partnership_telephone_bill: "",

      // company
      company_certificate_of_incorporation_img: "",
      company_memorandum_of_association_img: "",
      company_articles_of_association_img: "",
      company_power_of_attorney_img: "",
      company_telephone_bill_img: "",
      company_pan_allotment_letter_img: "",

      // trust
      trust_certificate_of_registration_img: "",
      trust_power_of_attorney_img: "",
      trust_officially_valid_document_img: "",
      trust_resolution_of_managing_body_img: "",
      trust_telephone_bill_img: "",
      trust_name_of_trustees: "",
      trust_name_of_founder: "",
      trust_address_of_founder: "",
      trust_telephone_of_founder: "",
      trust_email_of_founder: "",
    },
    // validationSchema, // Temporarily disabled for testing
    onSubmit: async (values, { resetForm }) => {
      console.log("Form submission started");
      console.log("Form values:", values);
      console.log("Form errors:", formik.errors);
      
      try {
        const res = await axios.patch(
          `${process.env.REACT_APP_API_STRING}/update-customer-kyc/${_id}`,
          values
        );
        console.log("Response:", res.data);
        showSuccess(res.data.message);
        resetForm();
        // Navigate back to the customer KYC dashboard
        navigate("/customer-kyc");
      } catch (error) {
        console.error("Error updating customer KYC:", error);
        if (error.response?.data?.message) {
          showError(`Error: ${error.response.data.message}`);
        } else {
          showError("An error occurred while updating the KYC details. Please try again.");
        }
      }
    },
  });

  useEffect(() => {
    if (data) {
      console.log("Setting form values with data:", data);
      formik.setValues(data);
    }
    // eslint-disable-next-line
  }, [data]);

  const { getSupportingDocs, fileSnackbar, setFileSnackbar } =
    useSupportingDocuments(formik);

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
          gst_reg: "",
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
          adCode_file: "",
        },
      ],
    });
  };
  const handleGstRegUpload = (e, index) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;

        formik.setFieldValue(
          `factory_addresses[${index}].gst_reg`,
          base64String
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdCodeFileUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        formik.setFieldValue(`banks[${index}].adCode_file`, base64String);
      };
      reader.readAsDataURL(file);
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
          formik.values.permanent_address_state,
        principle_business_telephone: formik.values.permanent_address_telephone,
        principle_address_email: formik.values.permanent_address_email,
      });
    } else {
      // If unchecked, you can clear the communication address fields or handle as needed
      formik.setValues({
        ...formik.values,
        principle_business_address_line_1: "",
        principle_business_address_line_2: "",
        principle_business_address_city: "",
        principle_business_address_state: "",
        principle_business_address_pin_code: "",
        principle_business_telephone: "",
        principle_address_email: "",
      });
    }
  };

  useEffect(() => {
    const fetchCityAndState = async () => {
      if (formik.values.permanent_address_pin_code.length === 6) {
        const data = await getCityAndStateByPinCode(
          formik.values.permanent_address_pin_code
        );
        if (data) {
          formik.setFieldValue("permanent_address_city", data.city);
          formik.setFieldValue("permanent_address_state", data.state);
        }
      }
      if (formik.values.principle_business_address_pin_code.length === 6) {
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

  return (
    <div className="kyc-form-container">
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <BackButton />
        <h2 style={{ 
          color: 'var(--primary-orange)', 
          margin: '0 auto',
          textAlign: 'center',
          flex: 1
        }}>
          Revise Customer KYC
        </h2>
      </div>
      
      <div className="form-section">
      </div>
      
      <form onSubmit={formik.handleSubmit}>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">
            <b>Category</b>
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
          >
            <FormControlLabel
              value="Individual/ Proprietary Firm"
              control={<Radio />}
              label="Individual/Proprietary Firm"
            />
            <FormControlLabel
              value="Partnership Firm"
              control={<Radio />}
              label="Parternship Firm"
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
          <div style={{ color: "red" }}>{formik.errors.category}</div>
        ) : null}

        <br />

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
          id="name_of_individual"
          name="name_of_individual"
          label="Name of Individual including alias/ Proprietary Firm/ Partnership Firm/ Company/ Trusts/ Foundations/ (name of all partners)"
          value={formik.values.name_of_individual}
          onChange={formik.handleChange}
          error={
            formik.touched.name_of_individual &&
            Boolean(formik.errors.name_of_individual)
          }
          helperText={
            formik.touched.name_of_individual &&
            formik.errors.name_of_individual
          }
          className="login-input"
        />

        <br />
        <br />

        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">
            <b>Status of Exporter/ Importer</b>
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
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
          <div style={{ color: "red" }}>{formik.errors.status}</div>
        ) : null}

        <br />
        <br />
        <h4>Permanent Address</h4>
        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
          id="permanent_address_line_1"
          name="permanent_address_line_1"
          label="Permanent or Registered Office Address Line 1"
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
          className="login-input"
        />

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
          id="permanent_address_line_2"
          name="permanent_address_line_2"
          label="Permanent or Registered Office Address Line 2"
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
          className="login-input"
        />

        <Row>
          <Col>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
          </Col>

          <Col>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
          </Col>

          <Col>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
          </Col>
        </Row>

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
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
          className="login-input"
        />

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
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
          className="login-input"
        />

        <br />
        <br />
        <h4>Principal Business Address</h4>
        <FormControlLabel
          control={
            <Checkbox
              name="sameAsPermanentAddress"
              onChange={handleSameAsPermanentAddress}
            />
          }
          label="Same as Permanent Address"
        />
        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
          id="principle_business_address_line_1"
          name="principle_business_address_line_1"
          label="Principal Business Address/es from which business is transacted Line 1"
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
          className="login-input"
        />

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
          id="principle_business_address_line_2"
          name="principle_business_address_line_2"
          label="Principal Business Address/es from which business is transacted Line 2"
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
          className="login-input"
        />

        <Row>
          <Col>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
          </Col>
          <Col>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
          </Col>
          <Col>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
          </Col>
        </Row>

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
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
          className="login-input"
        />

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
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
          className="login-input"
        />

        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="filled"
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
          className="login-input"
        />

        <br />
        <br />
        <h4>Factory Address</h4>
        {formik.values.factory_addresses?.map((address, index) => (
          <div key={index}>
            <Row>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
                  id={`factory_addresses[${index}].factory_address_line_1`}
                  name={`factory_addresses[${index}].factory_address_line_1`}
                  label={`Factory Address Line 1`}
                  value={address.factory_address_line_1}
                  onChange={formik.handleChange}
                  className="login-input"
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
                  id={`factory_addresses[${index}].factory_address_line_2`}
                  name={`factory_addresses[${index}].factory_address_line_2`}
                  label={`Factory Address Line 2`}
                  value={address.factory_address_line_2}
                  onChange={formik.handleChange}
                  className="login-input"
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
                  id={`factory_addresses[${index}].factory_address_city`}
                  name={`factory_addresses[${index}].factory_address_city`}
                  label={`City`}
                  value={address.factory_address_city}
                  onChange={formik.handleChange}
                  className="login-input"
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
                  id={`factory_addresses[${index}].factory_address_state`}
                  name={`factory_addresses[${index}].factory_address_state`}
                  label={`State`}
                  value={address.factory_address_state}
                  onChange={formik.handleChange}
                  className="login-input"
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
                  id={`factory_addresses[${index}].factory_address_pin_code`}
                  name={`factory_addresses[${index}].factory_address_pin_code`}
                  label="PIN Code"
                  value={address.factory_address_pin_code}
                  onChange={formik.handleChange}
                  className="login-input"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
                  id={`factory_addresses[${index}].gst`}
                  name={`factory_addresses[${index}].gst`}
                  label={`GST`}
                  value={address.gst}
                  onChange={formik.handleChange}
                  className="login-input"
                />
              </Col>
            </Row>
            <br />
            <br />
            <label htmlFor="gst_reg">GST Registration</label>
            <br />
            <FileUpload
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
              />
            )}
            <br />
          </div>
        ))}
        <br />
        <button
          type="button"
          className="btn"
          aria-label="submit-btn"
          style={{ marginBottom: "20px", padding: "5px" }}
          onClick={handleAddField}
        >
          Add Factory/ Branch Address
        </button>

        <br />
        <br />
        <p>
          Name of Authorised Signatory/ies for signing import/export documents
          on behalf of the Firm/ Company. Please provide recent passport size
          self attested photographs of each signatory
        </p>
        <FileUpload
          label="Upload Authorised Signatory Photo(s)"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("authorised_signatories", [...(formik.values.authorised_signatories || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="authorised_signatories"
          multiple={true}
          acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.authorised_signatories?.length > 0 && (
          <ImagePreview
            images={formik.values.authorised_signatories}
            onDeleteImage={(index) => {
              const updated = formik.values.authorised_signatories.filter((_, i) => i !== index);
              formik.setFieldValue("authorised_signatories", updated);
            }}
          />
        )}

        <br />
        <br />
        <p>Upload Authorisation Letter</p>
        <FileUpload
          label="Upload Authorisation Letter"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("authorisation_letter", [...(formik.values.authorisation_letter || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="authorisation_letter"
          multiple={true}
          acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.authorisation_letter?.length > 0 && (
          <ImagePreview
            images={formik.values.authorisation_letter}
            onDeleteImage={(index) => {
              const updated = formik.values.authorisation_letter.filter((_, i) => i !== index);
              formik.setFieldValue("authorisation_letter", updated);
            }}
          />
        )}

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
        <br />
        <br />
        <label style={{ marginRight: "10px" }}>IEC Copy:</label>
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
        {formik.values.iec_copy?.length > 0 && (
          <ImagePreview
            images={formik.values.iec_copy}
            onDeleteImage={(index) => {
              const updated = formik.values.iec_copy.filter((_, i) => i !== index);
              formik.setFieldValue("iec_copy", updated);
            }}
          />
        )}

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
        <br />
        <br />
        <label style={{ marginRight: "10px" }}>PAN Copy:</label>
        <FileUpload
          label="Upload PAN Copy"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("pan_copy", [...(formik.values.pan_copy || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="pan_copy"
          multiple={true}
          acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.pan_copy?.length > 0 && (
          <ImagePreview
            images={formik.values.pan_copy}
            onDeleteImage={(index) => {
              const updated = formik.values.pan_copy.filter((_, i) => i !== index);
              formik.setFieldValue("pan_copy", updated);
            }}
          />
        )}
        <br />

        {formik.values.banks?.map((bank, index) => (
          <div key={index}>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="filled"
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
              className="login-input"
            />
            <br />
            <Row>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
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
                  className="login-input"
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
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
                  className="login-input"
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="filled"
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
                  className="login-input"
                />
              </Col>
            </Row>
            <br />
            <label htmlFor={`adCode_file_${index}`}>
              Upload AD Code File:&nbsp;
            </label>
            <FileUpload
              label="Upload AD Code File"
              onFilesUploaded={(uploadedFiles) => {
                const current = bank.adCode_file || [];
                const updatedBanks = [...formik.values.banks];
                updatedBanks[index].adCode_file = [...current, ...uploadedFiles];
                formik.setFieldValue("banks", updatedBanks);
                setFileSnackbar(true);
              }}
              bucketPath={`adCode_file_${index}`}
              multiple={true}
              acceptedFileTypes={['.pdf']}
              customerName={formik.values.name_of_individual}
            />
            {bank.adCode_file?.length > 0 && (
              <ImagePreview
                images={bank.adCode_file}
                onDeleteImage={(deleteIndex) => {
                  const updated = bank.adCode_file.filter((_, i) => i !== deleteIndex);
                  const updatedBanks = [...formik.values.banks];
                  updatedBanks[index].adCode_file = updated;
                  formik.setFieldValue("banks", updatedBanks);
                }}
              />
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn"
          aria-label="submit-btn"
          style={{ marginBottom: "20px", padding: "5px" }}
          onClick={handleAddBanks}
        >
          Add AD Code
        </button>

        {getSupportingDocs()}
        <br />

        <label style={{ marginRight: "10px" }}>Other documents:</label>
        <FileUpload
          label="Upload Other Documents"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("other_documents", [...(formik.values.other_documents || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="other_documents"
          multiple={true}
          acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.zip', '.xls', '.xlsx']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.other_documents?.length > 0 && (
          <ImagePreview
            images={formik.values.other_documents}
            onDeleteImage={(index) => {
              const updated = formik.values.other_documents.filter((_, i) => i !== index);
              formik.setFieldValue("other_documents", updated);
            }}
          />
        )}
        <br />

        <label style={{ marginRight: "10px" }}>
          SPCB registration certificate
        </label>
        <FileUpload
          label="Upload SPCB Registration Certificate"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("spcb_reg", [...(formik.values.spcb_reg || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="spcb_reg"
          multiple={true}
          acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.spcb_reg?.length > 0 && (
          <ImagePreview
            images={formik.values.spcb_reg}
            onDeleteImage={(index) => {
              const updated = formik.values.spcb_reg.filter((_, i) => i !== index);
              formik.setFieldValue("spcb_reg", updated);
            }}
          />
        )}
        <br />

        <label style={{ marginRight: "10px" }}>KYC verification images:</label>
        <FileUpload
          label="Upload KYC Verification Images"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("kyc_verification_images", [...(formik.values.kyc_verification_images || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="kyc_verification_images"
          multiple={true}
          acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.kyc_verification_images?.length > 0 && (
          <ImagePreview
            images={formik.values.kyc_verification_images}
            onDeleteImage={(index) => {
              const updated = formik.values.kyc_verification_images.filter((_, i) => i !== index);
              formik.setFieldValue("kyc_verification_images", updated);
            }}
          />
        )}
        <br />

        <label style={{ marginRight: "10px" }}>GST Returns:</label>
        <FileUpload
          label="Upload GST Returns"
          onFilesUploaded={(uploadedFiles) => {
            formik.setFieldValue("gst_returns", [...(formik.values.gst_returns || []), ...uploadedFiles]);
            setFileSnackbar(true);
          }}
          bucketPath="gst_returns"
          multiple={true}
          acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.zip', '.doc', '.docx']}
          customerName={formik.values.name_of_individual}
        />
        {formik.values.gst_returns?.length > 0 && (
          <ImagePreview
            images={formik.values.gst_returns}
            onDeleteImage={(index) => {
              const updated = formik.values.gst_returns.filter((_, i) => i !== index);
              formik.setFieldValue("gst_returns", updated);
            }}
          />
        )}
        <br />

        <button
          type="button"
          className="btn"
          aria-label="submit-btn"
          style={{ marginBottom: "20px" }}
          onClick={handleOpen}
        >
          Preview
        </button>
{/* 
        <button
          type="button"
          className="btn"
          aria-label="test-submit-btn"
          style={{ marginBottom: "20px", marginRight: "10px" }}
          onClick={() => {
            console.log("Test submit clicked");
            formik.handleSubmit();
          }}
        >
          Test Submit
        </button> */}

        <button
          type="submit"
          className="btn"
          aria-label="submit-btn"
          style={{ marginBottom: "20px", marginLeft: "20px" }}
          onClick={() => {
            console.log("Submit button clicked");
            console.log("Form is valid:", formik.isValid);
            console.log("Form errors:", formik.errors);
            console.log("Form touched:", formik.touched);
          }}
        >
          Submit
        </button>

        <Snackbar
          open={fileSnackbar}
          message="File uploaded successfully!"
          sx={{ left: "auto !important", right: "24px !important" }}
        />

        <Preview open={open} handleClose={handleClose} data={formik.values} />
      </form>
    </div>
  );
}

export default ReviseCustomerKyc;
