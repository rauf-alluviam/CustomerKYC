import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import LoginForm from "./LoginForm";

function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: '#fffefe',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={1}
          sx={{
            padding: 4,
            borderRadius: 2,
            textAlign: "center",
            background: '#fffefe',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#000000',
              marginBottom: 1,
            }}
          >
            Customer KYC System
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
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
