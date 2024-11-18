import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
export async function getConnecterUser(request) {
    const token = request.headers.get('Authorization');
    if (!token) {
        console.warn("Authentication token missing");
        return null;
    }

    const bearerToken = token.replace("Bearer ", "").trim();
    if (!bearerToken) {
        console.warn("Empty bearer token after stripping 'Bearer ' prefix");
        return null;
    }

    try {
        console.log("Checking token:", bearerToken);
        const user = await redis.get(bearerToken);

        if (!user || !user.username) {
            console.warn("No user found in Redis for token:", bearerToken);
            return null;
        }

        console.log("Authenticated user:", user.username);
        return user;
    } catch (error) {
        console.error("Error retrieving user from Redis:", error);
        return null;
    }
}

export async function checkSession(request) {
    const user = await getConnecterUser(request);
    return Boolean(user);
}

export function unauthorizedResponse() {
    const error = { code: "UNAUTHORIZED", message: "Session expired" };
    return new Response(JSON.stringify(error), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function triggerNotConnected(res) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Session expired" });
}