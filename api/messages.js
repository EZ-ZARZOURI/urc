import { Redis } from '@upstash/redis';
import { checkSession, unauthorizedResponse } from "../lib/session";

const redis = Redis.fromEnv();

export const config = {
  runtime: 'edge', // Utiliser l'environnement Edge pour plus de performance
};

export default async function handler(request) {
  try {
    // Vérifier si la méthode est POST
    if (request.method !== 'POST') {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Récupérer le token d'autorisation
    const token = request.headers.get('Authorization')?.replace("Bearer ", "").trim();

    // Vérifier si le token est présent
    if (!token) {
      return unauthorizedResponse(); // Si le token est manquant
    }

    // Vérifier si la session est active
    const connected = await checkSession(request);
    if (!connected) {
      return unauthorizedResponse(); // Si la session n'est pas connectée
    }

    // Récupérer les informations de l'utilisateur actuel depuis Redis
    const userSession = await redis.get(token);
    const currentUser = JSON.parse(userSession).username;

    // Récupérer le contenu du message et le destinataire depuis le corps de la requête
    const { recipient, content } = await request.json();

    if (!recipient || !content) {
      return new Response("Missing recipient or content", { status: 400 });
    }

    // Créer une clé de conversation basée sur les deux utilisateurs
    const conversationKey = `conversation:${[currentUser, recipient].sort().join(':')}`;

    // Ajouter le message à la conversation dans Redis (LPUSH pour ajouter le message à gauche)
    await redis.lpush(conversationKey, JSON.stringify({
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
    }));

    // Répondre avec un succès
    return new Response("Message sent", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
