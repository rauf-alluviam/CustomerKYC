import React, { useContext } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useSnackbar } from "../contexts/SnackbarContext";

function LoginForm() {
  const { setUser, login } = useContext(UserContext);
  const navigate = useNavigate();
  const { saveTabState } = useNavigation();
  const { showError } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },

    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_STRING}/login`,
          values
        );

        if (res.status === 200) {
          // Store user data using the login function from context
          login(res.data);
          resetForm();
          
          // Set the tab to "New Application" (index 0) and navigate
          saveTabState('/customer-kyc', 0);
          navigate('/customer-kyc');
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          showError(error.response.data.message);
        } else {
          showError("An unexpected error occurred. Please try again later.");
        }
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
      <TextField
        size="small"
        fullWidth
        margin="dense"
        variant="outlined"
        id="username"
        name="username"
        label="Username"
        value={formik.values.username}
        onChange={formik.handleChange}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        type="password"
        size="small"
        fullWidth
        margin="dense"
        variant="outlined"
        id="password"
        name="password"
        label="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        sx={{ marginBottom: 3 }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{
          background: '#2171c2',
          color: '#ffffff',
          fontWeight: 500,
          fontSize: '1rem',
          padding: '12px',
          borderRadius: '6px',
          '&:hover': {
            background: '#1859a3',
            transform: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        Login
      </Button>
    </Box>
  );
}

export default LoginForm;
