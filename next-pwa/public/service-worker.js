// プッシュ通知対応のサービスワーカー

// プッシュ通知を受信したときの処理
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'TaskQuest',
    body: 'プッシュ通知を受信しました',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'taskquest-notification',
    requireInteraction: false,
  };

  // プッシュデータがある場合は使用
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (e) {
      console.error('プッシュデータの解析に失敗:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data || {},
    })
  );
});

// 通知をクリックしたときの処理
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  // アプリを開く
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 既にタブが開いている場合はそれにフォーカス
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 開いているタブがない場合は新しいタブを開く
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// バックグラウンド同期（オプション）
self.addEventListener('sync', function(event) {
  console.log('Background sync:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // バックグラウンドでの処理をここに記述
      console.log('バックグラウンド同期を実行')
    );
  }
});

// サービスワーカーのインストール
self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// サービスワーカーのアクティベート
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});
