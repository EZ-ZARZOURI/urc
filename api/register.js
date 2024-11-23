import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const token = request.headers.get('Authorization')?.replace("Bearer ", "").trim();

  // Vérifier l'authentification
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

      return new Response("Message sent", { status: 200 });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const recipient = url.searchParams.get('recipient');

      if (!recipient) {
        return new Response("Recipient is required", { status: 400 });
      }

      const conversationKey = `conversation:${[username, recipient].sort().join(':')}`;
      const messages = await redis.lrange(conversationKey, 0, -1);

      return new Response(JSON.stringify(messages.reverse().map(JSON.parse)), { status: 200 });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
