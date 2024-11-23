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

// Code principal de gestion des conversations
export default async (req, res) => {
    try {
        // Utilisation de la fonction getConnecterUser pour vérifier l'utilisateur
        const user = await getConnecterUser(req);
        if (!user) {
            return res.status(401).json({ error: "User not connected" });
        }
  
        const { recipientId } = req.query;
        if (!recipientId) {
            return res.status(400).json({ error: "recipientId is required" });
        }
  
        const conversationId = generateConversationId(user.id, recipientId);
  
        try {
            // Récupération des messages de Redis pour la conversation
            const messages = await redis.lrange(`conversation:${conversationId}`, 0, -1);
            console.log("Raw messages retrieved from Redis:", messages); // Log brut
  
            if (!messages || messages.length === 0) {
                return res.status(404).json({ error: "No messages found for this conversation" });
            }
  
            // Pas de parsing si déjà des objets
            const parsedMessages = messages.map((msg) => {
                if (typeof msg === "string") {
                    try {
                        return JSON.parse(msg); // Si c'est une chaîne JSON
                    } catch (parseError) {
                        console.error("Invalid JSON in Redis:", msg);
                        return null; // Ignorer les messages non valides
                    }
                }
                return msg; // Si c'est déjà un objet
            }).filter(Boolean);
  
            res.status(200).json(parsedMessages);
        } catch (redisError) {
            console.error("Redis error:", redisError);
            res.status(500).json({ error: "Failed to retrieve messages from Redis" });
        }
    } catch (error) {
        console.error("Error fetching conversation messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fonction pour générer un ID de conversation basé sur deux IDs d'utilisateurs
function generateConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('-');
}
