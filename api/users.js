import { Redis } from '@upstash/redis';
import { sql } from "@vercel/postgres";

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

// Handler to fetch users after verifying session
export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  try {
    // Check if the user is connected (valid session)
    const connectedUser = await getConnectedUser(request);
    if (!connectedUser) {
      console.log("Not connected");
      return unauthorizedResponse();
    }

    // Fetch the list of users from the database, excluding the connected user
    const { rowCount, rows } = await sql`
      SELECT user_id, username, TO_CHAR(last_login, 'DD/MM/YYYY HH24:MI') AS last_login
      FROM users
      WHERE username != ${connectedUser.username}
      ORDER BY last_login DESC
    `;
    console.log(`Got ${rowCount} users (excluding connected user)`);

    if (rowCount === 0) {
      // No users found, return an empty array
      return new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } else {
      // Return the filtered list of users as JSON
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
  } catch (error) {
    // Error handling
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
