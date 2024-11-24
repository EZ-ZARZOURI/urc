import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./registerApi";
import { TextField, Button, Typography, Box } from "@mui/material";
import { CustomError } from "../model/CustomError"; // Assurez-vous que le chemin est correct
import { Navbar } from "../components/Navbar"; // Importez la Navbar

export function Register() {
  const [error, setError] = useState<string | null>(null); // État pour gérer les erreurs
  const [isSubmitting, setIsSubmitting] = useState(false); // État pour gérer le bouton de soumission
  const navigate = useNavigate();

  // Gestion de la soumission du formulaire
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Extraction des données du formulaire
    const username = data.get("username") as string;
    const password = data.get("password") as string;
    const email = data.get("email") as string;

    // Vérifications des champs
    if (username.length < 4) {
      setError("L'identifiant doit contenir au moins 4 caractères.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsSubmitting(true); // Désactiver le bouton pendant la soumission
    registerUser(
      { username, password, email },
      () => {
        form.reset(); // Réinitialiser le formulaire
        setIsSubmitting(false);
        setError(null);
        navigate("/login"); // Rediriger après une inscription réussie
      },
      (registerError: CustomError) => {
        setIsSubmitting(false);
        setError(registerError?.message || "Une erreur s'est produite lors de l'inscription.");
      }
    );
  };

  return (
    <>
      {/* Navbar en haut de la page */}
      <Navbar
        isAuthenticated={false}
        setIsAuthenticated={() => {
          /* No-op since authentication is not handled on this page */
        }}
      />

      {/* Formulaire d'inscription */}
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

        {/* Affichage des erreurs */}
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
    </>
  );
}
