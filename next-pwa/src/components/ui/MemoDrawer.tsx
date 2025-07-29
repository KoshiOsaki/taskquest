"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Drawer, CloseButton, Portal, Textarea, Text } from "@chakra-ui/react";
import {
  fetchLatestMemo,
  saveMemo as saveMemoRepo,
} from "../../repository/memo";

interface Memo {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface MemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoDrawer: React.FC<MemoDrawerProps> = ({ isOpen, onClose }) => {
  const [memo, setMemo] = useState<Memo | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // メモの保存関数
  const saveMemo = useCallback(async () => {
    try {
      const { data, error } = await saveMemoRepo(content, memo?.id);

      if (error) {
        console.error("Error saving memo:", error);
      } else if (data) {
        setMemo(data);
      }
    } catch (error) {
      console.error("Error saving memo:", error);
    }
  }, [content, memo]);

  // メモの読み込み関数
  const fetchMemo = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchLatestMemo();

      if (error) {
        console.error("Error fetching memo:", error);
      } else if (data) {
        setMemo(data);
        setContent(data.content || "");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // メモの読み込み
  useEffect(() => {
    if (isOpen) {
      fetchMemo();
      // メモを開いた時に自動でテキストエリアにフォーカス
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 300); // Drawerのアニメーション後にフォーカス
    }
  }, [isOpen, fetchMemo]);

  // 自動保存（デバウンス）
  useEffect(() => {
    if (content !== (memo?.content || "")) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveMemo();
      }, 1000); // 1秒後に保存
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, memo, saveMemo]);

  const handleClose = () => {
    // 閉じる前に最後の保存を実行
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveMemo();
    }
    onClose();
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          handleClose();
        }
      }}
      placement="bottom"
      size="lg"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            height="70vh"
            borderTopRadius="xl"
            style={{
              transform: "translateY(-20vh)", // 画面の10%分上に表示
            }}
          >
            <Drawer.Header>
              <Drawer.Title>
                <Text fontSize="lg" fontWeight="bold">
                  メモ
                </Text>
              </Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body p={4}>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ここにメモを入力してください..."
                height="100%"
                border="none"
                resize="none"
                fontSize="md"
                _focus={{
                  boxShadow: "none",
                  outline: "none",
                }}
                disabled={isLoading}
              />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
