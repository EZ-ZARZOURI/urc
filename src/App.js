import './App.css';
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Login } from "./user/Login";
import { Register } from "./user/Register";
import Messages from "./Messages";
import Conversation from "./Conversation";
import { Navbar } from './components/Navbar';
import RoomConversation from "./RoomConversation";

// Importez le client Pusher Push Notifications
import { Client } from '@pusher/push-notifications-web';

// Configurer l'URL de votre API pour générer le token
const TOKEN_API_URL = '/api/beams';

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token") // Vérifiez si le token existe au démarrage de l'application
  );

  useEffect(() => {
    // Demander la permission pour les notifications
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notifications granted');
        } else {
          console.warn('Notifications denied');
        }
      });
    }

    // Enregistrer le service worker pour gérer les notifications push
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Si l'utilisateur est authentifié, configurer les notifications push
    if (isAuthenticated) {
      const beamsClient = new Client({
        instanceId: '1c3b8934-a9a0-4cf5-b581-f18b6e57d0fb', // Remplacez par votre `instanceId` Pusher
      });

      // Récupérer le token depuis votre API backend
      const fetchToken = async () => {
        const response = await fetch(TOKEN_API_URL, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token"), // Ajoutez le token d'authentification
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: sessionStorage.getItem("user_externalId"), // Utilisez l'ID de l'utilisateur
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const beamsToken = data.token; // Le token retourné par votre API
          
          beamsClient.start()
            .then(() => beamsClient.addDeviceInterest('global')) // Ajouter un "intérêt" global
            .then(() => beamsClient.setUserId(sessionStorage.getItem("user_externalId"), beamsToken)) // Utilisez l'ID externe de l'utilisateur et le token
            .then(() => {
              beamsClient.getDeviceId().then(deviceId => console.log("Push id : " + deviceId));
            })
            .catch(console.error);
        } else {
          console.error("Failed to fetch token");
        }
      };

      fetchToken();
    } else {
      // Si l'utilisateur n'est pas authentifié, vous pouvez vous abonner à un intérêt générique ou définir un comportement
      const beamsClient = new Client({
        instanceId: '1c3b8934-a9a0-4cf5-b581-f18b6e57d0fb', // Remplacez par votre `instanceId` Pusher
      });

      beamsClient.start()
        .then(() => beamsClient.addDeviceInterest('hello')) // Remplacez 'hello' par l'intérêt que vous voulez suivre
        .then(() => console.log('Successfully registered and subscribed!'))
        .catch(console.error);
    }

  }, [isAuthenticated]);

  const noHeaderRoutes = ["/login", "/register"];

  return (
    <>
      {/* Afficher Navbar uniquement si on n'est pas sur les pages login ou register */}
      {!noHeaderRoutes.includes(location.pathname) && (
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Messages />}>
          <Route path="user/:id" element={<Conversation />} />
          <Route path="room/:id" element={<RoomConversation />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
