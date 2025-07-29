import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// タイムゾーンプラグインを設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo'); // JSTをデフォルトに設定

// 現在の時刻から現在のタームを算出する関数
export const getCurrentTerm = (): number => {
  const now = dayjs().tz('Asia/Tokyo'); // 明示的にJSTで現在時刻を取得
  const hour = now.hour();

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

// topで日付範囲を計算するユーティリティ関数
export const getDateRange = () => {
  const today = dayjs().tz('Asia/Tokyo'); // JSTで現在の日付を取得
  
  // 前日
  const yesterday = today.subtract(1, 'day');
  
  // 3日後
  const threeDaysLater = today.add(3, 'day');
  
  return {
    from: dayjs(yesterday).format('YYYY-MM-DD'),
    to: dayjs(threeDaysLater).format('YYYY-MM-DD'),
    today: dayjs(today).format('YYYY-MM-DD')
  };
};


// 現在時刻がターム内の何割の場所に当たるか計算する関数
export const calculateTimePosition = (
    termStartHour: number,
    termEndHour: number
  ): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 現在時刻を小数点以下の時間として表現（例: 14時30分 = 14.5）
    const currentTimeDecimal = currentHour + currentMinute / 60;

    // タームの開始時刻から終了時刻までの間で、現在時刻が何割の位置にあるか計算
    if (
      currentTimeDecimal >= termStartHour &&
      currentTimeDecimal < termEndHour
    ) {
      return (
        (currentTimeDecimal - termStartHour) / (termEndHour - termStartHour)
      );
    }

    // 現在時刻がタームの範囲外の場合は-1を返す
    return -1;
  };
