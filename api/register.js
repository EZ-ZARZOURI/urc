// src/api/register.js
import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = { runtime: 'edge' };
const redis = Redis.fromEnv();

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Méthode non autorisée' }), {
            status: 405,
            headers: { 'content-type': 'application/json' },
        });
    }

    try {
        const { username, email, password } = await request.json();
        if (!username || !email || !password) {
            return new Response(JSON.stringify({ message: "Champs requis" }), { status: 400 });
        }

        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashedPassword = arrayBufferToBase64(hash);
        const externalId = crypto.randomUUID();
        const client = await db.connect();

        const result = await client.sql`
            INSERT INTO users (username, email, password, created_on, external_id) 
            VALUES (${username}, ${email}, ${hashedPassword}, NOW(), ${externalId})
            RETURNING user_id, username, email, external_id
        `;
        const newUser = result.rows[0];
        const token = crypto.randomUUID();
        await redis.set(token, { id: newUser.user_id, username: newUser.username, email: newUser.email, externalId: newUser.external_id }, { ex: 3600 });

        return new Response(JSON.stringify({ message: 'Utilisateur créé', token, user: newUser }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Erreur d’inscription' }), { status: 500 });
    }
}
