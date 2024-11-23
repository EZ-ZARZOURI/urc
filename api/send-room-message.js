import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Function to get the connected user from Redis based on the token
export async function getConnectedUser(request) {
    let token = new Headers(request.headers).get('Authorization'); // Use 'Authorization' header
    if (!token) {
        return null;
    }
    token = token.replace("Bearer ", "");
    console.log("Checking token: " + token);
    const user = await redis.get(token);
    if (user) {
        console.log("Got user: " + user.username);
    } else {
        console.log("User not found in Redis for token: " + token);
    }
    return user;
}

// Function to check if a session is active
export async function checkSession(request) {
    const user = await getConnectedUser(request);
    return user !== undefined && user !== null && user;
}

// Trigger a response when the user is not connected
export function triggerNotConnected(res) {
    return res.status(401).json({ error: "User not connected" });
}

// Response when the session has expired or is unauthorized
export function unauthorizedResponse() {
    const error = { code: "UNAUTHORIZED", message: "Session expired" };
    return new Response(JSON.stringify(error), {
        status: 401,
        headers: { 'content-type': 'application/json' },
    });
}

// Handler to send room messages after verifying session
export default async function handler(req, res) {
  try {
    // Verify if the user is connected (check session)
    const user = await getConnectedUser(req);
    if (!user) {
      console.log("User not connected");
      return res.status(401).json({ error: "User not connected" });
    }

    // Retrieve the request parameters for room and message
    const { roomId, message } = req.body;
    if (!roomId || !message) {
      console.log("Missing roomId or message");
      return res.status(400).json({ error: "roomId and message are required" });
    }

    // Create the new message
    const newMessage = {
      text: message,
      sender: user.username,
      timestamp: new Date().toISOString(),
    };

    // Log the message before storing it in Redis
    const serializedMessage = JSON.stringify(newMessage);
    console.log("Serialized message to store in Redis:", serializedMessage);

    try {
      // Add the message to Redis for the specified room
      await redis.rpush(`room:${roomId}:messages`, serializedMessage);
      console.log(`Message stored in Redis for room:${roomId}:`, serializedMessage);

      // Return a success response
      res.status(201).json({ success: true, message: newMessage });
    } catch (redisError) {
      console.error("Redis error:", redisError);
      res.status(500).json({ error: "Failed to save message to Redis" });
    }
  } catch (error) {
    console.error("Error sending room message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
