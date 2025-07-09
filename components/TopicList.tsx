import React, { useState } from 'react';
import type { Topic } from '../types.ts';
import { PlusIcon, DiceIcon, LightBulbIcon, TrophyIcon, QuestionMarkCircleIcon } from './icons.tsx';
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

  return (
    <div className="w-1/4 max-w-sm flex flex-col bg-gray-800 p-4 rounded-lg shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Chủ đề</h2>
      <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Tên chủ đề mới"
          className="flex-grow bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-md transition disabled:opacity-50" disabled={!newTopic.trim()}>
          <PlusIcon className="h-5 w-5" />
        </button>
      </form>

      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={onGenerateRandomTopic}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Spinner /> : <DiceIcon className="h-5 w-5" />}
          <span>Tạo ngẫu nhiên</span>
        </button>
         <button
          onClick={onStartBattle}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          <TrophyIcon className="h-5 w-5" />
          <span>Thi đấu</span>
        </button>
        <button
          onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          <LightBulbIcon className="h-5 w-5" />
          <span>Bắt đầu Quiz</span>
        </button>
         <button
          onClick={onStartTwentyQuestions}
          className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
          <span>20 Câu Hỏi</span>
        </button>
      </div>

      <div className="flex-grow flex flex-col gap-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className={`w-full text-left p-3 rounded-md transition text-white ${
              selectedTopic?.id === topic.id
                ? 'bg-cyan-500 font-semibold shadow-md'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {topic.name}
          </button>
        ))}
         {topics.length === 0 && (
          <div className="text-center text-gray-400 mt-4">
            <p>Chưa có chủ đề nào.</p>
            <p>Hãy tạo một chủ đề mới hoặc tạo ngẫu nhiên!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicList;
