import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import "./App.css";

const RoomConversation = () => {
  const { id } = useParams(); // ID du salon
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true); // Indicateur de préchargement
  const currentUser = JSON.parse(sessionStorage.getItem("user")); // Utilisateur connecté
  const token = sessionStorage.getItem("token"); // Token d'authentification

  const messagesEndRef = useRef(null); // Référence pour auto-scroll

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true); // Activer le spinner
      try {
        const response = await fetch(`/api/room-messages?roomId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.map((msg) => ({
            text: msg.text || "",
            sender: msg.sender || "unknown",
            timestamp: new Date(msg.timestamp), // Convertir le timestamp en objet Date
          }));
          setMessages(formattedMessages);
        } else {
          console.error("Erreur lors de la récupération des messages.");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false); // Désactiver le spinner
      }
    };

    fetchMessages();
  }, [id, token]); // Recharger à chaque changement de salon (ID)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Auto-scroll à chaque mise à jour des messages

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("/api/send-room-message", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: id, // ID du salon
          message: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          },
        ]);
        setNewMessage("");
      } else {
        console.error("Erreur lors de l'envoi du message.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overflow: "hidden", // Empêche les débordements
        boxSizing: "border-box",
        padding: 2,
        animation: "slideIn 0.5s ease-in-out",
      }}
    >
      {!id ? (
        <Typography variant="h6" color="error" align="center">
          Aucun salon sélectionné
        </Typography>
      ) : (
        <>


          {/* Liste des messages défilables */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "#fff",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Ombre douce pour un look moderne
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : messages.length > 0 ? (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: msg.sender === currentUser?.username ? "right" : "left",
                    marginBottom: 3,
                  }}
                >
                  {/* Affichage du nom de l'expéditeur */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#555",
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    {msg.sender}
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      padding: "12px 20px",
                      borderRadius: "20px",
                      backgroundColor:
                        msg.sender === currentUser?.username ? "#00796b" : "#e0e0e0",
                      color: msg.sender === currentUser?.username ? "#fff" : "#000",
                      maxWidth: "70%",
                      wordWrap: "break-word",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Ombre douce
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "#777",
                      marginTop: "5px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="textSecondary" align="center">
                Aucun message dans ce salon.
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Zone de saisie */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #ddd",
              padding: "16px 0",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <TextField
              fullWidth
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={{
                marginRight: "10px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#ccc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />
<Button
  variant="contained"
  onClick={handleSendMessage}
  sx={{
    background: "linear-gradient(90deg, #007bff, #1e90ff)", 
    color: "#fff",                
    padding: "10px 20px",         
    borderRadius: "25px",         
    fontSize: "1rem",             
    fontWeight: "bold",           
    textTransform: "none",        
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", 
    transition: "background 0.3s, box-shadow 0.3s ease", 
    ":hover": {
      background: "linear-gradient(90deg, #0056b3, #007bff)", 
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)", 
    },
    ":active": {
      transform: "scale(0.98)", 
    },
  }}
  disabled={!newMessage.trim()}
>
  Envoyer
</Button>

          </Box>
        </>
      )}
    </Box>
  );
};

export default RoomConversation;
