// api/messages.js
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const token = request.headers.get('Authorization')?.replace("Bearer ", "").trim();

  // Vérification de l'authentification
  if (!token || !(await redis.get(token))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { username } = JSON.parse(await redis.get(token));

  if (request.method === 'POST') {
    try {
      const { recipient, content } = await request.json();

      if (!recipient || !content) {
        return new Response("Recipient and content are required", { status: 400 });
      }

      const conversationKey = `conversation:${[username, recipient].sort().join(':')}`;
      await redis.lpush(conversationKey, JSON.stringify({
        sender: username,
        content,
        timestamp: new Date().toISOString(),
      }));

      return new Response(JSON.stringify({ message: "Message sent" }), { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const recipient = url.searchParams.get('recipient');

      if (!recipient) {
