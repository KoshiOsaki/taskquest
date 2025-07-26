'use client';

import { Flex, Input, IconButton } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

import { useState } from 'react';

interface QuestInputFormProps {
  onAddQuest: (title: string, time: string) => void;
}

export const QuestInputForm = ({ onAddQuest }: QuestInputFormProps) => {
  const [questTitle, setQuestTitle] = useState('');
  const [questTime, setQuestTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questTitle.trim() && questTime.trim()) {
      onAddQuest(questTitle, questTime);
      setQuestTitle('');
      setQuestTime('');
    }
  };

  return (
    <Flex as="form" p={2} onSubmit={handleSubmit}>
      <Input
        placeholder="新しいクエストを追加"
        mr={2}
        value={questTitle}
        onChange={(e) => setQuestTitle(e.target.value)}
      />
      <Input
        type="time"
        mr={2}
        w="120px"
        value={questTime}
        onChange={(e) => setQuestTime(e.target.value)}
      />
      <IconButton aria-label="Add quest" type="submit">
        <FaPlus />
      </IconButton>
    </Flex>
  );
};
