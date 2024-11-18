// src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("externalId");
    sessionStorage.removeItem("username");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          UBO Relay Chat
        </Typography>
        {isAuthenticated ? (
          <Button color="inherit" onClick={handleLogout}>
            Déconnexion
          </Button>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Connexion</Button>
            <Button color="inherit" component={Link} to="/register">Créer un compte</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
