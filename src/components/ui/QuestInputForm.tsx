'use client';

import { Input } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

interface QuestInputFormProps {
  title: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  onSaveAndNew: (newTitle: string) => void;
}

export const QuestInputForm = ({ title, onSave, onCancel, onSaveAndNew }: QuestInputFormProps) => {
  const [currentTitle, setCurrentTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleBlur = () => {
    if (currentTitle.trim()) {
      onSave(currentTitle);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentTitle.trim()) {
        onSaveAndNew(currentTitle);
        setCurrentTitle(''); // 新しい入力のためにクリア
      }
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Input
      ref={inputRef}
      value={currentTitle}
      onChange={(e) => setCurrentTitle(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="クエストを入力..."
      size="sm"
      bg="white"
      borderWidth="1px"
      borderRadius="md"
    />
  );
};
