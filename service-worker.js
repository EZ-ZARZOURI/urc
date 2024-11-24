importScripts("https://js.pusher.com/beams/service-worker.js");

// Écoute des notifications push
self.addEventListener("push", function (event) {
    const notificationData = event.data.json();
    const title = notificationData.notification.title || "New message";
    const options = {
      body: notificationData.notification.body,
      icon: notificationData.notification.icon || "/icon.png",
      data: notificationData.data,
      tag: "new-message",
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });