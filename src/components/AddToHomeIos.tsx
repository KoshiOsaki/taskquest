"use client";
import { useEffect, useState } from "react";

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function AddToHomeIos() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandalone = (window.navigator as NavigatorWithStandalone)
      .standalone;
    if (isIos && !isInStandalone) setShow(true);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 rounded-xl shadow-lg bg-white/90 p-4 backdrop-blur">
      <p className="text-sm">
        ホーム画面に追加するには
        <strong>共有ボタン→「ホーム画面に追加」</strong>
        をタップしてください
      </p>
      <button onClick={() => setShow(false)} className="mt-2 text-blue-600">
        閉じる
      </button>
    </div>
  );
}
