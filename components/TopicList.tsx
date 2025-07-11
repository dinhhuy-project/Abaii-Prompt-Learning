
import React, { useState } from 'react';
import type { Topic } from '../types.ts';
import { PlusIcon, DiceIcon, LightBulbIcon, TrophyIcon, QuestionMarkCircleIcon, LogoIcon } from './icons.tsx';
import Spinner from './Spinner.tsx';

interface TopicListProps {
  topics: Topic[];
  selectedTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
  onAddTopic: (topicName: string) => void;
  onGenerateRandomTopic: () => Promise<void>;
  onStartQuiz: () => void;
  onStartBattle: () => void;
  onStartTwentyQuestions: () => void;
  isGenerating: boolean;
}

const TopicList: React.FC<TopicListProps> = ({
  topics,
  selectedTopic,
  onSelectTopic,
  onAddTopic,
  onGenerateRandomTopic,
  onStartQuiz,
  onStartBattle,
  onStartTwentyQuestions,
  isGenerating
}) => {
  const [newTopic, setNewTopic] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onAddTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  const ActionButton: React.FC<{ onClick: () => void; disabled?: boolean; icon: React.ReactNode; text: string }> = ({ onClick, disabled, icon, text }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2 px-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {disabled ? <Spinner /> : icon}
      <span>{text}</span>
    </button>
  );

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 p-4 h-full overflow-y-auto">
      <header className="flex items-center gap-3 mb-8 px-1">
        <LogoIcon className="h-7 w-7 text-cyan-400" />
        <h1 className="text-xl font-bold text-white">ABAII Prompt&Play</h1>
      </header>

      <div className="flex-grow flex flex-col min-h-0">
        <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Tên chủ đề mới"
            className="flex-grow bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md transition disabled:opacity-50" disabled={!newTopic.trim()}>
            <PlusIcon className="h-5 w-5" />
          </button>
        </form>

        <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">CHỦ ĐỀ CỦA BẠN</h2>
        <div className="flex-grow flex flex-col gap-1 overflow-y-auto pr-1 -mr-1">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`w-full text-left p-2 px-3 rounded-md transition text-sm font-medium ${
                selectedTopic?.id === topic.id
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {topic.name}
            </button>
          ))}
          {topics.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-4 px-2">
              <p>Chưa có chủ đề nào. Hãy tạo một chủ đề mới để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-800 flex flex-col gap-2">
         <ActionButton onClick={onGenerateRandomTopic} disabled={isGenerating} icon={<DiceIcon className="h-5 w-5" />} text="Tạo chủ đề ngẫu nhiên" />
         <ActionButton onClick={onStartQuiz} icon={<LightBulbIcon className="h-5 w-5" />} text="Quiz Nhanh" />
         <ActionButton onClick={onStartBattle} icon={<TrophyIcon className="h-5 w-5" />} text="Thi Đấu Prompt" />
         <ActionButton onClick={onStartTwentyQuestions} icon={<QuestionMarkCircleIcon className="h-5 w-5" />} text="20 Câu Hỏi" />
      </div>
    </div>
  );
};

export default TopicList;