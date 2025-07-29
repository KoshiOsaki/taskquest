self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

// Push 到着
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  console.log("[push]", data);

  // iOS は body が無いと表示されにくい
  const title = data.title ?? "通知";
  const options = {
    body: data.body ?? "",
    tag: data.options?.tag,
    vibrate: data.options?.vibrate,
    // icon, badge など必要なら追加
  };

  // showNotification を必ず呼ぶ
  event.waitUntil(self.registration.showNotification(title, options));
});
