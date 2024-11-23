import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Box, Container, Typography, Divider, CircularProgress } from '@mui/material';
import UserList from './components/UserList';
import RoomList from './components/RoomList';

const Messages = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté pour voir les utilisateurs.');
          setLoadingUsers(false);
          return;
        }

        const response = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger les utilisateurs.');
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté pour voir les salons.');
          setLoadingRooms(false);
          return;
        }

        const response = await fetch('/api/rooms', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        } else {
          throw new Error('Erreur lors de la récupération des salons');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger les salons.');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchUsers();
    fetchRooms();
  }, []);

  const handleUserSelect = (id) => {
    navigate(`/messages/user/${id}`);
  };

  const handleRoomSelect = (id) => {
    navigate(`/messages/room/${id}`);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        marginTop: '20px',
        height: '100vh',
        backgroundColor: 'linear-gradient(135deg, #e3f2fd, #90caf9)', // Dégradé bleu clair
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: '30%',
          backgroundColor: '#ffffff', // Blanc pour les utilisateurs/salons
          borderRight: '1px solid #ddd',
          padding: '20px',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            marginBottom: 2,
            color: '#1976d2', // Bleu pour le texte
            fontWeight: 'bold',
          }}
        >
          Utilisateurs
        </Typography>
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <UserList users={users} onUserSelect={handleUserSelect} />
        )}

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="h6"
          sx={{
            marginBottom: 2,
            color: '#1976d2',
            fontWeight: 'bold',
          }}
        >
          Salons
        </Typography>
        {loadingRooms ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <RoomList rooms={rooms} onRoomSelect={handleRoomSelect} />
        )}
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          padding: '20px',
          background: 'linear-gradient(135deg, #90caf9, #42a5f5)', // Dégradé bleu pour l'espace de chat
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 10px 10px 0',
        }}
      >
        <Outlet />
      </Box>
    </Container>
  );
};

export default Messages;
