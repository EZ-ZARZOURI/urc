import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Fonction pour obtenir l'utilisateur connecté à partir du token
export async function getConnecterUser(request) {
    let token = new Headers(request.headers).get('Authorization'); // Utilise 'Authorization' au lieu de 'Authentication'
    if (!token) {
        return null;
    }
    token = token.replace("Bearer ", "");
    console.log("checking " + token);
    const user = await redis.get(token);
    if (user) {
        console.log("Got user : " + user.username);
    } else {
        console.log("User not found in Redis for token: " + token);
    }
    return user;
}

// Fonction pour vérifier si l'utilisateur est connecté
export async function checkSession(request) {
    const user = await getConnecterUser(request);
    return (user !== undefined && user !== null && user);
}

// Fonction pour déclencher une réponse non autorisée
export function triggerNotConnected(res) {
    return res.status(401).json({ error: "User not connected" });
}

// Fonction de réponse de session expirée
export function unauthorizedResponse() {
    const error = { code: "UNAUTHORIZED", message: "Session expired" };
    return new Response(JSON.stringify(error), {
        status: 401,
        headers: { 'content-type': 'application/json' },
    });
}

// Code principal pour récupérer les messages de la salle
export default async (req, res) => {
  try {
    // Vérification de l'utilisateur connecté
    const user = await getConnecterUser(req);
    if (!user) {
      return res.status(401).json({ error: "User not connected" });
    }

    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    try {
      // Récupérer les messages de la salle depuis Redis
      const rawMessages = await redis.lrange(`room:${roomId}:messages`, 0, -1);
      console.log(`Raw messages retrieved from Redis for room:${roomId}:`, rawMessages);

      if (!rawMessages || rawMessages.length === 0) {
        console.warn(`No messages found for room:${roomId}`);
        return res.status(404).json({ error: "No messages found for this room" });
      }

      // Parsing des messages
      const parsedMessages = rawMessages.map((msg) => {
        if (typeof msg === 'string') {
          try {
            return JSON.parse(msg); // Convertir JSON string en objet
          } catch (parseError) {
            console.error("Invalid JSON in Redis, skipping message:", msg);
            return null; // Ignorer les messages corrompus
          }
        }
        return msg;
      }).filter(Boolean); // Supprimer les messages invalides

      // Retourner les messages sous forme de réponse
      res.status(200).json(parsedMessages);
    } catch (redisError) {
      console.error("Redis error:", redisError);
      res.status(500).json({ error: "Failed to retrieve messages from Redis" });
    }
  } catch (error) {
    console.error("Error fetching room messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
