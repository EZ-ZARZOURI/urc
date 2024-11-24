import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./registerApi";
import { TextField, Button, Typography, Box } from "@mui/material";
import { CustomError } from "../model/CustomError"; // Assurez-vous que le chemin est correct

export function Register() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const username = data.get("username") as string;
    const password = data.get("password") as string;
    const email = data.get("email") as string;

    // Vérification de la longueur de l'identifiant et du mot de passe
    if (username.length < 4) {
      setError("L'identifiant doit contenir au moins 4 caractères.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsSubmitting(true);
    registerUser(
      { username, password, email },
      () => {
        form.reset();
        setIsSubmitting(false);
        setError(null);
        navigate("/login"); // Redirection vers la page de connexion après inscription réussie
      },
      (registerError: CustomError) => {  // Ajout du type CustomError ici
        setIsSubmitting(false);
        setError(registerError?.message || "Une erreur s'est produite lors de l'inscription.");
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "0 auto", padding: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom d'utilisateur"
          name="username"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Adresse e-mail"
          name="email"
          type="email"
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
          disabled={isSubmitting}
        >
          Créer un compte
        </Button>
      </form>

      {error && (
        <Typography
          variant="body2"
          color="error"
          align="center"
          sx={{ marginTop: 2 }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
