import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import LoginForm from "./LoginForm";

function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.1) 0%, rgba(160, 160, 160, 0.1) 100%)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            textAlign: "center",
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2c3e50',
              marginBottom: 1,
            }}
          >
            Customer KYC System
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6c757d',
              marginBottom: 4,
            }}
          >
            Please login to continue
          </Typography>
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
