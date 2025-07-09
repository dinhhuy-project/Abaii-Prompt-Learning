import React from 'react';
import type { Topic } from '../types.ts';
import { WandIcon, CheckBadgeIcon, LightBulbIcon } from './icons.tsx';
import Spinner from './Spinner.tsx';

interface PromptEditorProps {
  topic: Topic;
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  optimizedPrompt: string;
  promptReview: string;
  loadingAction: 'optimize' | 'review' | 'suggest' | null;
  onOptimize: () => void;
  onReview: () => void;
  suggestedPrompts: string[];
  onSuggestPrompts: () => void;
  onPromptSelect: (prompt: string) => void;
}

const ResultCard: React.FC<{ title: string; content: string; icon: React.ReactNode; isLoading: boolean }> = ({ title, content, icon, isLoading }) => {
    if (!isLoading && !content) return null;

    return (
        <div className="bg-gray-800 rounded-lg p-4 mt-4 relative">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="bg-gray-900 rounded p-3 min-h-[100px] text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                ) : (
                    content
                )}
            </div>
        </div>
    );
};

const SuggestionsCard: React.FC<{ title: string; prompts: string[]; onSelect: (prompt: string) => void; isLoading: boolean }> = ({ title, prompts, onSelect, isLoading }) => {
    if (!isLoading && prompts.length === 0) return null;

    return (
        <div className="bg-gray-800 rounded-lg p-4 mt-4 relative">
            <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <LightBulbIcon className="h-6 w-6" />
                {title}
            </h3>
            <div className="bg-gray-900 rounded p-3 min-h-[100px] text-gray-300">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {prompts.map((p, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => onSelect(p)}
                                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-200"
                                    aria-label={`Sử dụng gợi ý: ${p}`}
                                >
                                    <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{p}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


const PromptEditor: React.FC<PromptEditorProps> = ({
  topic,
  prompt,
  onPromptChange,
  optimizedPrompt,
  promptReview,
  loadingAction,
  onOptimize,
  onReview,
  suggestedPrompts,
  onSuggestPrompts,
  onPromptSelect
}) => {
  const isLoading = loadingAction !== null;
  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-800/50 rounded-lg shadow-inner overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">
        Chủ đề: <span className="text-cyan-400">{topic.name}</span>
      </h2>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">
            Prompt của bạn
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={`Viết prompt của bạn cho chủ đề "${topic.name}" ở đây...`}
            className="w-full h-40 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            aria-label="Trình soạn thảo prompt"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onOptimize}
            disabled={isLoading || !prompt}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === 'optimize' ? <Spinner /> : <WandIcon className="h-5 w-5" />}
            Tối ưu
          </button>
          <button
            onClick={onReview}
            disabled={isLoading || !prompt}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === 'review' ? <Spinner /> : <CheckBadgeIcon className="h-5 w-5" />}
            Nhận xét
          </button>
          <button
            onClick={onSuggestPrompts}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === 'suggest' ? <Spinner /> : <LightBulbIcon className="h-5 w-5" />}
            Gợi ý
          </button>
        </div>

        <SuggestionsCard 
            title="Prompt gợi ý"
            prompts={suggestedPrompts}
            onSelect={onPromptSelect}
            isLoading={loadingAction === 'suggest'}
        />

        <ResultCard
            title="Prompt đã tối ưu"
            content={optimizedPrompt}
            icon={<WandIcon className="h-6 w-6" />}
            isLoading={loadingAction === 'optimize'}
        />
        <ResultCard
            title="Nhận xét từ AI"
            content={promptReview}
            icon={<CheckBadgeIcon className="h-6 w-6" />}
            isLoading={loadingAction === 'review'}
        />
      </div>
    </div>
  );
};

export default PromptEditor;