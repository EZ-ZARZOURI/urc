import { getConnecterUser, triggerNotConnected } from "../lib/session";
import { PushNotifications } from "@pusher/push-notifications-server";

export default async (req, res) => {
    const userIDInQueryParam = req.query["user_id"];
    const user = await getConnecterUser(req);

    if (user === undefined || user === null || userIDInQueryParam !== user.externalId) {
        console.log("User not connected");
        triggerNotConnected(res);
        return;
    }

    const beamsClient = new PushNotifications({
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });

    const beamsToken = beamsClient.generateToken(user.externalId);
    console.log("Beams token:", JSON.stringify(beamsToken));

    res.send(beamsToken);
};
