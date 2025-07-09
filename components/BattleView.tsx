import React, { useState } from 'react';
import type { BattleState } from '../types.ts';
import Spinner from './Spinner.tsx';
import { TrophyIcon } from './icons.tsx';

interface BattleViewProps {
  battleState: BattleState | null;
  isLoading: boolean;
  onConfigure: (playerCount: number) => void;
  onPromptChange: (playerId: number, prompt: string) => void;
  onEvaluate: () => void;
  onReset: () => void;
}

const BattleView: React.FC<BattleViewProps> = ({ battleState, isLoading, onConfigure, onPromptChange, onEvaluate, onReset }) => {
  const [playerCount, setPlayerCount] = useState(2);
  
  if (!battleState) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-800/50 rounded-lg shadow-inner">
        <p>Lỗi: Trạng thái thi đấu không hợp lệ.</p>
      </div>
    );
  }

  const renderConfigScreen = () => (
    <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-800/50 rounded-lg shadow-inner text-center">
      <TrophyIcon className="h-16 w-16 text-red-400 mb-4" />
      <h2 className="text-3xl font-bold mb-4">Thi Đấu Prompt</h2>
      <p className="text-gray-300 mb-6">Chọn số lượng người tham gia để bắt đầu.</p>
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="player-count" className="text-lg font-medium">Số người chơi:</label>
        <input
          type="number"
          id="player-count"
          value={playerCount}
          onChange={(e) => setPlayerCount(Math.max(2, parseInt(e.target.value, 10)))}
          min="2"
          max="10"
          className="w-24 bg-gray-700 text-white text-center text-lg font-bold border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <button
        onClick={() => onConfigure(playerCount)}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition disabled:opacity-50"
      >
        {isLoading ? <Spinner /> : 'Bắt đầu!'}
      </button>
    </div>
  );

  const renderWritingScreen = () => {
    const allPromptsFilled = battleState.players.every(p => p.prompt.trim() !== '');
    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Chủ đề: <span className="text-red-400">{battleState.topic}</span></h2>
            <p className="text-gray-400 mb-6">Mỗi người chơi hãy viết một prompt thật sáng tạo dựa trên chủ đề này.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {battleState.players.map(player => (
                    <div key={player.id} className="bg-gray-800/70 p-4 rounded-lg">
                        <label htmlFor={`player-prompt-${player.id}`} className="block text-lg font-semibold text-white mb-2">
                            Người chơi {player.id}
                        </label>
                        <textarea
                            id={`player-prompt-${player.id}`}
                            value={player.prompt}
                            onChange={(e) => onPromptChange(player.id, e.target.value)}
                            placeholder="Viết prompt của bạn ở đây..."
                            className="w-full h-32 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={onEvaluate}
                disabled={isLoading || !allPromptsFilled}
                className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Spinner /> : 'Chấm điểm & Xếp hạng'}
            </button>
        </div>
    );
  };
  
  const renderResultsScreen = () => {
      const getMedal = (index: number) => {
          if(index === 0) return '🥇';
          if(index === 1) return '🥈';
          if(index === 2) return '🥉';
          return `#${index + 1}`;
      }

      return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2 text-center text-red-400">Kết quả Thi đấu</h2>
            <p className="text-gray-400 mb-6 text-center">Chủ đề: <span className="font-semibold">{battleState.topic}</span></p>

            <div className="space-y-4">
                {battleState.players.map((player, index) => (
                    <div key={player.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500/50">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-bold text-white">
                                <span className="mr-3">{getMedal(index)}</span>
                                Người chơi {player.id}
                            </h3>
                            <div className="text-2xl font-bold text-red-400">{player.score} <span className="text-sm text-gray-400">điểm</span></div>
                        </div>
                        <p className="text-gray-300 italic bg-gray-900/50 p-3 rounded-md mb-3">"{player.prompt}"</p>
                        <p className="text-white"><strong className="text-red-300">Nhận xét:</strong> {player.feedback}</p>
                    </div>
                ))}
            </div>

             <button
                onClick={onReset}
                className="mt-8 w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition"
            >
                Chơi lại
            </button>
        </div>
      );
  };

  const renderEvaluatingScreen = () => (
    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <Spinner />
        <h2 className="text-2xl font-bold mt-4 text-red-400">Đang chấm điểm...</h2>
        <p className="text-gray-300">AI đang phân tích và cho điểm từng câu prompt. Vui lòng chờ trong giây lát.</p>
    </div>
  );

  switch (battleState.status) {
    case 'configuring':
      return renderConfigScreen();
    case 'writing':
      return renderWritingScreen();
    case 'evaluating':
        return renderEvaluatingScreen();
    case 'results':
      return renderResultsScreen();
    default:
      return <p>Trạng thái không xác định</p>;
  }
};

export default BattleView;