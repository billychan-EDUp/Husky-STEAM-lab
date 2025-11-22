import React, { useEffect, useState } from 'react';
import { Entity, MathProblem } from '../types';
import { Timer, Zap } from 'lucide-react';

interface BattleSceneProps {
  player: Entity;
  enemy: Entity;
  problem: MathProblem | null;
  timeLeft: number;
  onAnswer: (answer: number) => void;
  isPlayerTurn: boolean;
  battleLog: string;
  shake: boolean;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  player,
  enemy,
  problem,
  timeLeft,
  onAnswer,
  isPlayerTurn,
  battleLog,
  shake
}) => {
  const [inputValue, setInputValue] = useState('');

  // Auto-focus input when problem changes
  useEffect(() => {
    setInputValue('');
  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    onAnswer(Number(inputValue));
    setInputValue('');
  };

  const getHealthColor = (current: number, max: number) => {
    const pct = current / max;
    if (pct > 0.6) return 'bg-green-500';
    if (pct > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full relative">
      
      {/* Battle Area */}
      <div className="flex-grow relative bg-gradient-to-b from-blue-200 to-green-100 rounded-xl overflow-hidden border-4 border-blue-900 shadow-2xl">
        
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{backgroundImage: 'radial-gradient(#0044cc 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>

        {/* Enemy HUD */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 p-3 rounded-lg border-2 border-gray-700 shadow-md min-w-[200px]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-gray-800 text-lg">{enemy.name}</span>
            <span className="text-xs font-bold text-gray-500">Lv.{enemy.level}</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-400">
            <div 
              className={`h-full transition-all duration-500 ${getHealthColor(enemy.currentHp, enemy.maxHp)}`}
              style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-600 mt-1">{enemy.currentHp}/{enemy.maxHp} HP</div>
        </div>

        {/* Enemy Sprite */}
        <div className={`absolute top-12 right-12 sm:right-24 transition-transform duration-300 ${shake ? 'animate-ping' : 'animate-bounce-slow'}`}>
           {/* mix-blend-multiply hides the white background of the generated asset against the light battle background */}
           <img 
             src={enemy.imageUrl} 
             alt="Enemy" 
             className="w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-xl mix-blend-multiply filter contrast-125" 
           />
        </div>

        {/* Player Sprite */}
        <div className={`absolute bottom-8 left-8 sm:left-24 transition-transform duration-300 ${isPlayerTurn ? 'scale-105' : 'scale-100'}`}>
           {/* mix-blend-multiply hides the white background of the generated asset against the light battle background */}
           <img 
             src={player.imageUrl} 
             alt="Player" 
             className="w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-xl mix-blend-multiply filter contrast-125 flip-x" 
             style={{transform: 'scaleX(-1)'}} 
           />
        </div>

        {/* Player HUD */}
        <div className="absolute bottom-36 left-4 sm:bottom-8 sm:left-auto sm:right-4 z-10 bg-yellow-50/90 p-4 rounded-lg border-2 border-blue-800 shadow-md min-w-[220px]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-blue-900 text-lg">{player.name}</span>
            <span className="text-xs font-bold text-blue-600">Lv.5</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-400">
             <div 
              className={`h-full transition-all duration-500 ${getHealthColor(player.currentHp, player.maxHp)}`}
              style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs font-bold text-blue-800">
             <span>{player.currentHp}/{player.maxHp} HP</span>
          </div>
        </div>

        {/* Battle Log Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white p-2 text-center font-mono text-sm sm:text-base min-h-[40px]">
          {battleLog}
        </div>
      </div>

      {/* Control Panel */}
      <div className="mt-4 h-48 bg-blue-900 rounded-xl p-4 border-4 border-blue-800 shadow-lg flex gap-4">
        
        {/* Left: Problem & Timer */}
        <div className="flex-1 bg-blue-800 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden border-2 border-blue-600">
          {isPlayerTurn && problem ? (
            <>
              <div className="absolute top-2 right-2 flex items-center text-yellow-400 font-bold text-xl">
                <Timer className="w-5 h-5 mr-1" />
                {timeLeft.toFixed(1)}s
              </div>
              <div className="text-yellow-100 text-sm mb-2 font-semibold tracking-widest uppercase">Prepare to Attack!</div>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono drop-shadow-md">
                {problem.num1} {problem.operator} {problem.num2} = ?
              </div>
            </>
          ) : (
            <div className="text-blue-300 text-center italic animate-pulse">
              Enemy is attacking... <br/>Brace yourself!
            </div>
          )}
        </div>

        {/* Right: Numpad / Input */}
        <div className="w-1/3 sm:w-1/4 bg-yellow-400 rounded-lg p-2 border-2 border-yellow-600 flex flex-col">
          {isPlayerTurn && (
            <form onSubmit={handleSubmit} className="h-full flex flex-col gap-2">
              <input 
                type="number" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 text-2xl font-bold text-center !text-black bg-white rounded border-2 border-yellow-700 outline-none focus:border-blue-600"
                placeholder="?"
                autoFocus
              />
              <button 
                type="submit"
                className="flex-grow bg-red-500 hover:bg-red-600 text-white font-black text-xl uppercase rounded border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
              >
                Attack!
              </button>
            </form>
          )}
          {!isPlayerTurn && (
            <div className="h-full flex items-center justify-center text-yellow-800 font-bold text-center opacity-50">
              <Zap className="w-8 h-8 mb-1" />
              Wait...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};