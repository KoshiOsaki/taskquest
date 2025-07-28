// 現在の時刻から現在のタームを算出する関数
export  const getCurrentTerm = (): number => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 6 && hour < 9) return 0;   // 0: 6-9時
  if (hour >= 9 && hour < 12) return 1;  // 1: 9-12時
  if (hour >= 12 && hour < 15) return 2; // 2: 12-15時
  if (hour >= 15 && hour < 18) return 3; // 3: 15-18時
  if (hour >= 18 && hour < 21) return 4; // 4: 18-21時
  if (hour >= 21 && hour < 24) return 5; // 5: 21-24時
  if (hour >= 0 && hour < 3) return 6;   // 6: 0-3時
  if (hour >= 3 && hour < 6) return 7;   // 7: 3-6時

  // 何らかの理由で上記の条件に一致しない場合は現在の時間帯に最も近いタームを返す
  return 1; // デフォルトは9-12時のターム
};
