import { useState } from "react";
import { loginUser } from "./loginApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";

// Importation des composants MUI nécessaires
import { TextField, Button, Typography, Box } from '@mui/material';

export function Login() {
  const [error, setError] = useState({} as CustomError);
  const [session, setSession] = useState({} as Session);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    loginUser(
      {
        user_id: -1,
        username: data.get('login') as string,
        password: data.get('password') as string,
      },
      (result: Session) => {
        console.log(result);
        setSession(result);
        form.reset();
        setError(new CustomError(""));
      },
      (loginError: CustomError) => {
        console.log(loginError);
        setError(loginError);
        setSession({} as Session);
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', padding: 3 }}>
      
      
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

      {session.token && (
        <Typography variant="body1" color="primary" align="center" sx={{ marginTop: 2 }}>
          {session.username} : {session.token}
        </Typography>
      )}

      {error.message && (
        <Typography variant="body2" color="error" align="center" sx={{ marginTop: 2 }}>
          {error.message}
        </Typography>
      )}
    </Box>
  );
}
