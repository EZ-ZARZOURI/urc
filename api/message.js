import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Fonction pour obtenir l'utilisateur connecté à partir du token
export async function getConnecterUser(request) {
    let token = new Headers(request.headers).get('Authorization');
    if (!token) {
        return null;
    }
    token = token.replace("Bearer ", "");
    console.log("Checking token:", token);

    const user = await redis.get(token);

    // Vérifiez si `user` est un objet ou une chaîne JSON
    if (user) {
        try {
            return typeof user === 'string' ? JSON.parse(user) : user;
        } catch (parseError) {
            console.error("Error parsing user from Redis:", user);
            return null;
        }
    } else {
        console.log("User not found in Redis for token:", token);
    }
    return null;
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

// Code principal pour envoyer un message dans la conversation
export default async (req, res) => {
  try {
      const user = await getConnecterUser(req);
      if (!user) {
          return res.status(401).json({ error: "User not connected" });
      }

      const { recipientId, message } = req.body;
      if (!recipientId || !message) {
          return res.status(400).json({ error: "Invalid request data" });
      }

      console.log("Current user ID:", user.id);
      console.log("Recipient ID:", recipientId);

      const conversationId = generateConversationId(user.id, recipientId);
      const conversationKey = `conversation:${conversationId}`;
      console.log("Storing message for key:", conversationKey);

      const newMessage = {
          text: message,
          sender: user.username,
          timestamp: new Date().toISOString(),
      };

      try {
          const serializedMessage = JSON.stringify(newMessage);
          console.log("Serialized message being stored in Redis:", serializedMessage);
          await redis.rpush(conversationKey, serializedMessage);

          res.status(201).json({ success: true, message: newMessage });
      } catch (redisError) {
          console.error("Redis error:", redisError);
          res.status(500).json({ error: "Failed to save message to Redis" });
      }
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fonction pour générer un ID de conversation basé sur deux IDs d'utilisateurs
function generateConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('-');
}
