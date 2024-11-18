// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../user/loginApi";
import { TextField, Button, Typography, Box } from "@mui/material";

export function LoginPage({ setIsAuthenticated }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    loginUser(
      {
        user_id: -1,
        username: data.get("login"),
        password: data.get("password"),
      },
      (result) => {
        console.log(result);
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("username", result.username);
        setIsAuthenticated(true); // Mettre à jour l'état d'authentification
        navigate("/messages");
      },
      (loginError) => {
        console.error(loginError);
        setError(loginError.message);
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "0 auto", padding: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField label="Nom d'utilisateur" name="login" fullWidth margin="normal" variant="outlined" />
        <TextField label="Mot de passe" name="password" type="password" fullWidth margin="normal" variant="outlined" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
          Connexion
        </Button>
      </form>
      {error && (
        <Typography variant="body2" color="error" align="center" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default LoginPage;
