// src/pages/LoginPage.js
import React from 'react';
import { Login } from '../user/Login';
import { Container, Typography, Box } from '@mui/material';

function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" component="h2" gutterBottom>
          Connexion
        </Typography>
        <Login />
      </Box>
    </Container>
  );
}

export default LoginPage;
