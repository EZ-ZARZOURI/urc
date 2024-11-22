import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const token = request.headers.get('Authorization')?.replace("Bearer ", "").trim();
  if (!token || !(await redis.get(token))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { username } = JSON.parse(await redis.get(token));

  if (request.method === 'POST') {
    const { recipient, content } = await request.json();
    const conversationKey = `conversation:${[username, recipient].sort().join(':')}`;

    await redis.lpush(conversationKey, JSON.stringify({
      sender: username,
      content,
      timestamp: new Date().toISOString(),
    }));

    return new Response("Message sent", { status: 200 });
  }

  if (request.method === 'GET') {
    const { recipient } = request.query;
    const conversationKey = `conversation:${[username, recipient].sort().join(':')}`;
    const messages = await redis.lrange(conversationKey, 0, -1);

    return new Response(JSON.stringify(messages.map(JSON.parse)), { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
