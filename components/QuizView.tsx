
import React, { useState } from 'react';
import type { QuizState } from '../types.ts';
import Spinner from './Spinner.tsx';
import { LightBulbIcon } from './icons.tsx';

interface QuizViewProps {
  quizState: QuizState | null;
  isLoading: boolean;
  onAnswerSubmit: (answer: string) => void;
  onNewQuestion: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quizState, isLoading, onAnswerSubmit, onNewQuestion }) => {
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim()) {
      onAnswerSubmit(userAnswer);
    }
  };

  if (!quizState) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-900/80 border border-gray-800 rounded-lg shadow-2xl">
          <button
            onClick={onNewQuestion}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : <LightBulbIcon className="h-6 w-6" />}
            Bắt đầu Quiz
          </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-900/80 border border-gray-800 rounded-lg shadow-2xl overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Quiz Nhanh</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Câu hỏi:</h3>
        <p className="text-white text-xl">{quizState.question}</p>
      </div>

      {quizState.status === 'asking' && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Câu trả lời của bạn..."
            className="w-full h-32 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !userAnswer.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : 'Gửi câu trả lời'}
          </button>
        </form>
      )}

      {quizState.status === 'answered' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Câu trả lời của bạn:</h3>
              <p className="text-gray-300 italic">{quizState.userAnswer}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">Phản hồi từ AI:</h3>
                  <p className="text-white whitespace-pre-wrap">{quizState.feedbackText}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-2 flex items-center justify-center aspect-square">
                  {isLoading ? (
                      <div className="w-full h-full bg-gray-800 rounded-md flex flex-col items-center justify-center text-gray-400">
                          <Spinner />
                          <p className="mt-2 text-sm">Đang vẽ tranh...</p>
                      </div>
                  ) : quizState.imageUrl ? (
                      <img src={quizState.imageUrl} alt="Hình minh họa cho câu trả lời" className="rounded-md object-cover w-full h-full" />
                  ) : (
                      <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center text-gray-500 text-sm text-center">
                          <p>Không thể tạo ảnh</p>
                      </div>
                  )}
              </div>
          </div>
          
          <button
              onClick={onNewQuestion}
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {isLoading ? <Spinner /> : 'Câu hỏi mới'}
          </button>
      </div>
      )}
    </div>
  );
};

export default QuizView;