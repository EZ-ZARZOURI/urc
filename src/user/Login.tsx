import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Ensure this import is correct
import { loginUser } from "./loginApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { TextField, Button, Typography, Box } from "@mui/material";

export function Login({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [error, setError] = useState<CustomError | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    loginUser(
      {
        user_id: -1,
        username: data.get("login") as string,
        password: data.get("password") as string,
      },
      (result: Session) => {
        console.log(result);
        sessionStorage.setItem("token", result.token); // Save token to sessionStorage
        setIsAuthenticated(true); // Update authentication state
        navigate("/messages"); // Redirect to messages
      },
      (loginError: CustomError) => {
        console.error(loginError);
        setError(loginError);
        setIsAuthenticated(false); // Ensure state reflects failed login
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "0 auto", padding: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom d'utilisateur"
          name="login"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Mot de passe"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Connexion
        </Button>
      </form>
      {error && error.message && (
        <Typography
          variant="body2"
          color="error"
          align="center"
          sx={{ marginTop: 2 }}
        >
          {error.message}
        </Typography>
      )}
    </Box>
  );
}
