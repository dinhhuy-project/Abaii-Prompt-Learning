import React, { useState, useRef, useEffect } from 'react';
import type { TwentyQuestionsState } from '../types.ts';
import Spinner from './Spinner.tsx';
import { QuestionMarkCircleIcon } from './icons.tsx';

interface TwentyQuestionsViewProps {
  gameState: TwentyQuestionsState;
  onAsk: (question: string) => void;
  onGuess: (guess: string) => void;
  onReset: () => void;
}

const TwentyQuestionsView: React.FC<TwentyQuestionsViewProps> = ({ gameState, onAsk, onGuess, onReset }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);

  const isLoading = gameState.status === 'starting' || gameState.status === 'evaluating';

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.history]);
  
  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuestion.trim() && !isLoading) {
      onAsk(currentQuestion.trim());
      setCurrentQuestion('');
    }
  };
  
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGuess.trim() && !isLoading) {
      onGuess(currentGuess.trim());
      setCurrentGuess('');
    }
  };

  const renderIdleScreen = () => (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-gray-800/50 rounded-lg shadow-inner">
      <QuestionMarkCircleIcon className="h-16 w-16 text-yellow-400 mb-4" />
      <h2 className="text-3xl font-bold mb-4">Trò chơi 20 Câu Hỏi</h2>
      <p className="text-gray-300 mb-6 max-w-md">AI sẽ nghĩ về một thứ bí mật. Bạn có 20 câu hỏi "Có/Không" để đoán xem đó là gì. Bắt đầu nào!</p>
      {gameState.error && <p className="text-red-400 mb-4">{gameState.error}</p>}
      <button
        onClick={onReset}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition disabled:opacity-50"
      >
        {isLoading ? <Spinner /> : 'Bắt đầu chơi'}
      </button>
    </div>
  );

  const renderFinishedScreen = () => (
     <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-gray-800/50 rounded-lg shadow-inner">
      {gameState.gameResult === 'win' ? (
        <>
          <h2 className="text-4xl font-bold text-green-400 mb-4">🎉 Chúc Mừng! 🎉</h2>
          <p className="text-xl text-white">Bạn đã đoán đúng! Từ bí mật là:</p>
          <p className="text-2xl font-bold text-yellow-300 p-2 bg-black/20 rounded-md mt-2 mb-6">{gameState.secretWord}</p>
        </>
      ) : (
         <>
          <h2 className="text-4xl font-bold text-red-400 mb-4">Rất tiếc!</h2>
          <p className="text-xl text-white">Bạn đã không đoán được. Từ bí mật là:</p>
          <p className="text-2xl font-bold text-yellow-300 p-2 bg-black/20 rounded-md mt-2 mb-6">{gameState.secretWord}</p>
        </>
      )}
       <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
      >
        Chơi lại
      </button>
    </div>
  );

  const renderGameScreen = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">20 Câu Hỏi</h2>
        <div className="text-lg font-semibold bg-yellow-400/20 text-yellow-300 px-4 py-1 rounded-full">
          Còn lại: <span className="font-bold">{gameState.questionsLeft}</span> câu hỏi
        </div>
      </div>
      
      {/* History */}
      <div className="flex-grow bg-gray-900/50 rounded-lg p-4 mb-4 overflow-y-auto min-h-0">
        <div className="space-y-4">
            {gameState.history.map((item, index) => (
                <div key={index}>
                    <div className="flex justify-end">
                        <p className="bg-blue-600 rounded-lg py-2 px-4 max-w-xs lg:max-w-md">
                            <strong>Bạn:</strong> {item.text}
                        </p>
                    </div>
                     {item.answer && (
                        <div className="flex justify-start mt-2">
                             <p className="bg-gray-700 rounded-lg py-2 px-4 max-w-xs lg:max-w-md">
                                <strong>AI:</strong> {item.answer}
                            </p>
                        </div>
                     )}
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start mt-2">
                     <p className="bg-gray-700 rounded-lg py-2 px-4 flex items-center gap-2">
                        <strong>AI:</strong> <Spinner />
                    </p>
                </div>
            )}
            <div ref={historyEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
         <form onSubmit={handleAskSubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentQuestion}
              onChange={e => setCurrentQuestion(e.target.value)}
              placeholder="Đặt câu hỏi có/không..."
              className="flex-grow bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              disabled={isLoading}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2 px-4 rounded-md transition disabled:opacity-50" disabled={isLoading || !currentQuestion.trim()}>Hỏi</button>
         </form>
          <form onSubmit={handleGuessSubmit} className="flex gap-2">
            <input
              type="text"
              value={currentGuess}
              onChange={e => setCurrentGuess(e.target.value)}
              placeholder="Đưa ra phỏng đoán cuối cùng..."
              className="flex-grow bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              disabled={isLoading}
            />
            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-semibold p-2 px-4 rounded-md transition disabled:opacity-50" disabled={isLoading || !currentGuess.trim()}>Đoán!</button>
         </form>
         <button onClick={onReset} className="text-center w-full mt-4 text-gray-400 hover:text-red-400 transition text-sm">Bỏ cuộc và chơi lại</button>
      </div>
    </div>
  );

  if (gameState.status === 'idle' || gameState.status === 'starting') {
     return renderIdleScreen();
  }
  
  if (gameState.status === 'finished') {
      return renderFinishedScreen();
  }

  return renderGameScreen();
};

export default TwentyQuestionsView;
