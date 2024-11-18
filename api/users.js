import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); 

export const config = {
    runtime: 'edge', // Spécifie l'environnement d'exécution de Vercel
};

export default async function handler(request) {
    try {
        const token = request.headers.get('Authorization')?.replace("Bearer ", "").trim();

        // Vérifier si le token est présent
        if (!token) {
            console.warn("Authentication token missing");
            return unauthorizedResponse(); // Si le token est manquant, retourner un statut non autorisé
        }

        // Vérifier si le token existe dans Redis
        const tok = await redis.get(token);
        if (!tok) {
            console.warn("Token is not valid or expired.");
            return unauthorizedResponse(); // Si le token est invalide, retourner un statut non autorisé
        }

        // Vérifier si la session est active
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse(); // Si la session n'est pas connectée, retourner un statut non autorisé
        }

        // Extraire l'utilisateur actuel à partir de Redis
        const bearerToken = token.trim();
        const user = await redis.get(bearerToken);
        const currentUser = user.username; // Nom de l'utilisateur actuel

        // Requête SQL pour récupérer les utilisateurs
        const { rowCount, rows } = await sql`
            SELECT user_id, username, TO_CHAR(last_login, 'DD/MM/YYYY HH24:MI') AS last_login
            FROM users
            WHERE username != ${currentUser}
            ORDER BY last_login DESC;
        `;
        console.log("Got " + rowCount + " users");

        // Retourner la liste des utilisateurs ou une réponse vide si aucun utilisateur n'est trouvé
        if (rowCount === 0) {
            return new Response("[]", {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify(rows), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
