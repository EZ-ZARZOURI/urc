import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";
import { Redis } from "@upstash/redis";

// Initialise Redis
const redis = Redis.fromEnv();

// Configuration pour l'exécution de Vercel
export const config = {
    runtime: "edge",
};

// Fonction pour récupérer les utilisateurs
export async function getUsers(request) {
    try {
        const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            console.warn("Authentication token missing");
            return unauthorizedResponse();
        }

        const tok = await redis.get(token);
        if (!tok) {
            console.warn("Token is not valid or expired.");
            return unauthorizedResponse();
        }

        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const bearerToken = token.trim();
        const user = await redis.get(bearerToken);
        const currentUser = user.username;

        const { rowCount, rows } = await sql`
            SELECT user_id, username, TO_CHAR(last_login, 'DD/MM/YYYY HH24:MI') AS last_login
            FROM users
            WHERE username != ${currentUser}
            ORDER BY last_login DESC;
        `;

        console.log(`Got ${rowCount} users`);

        if (rowCount === 0) {
            return new Response("[]", {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        } else {
            return new Response(JSON.stringify(rows), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
}
