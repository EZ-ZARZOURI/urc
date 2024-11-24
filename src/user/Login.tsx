import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./loginApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { TextField, Button, Typography, Box } from "@mui/material";
import { Navbar } from "../components/Navbar"; // Import de la Navbar

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
        sessionStorage.setItem("token", result.token);
        setIsAuthenticated(true);
        navigate("/messages");
      },
      (loginError: CustomError) => {
        console.error(loginError);
        setError(loginError);
        setIsAuthenticated(false);
      }
    );
  };

  return (
    <>
      {/* Ajout de la Navbar */}
      <Navbar isAuthenticated={false} setIsAuthenticated={setIsAuthenticated} />
      {/* Formulaire de connexion */}
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
    </>
  );
}
