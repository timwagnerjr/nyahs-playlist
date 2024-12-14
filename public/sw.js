const CACHE_NAME = "nyahs-playlist-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/manifest.json",
        // Add other static assets here
      ]);
    })
  );
});

self.addEventListener("push", (event) => {
  const options = {
    body: event.data.text(),
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification("Nyah's Playlist", options)
  );
});
