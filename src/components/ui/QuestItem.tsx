"use client";

import { Checkbox, Flex, Input, IconButton } from "@chakra-ui/react";
import { Quest } from "@/app/page";
import { useState, useRef, useEffect } from "react";
import { FiTrash2, FiSkipForward } from "react-icons/fi";

interface QuestItemProps {
  quest: Quest;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUpdate?: (id: string, newTitle: string) => void;
}

export const QuestItem = ({ 
  quest, 
  onToggleComplete, 
  onDelete, 
  onSkip, 
  onUpdate 
}: QuestItemProps) => {
  const { id, title, is_done } = quest;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのイベント伝播を防ぐ
    if (!is_done) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== title) {
      onUpdate?.(id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <Flex
      align="center"
      py={1}
      gap={2}
      opacity={is_done ? 0.6 : 1}
      onClick={(e) => e.stopPropagation()} // 親要素へのイベント伝播を防ぐ
    >
      <Checkbox.Root 
        checked={is_done} 
        onCheckedChange={(checked) => onToggleComplete?.(id, !!checked.checked)}
      >
        <Checkbox.Indicator />
      </Checkbox.Root>
      
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          size="sm"
          variant="flushed"
          flex={1}
          fontSize="sm"
          py={0}
          border="none"
          borderRadius={0}
          px={0}
          _focus={{ boxShadow: "none" }}
        />
      ) : (
        <Input
          value={title}
          onClick={handleInputClick}
          readOnly
          size="sm"
          variant="flushed"
          flex={1}
          fontSize="sm"
          py={0}
          border="none"
          borderRadius={0}
          px={0}
          cursor={is_done ? "default" : "text"}
          textDecoration={is_done ? "line-through" : "none"}
          color={is_done ? "gray.400" : "gray.700"}
          _focus={{ boxShadow: "none" }}
        />
      )}
      
      <IconButton
        aria-label="次のタームにスキップ"
        size="xs"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onSkip?.(id);
        }}
        opacity={0.6}
        _hover={{ opacity: 1 }}
      >
        <FiSkipForward />
      </IconButton>
      
      <IconButton
        aria-label="削除"
        size="xs"
        variant="ghost"
        colorScheme="red"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(id);
        }}
        opacity={0.6}
        _hover={{ opacity: 1 }}
      >
        <FiTrash2 />
      </IconButton>
    </Flex>
  );
};
