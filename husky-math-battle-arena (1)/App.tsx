
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStage, Entity, MathProblem, AssetGenerationStatus, Medal } from './types';
import { generateGameAsset } from './services/geminiService';
import { generateProblem } from './services/mathLogic';
import { BattleScene } from './components/BattleScene';
import { 
    LEVEL_CONFIG, 
    MAX_LEVELS, 
    MONSTER_PROMPTS, 
    PLAYER_PROMPT, 
    TURN_TIME_LIMIT_SEC,
    PLAYER_MAX_HP,
    BASE_DAMAGE
} from './constants';
import { Trophy, Star, Sword, RefreshCw, Loader2, Medal as MedalIcon } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.MENU);
  
  // Game Data
  const [player, setPlayer] = useState<Entity | null>(null);
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  
  // Battle State
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT_SEC);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState("Battle Start!");
  const [shake, setShake] = useState(false);

  // Stats
  const [score, setScore] = useState(0);
  
  // Loading State
  const [loadingStatus, setLoadingStatus] = useState<AssetGenerationStatus>({ total: 6, completed: 0, currentTask: '' });

  // Refs for timers to clear them properly
  const timerRef = useRef<number | null>(null);

  // --- Initialization & Asset Generation ---

  const startGame = async () => {
    setStage(GameStage.LOADING_ASSETS);
    setLoadingStatus({ total: 6, completed: 0, currentTask: 'Initializing...' });

    // Check environment variable
    if (!process.env.API_KEY) {
        alert("API Key is missing! Using placeholder assets.");
    }

    try {
        // 1. Generate Player
        setLoadingStatus(prev => ({ ...prev, currentTask: 'Summoning Player Hero...' }));
        const playerImg = await generateGameAsset(PLAYER_PROMPT) || "https://picsum.photos/300";
        setPlayer({
            id: 'player',
            name: 'Husky Hero',
            imageUrl: playerImg,
            maxHp: PLAYER_MAX_HP,
            currentHp: PLAYER_MAX_HP,
            level: 5,
            element: 'Neutral'
        });
        setLoadingStatus(prev => ({ ...prev, completed: prev.completed + 1 }));

        // 2. Generate Enemies
        const generatedEnemies: Entity[] = [];
        for (let i = 0; i < MAX_LEVELS; i++) {
            setLoadingStatus(prev => ({ ...prev, currentTask: `Locating Monster for Level ${i + 1}...` }));
            const prompt = MONSTER_PROMPTS[i];
            const img = await generateGameAsset(prompt) || `https://picsum.photos/300?random=${i}`;
            
            const levelConfig = LEVEL_CONFIG[(i + 1) as keyof typeof LEVEL_CONFIG];
            
            generatedEnemies.push({
                id: `enemy-${i}`,
                name: `${levelConfig.name} Guardian`,
                imageUrl: img,
                maxHp: 40 + (i * 20), // HP Scaling: 40, 60, 80, 100, 120
                currentHp: 40 + (i * 20),
                level: i + 1,
                element: 'Wild'
            });
            setLoadingStatus(prev => ({ ...prev, completed: prev.completed + 1 }));
        }
        setEnemies(generatedEnemies);

        // Ready to start
        setCurrentLevel(1);
        setScore(0);
        setStage(GameStage.BATTLE_INTRO);

    } catch (err) {
        console.error(err);
        setStage(GameStage.MENU); // Fallback logic could go here
    }
  };

  // --- Battle Logic ---

  const startBattle = useCallback(() => {
    setStage(GameStage.BATTLE_ACTIVE);
    setBattleLog(`A wild Level ${currentLevel} Monster appeared!`);
    setIsPlayerTurn(true);
    nextTurn(true);
  }, [currentLevel]);

  const nextTurn = (playerTurn: boolean) => {
    setIsPlayerTurn(playerTurn);
    setTimeLeft(TURN_TIME_LIMIT_SEC);
    
    if (playerTurn) {
        const problem = generateProblem(currentLevel);
        setCurrentProblem(problem);
        setBattleLog("Solve the math problem to attack!");
    } else {
        setCurrentProblem(null);
        setBattleLog("Enemy is charging an attack...");
        setTimeout(enemyAttack, 2000);
    }
  };

  const handleAnswer = (answer: number) => {
    if (!currentProblem || !player || enemies.length === 0) return;

    const isCorrect = Math.abs(answer - currentProblem.answer) < 0.01; // Float tolerance if needed for Div
    const enemy = enemies[currentLevel - 1];

    if (isCorrect) {
        // Calculate Damage
        // Faster answer = more damage.
        const speedBonus = Math.floor(timeLeft * 2); 
        const totalDamage = BASE_DAMAGE + speedBonus;
        
        // Apply Damage
        const newEnemyHp = Math.max(0, enemy.currentHp - totalDamage);
        const updatedEnemies = [...enemies];
        updatedEnemies[currentLevel - 1].currentHp = newEnemyHp;
        setEnemies(updatedEnemies);

        setScore(prev => prev + (totalDamage * 10));
        setBattleLog(`Critical Hit! Dealt ${totalDamage} damage!`);
        triggerShake();

        if (newEnemyHp <= 0) {
            handleVictory();
        } else {
            nextTurn(false); // Enemy turn
        }
    } else {
        setBattleLog("Wrong answer! The attack missed!");
        nextTurn(false); // Enemy turn immediately on fail
    }
  };

  const enemyAttack = () => {
    if (!player) return;
    
    // Enemy damage scaling
    const damage = 10 + (currentLevel * 3);
    const newPlayerHp = Math.max(0, player.currentHp - damage);
    
    setPlayer({ ...player, currentHp: newPlayerHp });
    setBattleLog(`Enemy attacked! You took ${damage} damage.`);
    triggerShake();

    if (newPlayerHp <= 0) {
        // Instead of Game Over, we go to Results
        setStage(GameStage.GAME_OVER); // Re-using enum, but rendering "Result"
    } else {
        nextTurn(true);
    }
  };

  const handleVictory = () => {
    if (!player) return;

    // Restore some player HP
    const healAmount = 20;
    const newHp = Math.min(player.maxHp, player.currentHp + healAmount);
    setPlayer({ ...player, currentHp: newHp });
    
    // Score bonus
    setScore(prev => prev + 1000);

    if (currentLevel >= MAX_LEVELS) {
        setStage(GameStage.VICTORY);
    } else {
        setStage(GameStage.LEVEL_COMPLETE);
    }
  };

  const nextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    setStage(GameStage.BATTLE_INTRO);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // --- Timer Hook ---
  useEffect(() => {
    if (stage === GameStage.BATTLE_ACTIVE && isPlayerTurn && currentProblem) {
        // Explicitly use window.setInterval to ensure return type is number
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setBattleLog("Time's up! Attack failed!");
                    nextTurn(false); // Auto fail to enemy turn
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, isPlayerTurn, currentProblem]);


  // --- Render Helpers ---

  const getMedal = (): Medal => {
    // Adjusted score thresholds
    if (score > 3000) return 'GOLD';
    if (score > 1500) return 'SILVER';
    // If they scored anything at all, Bronze. 
    return 'BRONZE';
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full bg-blue-900 text-white p-4 space-y-8 text-center">
       {/* Logo Section */}
       <div className="relative mb-4 bg-white p-6 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.3)] transform hover:scale-105 transition-transform border-4 border-blue-950">
         <img 
           src="logo.jpg" 
           alt="Husky STEAM Lab" 
           className="w-64 h-auto object-contain"
           onError={(e) => {
             const target = e.target as HTMLImageElement;
             target.onerror = null;
             target.style.display = 'none';
           }}
         />
       </div>

       <div>
         <h2 className="text-3xl text-yellow-400 font-black font-mono tracking-wide drop-shadow-lg">Math Battle Arena</h2>
         <p className="text-blue-300 mt-2">Powered by Google Gemini</p>
       </div>
       
       <button 
         onClick={startGame}
         className="group relative px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-2xl rounded-xl shadow-[0_8px_0_rgb(161,98,7)] active:shadow-[0_0px_0_rgb(161,98,7)] active:translate-y-[8px] transition-all w-full max-w-xs mx-auto"
       >
         <span className="flex items-center justify-center gap-3">
            START <Sword className="w-8 h-8 group-hover:rotate-45 transition-transform duration-300"/>
         </span>
       </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <Loader2 className="w-16 h-16 animate-spin text-yellow-400 mb-8" />
        <h2 className="text-2xl font-bold mb-4">Generating Game World...</h2>
        <p className="text-blue-300 mb-8 animate-pulse">{loadingStatus.currentTask}</p>
        
        <div className="w-full max-w-md bg-gray-800 rounded-full h-4 border border-gray-700">
            <div 
                className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(loadingStatus.completed / loadingStatus.total) * 100}%` }}
            ></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">{loadingStatus.completed} / {loadingStatus.total} assets ready</p>
    </div>
  );

  const renderBattleIntro = () => {
      if (!enemies[currentLevel-1]) return null;
      return (
        <div className="flex flex-col items-center justify-center h-full bg-black/90 text-white z-50 absolute inset-0 p-8 text-center animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">LEVEL {currentLevel}</h2>
            <h1 className="text-5xl font-black mb-8">{LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].name}</h1>
            
            {/* White Card background to fix "white box" issue on dark background */}
            <div className="bg-white p-8 rounded-3xl mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <img 
                    src={enemies[currentLevel-1].imageUrl} 
                    className="w-48 h-48 object-contain animate-bounce-slow" 
                    alt="Enemy"
                />
            </div>
            
            <p className="text-xl text-blue-200 mb-8">
                Target: <span className="font-bold text-white">{enemies[currentLevel-1].name}</span>
            </p>

            <button 
                onClick={startBattle}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded shadow-lg"
            >
                FIGHT!
            </button>
        </div>
      );
  };

  const renderResult = (isVictory: boolean) => {
      const medal = getMedal();
      let medalColor = "text-orange-400"; // Bronze default
      if (medal === 'GOLD') medalColor = "text-yellow-400";
      if (medal === 'SILVER') medalColor = "text-gray-300";

      return (
        <div className="flex flex-col items-center justify-center h-full bg-blue-900 text-white p-4 text-center">
            <Trophy className={`w-32 h-32 mb-4 ${medalColor} drop-shadow-lg`} />
            
            <h1 className="text-4xl font-black text-white mb-2">
                {isVictory ? "CHAMPION!" : "ASSESSMENT COMPLETE"}
            </h1>
            <p className="text-xl mb-8 text-blue-200">
                {isVictory ? "You have defeated all guardians!" : "Good effort! Keep training!"}
            </p>
            
            <div className="bg-blue-800 p-6 rounded-xl border-2 border-blue-600 mb-8 w-full max-w-md shadow-xl">
                <div className="flex justify-between mb-4 text-xl items-center">
                    <span>Final Score:</span>
                    <span className="font-bold text-yellow-300 text-2xl">{score}</span>
                </div>
                <div className="flex justify-between text-xl border-t border-blue-700 pt-4 items-center">
                    <span>Medal Achieved:</span>
                    <div className="flex items-center gap-2">
                        <MedalIcon className={`w-6 h-6 ${medalColor}`} />
                        <span className={`font-black ${medalColor}`}>{medal}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setStage(GameStage.MENU)}
                className="flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-bold text-xl rounded-xl hover:bg-blue-50 shadow-lg transition-all hover:-translate-y-1"
            >
                <RefreshCw className="w-6 h-6" /> Play Again
            </button>
        </div>
      );
  };

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden relative">
        {/* Header Bar */}
        {stage !== GameStage.MENU && stage !== GameStage.LOADING_ASSETS && (
             <div className="absolute top-0 left-0 w-full bg-blue-900 text-white p-2 z-40 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-yellow-400 px-2 bg-blue-800 rounded">LEVEL {currentLevel}</div>
                </div>
                <div className="font-mono text-xl font-bold text-white tracking-widest">
                    SCORE: {score.toString().padStart(6, '0')}
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <div className="w-full h-full pt-12 pb-4 px-4">
            {stage === GameStage.MENU && renderMenu()}
            {stage === GameStage.LOADING_ASSETS && renderLoading()}
            {stage === GameStage.BATTLE_INTRO && renderBattleIntro()}
            
            {(stage === GameStage.BATTLE_ACTIVE || stage === GameStage.LEVEL_COMPLETE) && player && enemies.length > 0 && (
                <>
                 {stage === GameStage.LEVEL_COMPLETE && (
                     <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in fade-in">
                        <h2 className="text-4xl font-bold text-yellow-400 mb-4">Level Cleared!</h2>
                        <p className="text-white mb-8">Preparing next challenge...</p>
                        <button 
                            onClick={nextLevel}
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg"
                        >
                            Continue
                        </button>
                     </div>
                 )}
                 <BattleScene 
                    player={player}
                    enemy={enemies[currentLevel - 1]}
                    problem={currentProblem}
                    timeLeft={timeLeft}
                    onAnswer={handleAnswer}
                    isPlayerTurn={isPlayerTurn}
                    battleLog={battleLog}
                    shake={shake}
                 />
                </>
            )}

            {stage === GameStage.VICTORY && renderResult(true)}
            {stage === GameStage.GAME_OVER && renderResult(false)}
        </div>
    </div>
  );
};

export default App;
