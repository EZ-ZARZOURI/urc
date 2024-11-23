import { Redis } from '@upstash/redis';
import { sql } from "@vercel/postgres";

const redis = Redis.fromEnv();

// Function to get the currently connected user from Redis based on the token
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

// Handler for the rooms API endpoint
export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  try {
    // Check if the user is connected (valid session)
    const connected = await checkSession(request);
    if (!connected) {
      console.log("User not connected");
      return unauthorizedResponse();
    }

    // Fetch the list of rooms from the database
    const { rowCount, rows } = await sql`
      SELECT room_id, name, TO_CHAR(created_on, 'DD/MM/YYYY HH24:MI') AS created_on
      FROM rooms
      ORDER BY created_on ASC`;

    console.log("Got " + rowCount + " rooms");

    if (rowCount === 0) {
      // No rooms found, return an empty array
      return new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } else {
      // Return the rooms as a JSON response
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
