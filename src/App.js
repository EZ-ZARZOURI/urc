import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Messages from './components/messages';
import { Register } from './user/Register';
import { Navbar } from './components/Navbar';
import ChatState from './components/Message/ChatState'; // Import du composant ChatState pour la messagerie

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Messages />} />
        {/* Ajout de la route pour les discussions spécifiques à un utilisateur */}
        <Route path="/messages/user/:userId" element={<ChatState />} />
      </Routes>
    </Router>
  );
}

export default App;
