import { saveSubscription as saveSubscriptionRepo, deleteSubscription } from '../repository/push-notification'

// VAPID公開鍵（環境変数から取得）
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

/**
 * 通知許可を求める
 */
export async function askPermission() {
  const result = await Notification.requestPermission()
  if (result !== 'granted') {
    throw new Error('通知が許可されませんでした')
  }
}

/**
 * PushSubscription を取得
 */
export async function subscribe() {
  const registration = await navigator.serviceWorker.ready
  // VAPID 公開鍵を Base64 → Uint8Array に変換するユーティリティも必要
  const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKey,
  })
  return subscription
}

/**
 * 購読情報をSupabaseに保存する
 */
export async function saveSubscription(subscription: PushSubscription, userId: string) {
  const { error } = await saveSubscriptionRepo(subscription, userId);
  if (error) console.error('保存失敗', error);
  return { error };
}

/**
 * 購読を解除する
 */
export async function unsubscribe(userId: string): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
  }

  // Supabaseからも削除
  const { error } = await deleteSubscription(userId);

  if (error) {
    console.error('購読情報の削除に失敗しました:', error);
  }
}

/**
 * Base64URLエンコードされた文字列をUint8Arrayに変換
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * 通知権限の状態を取得
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * プッシュ通知がサポートされているかチェック
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
