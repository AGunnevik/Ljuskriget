import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverModal from './components/GameOverModal';
import { GameState } from './types';
import { LEVEL_UP_SCORE } from './constants';
import { Lightbulb, Zap, ShieldAlert, MousePointer2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentModel, setCurrentModel] = useState("Multilume");

  useEffect(() => {
    const saved = localStorage.getItem('fagerhult-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('fagerhult-highscore', finalScore.toString());
    }
  }, [finalScore, highScore]);

  const startGame = () => {
    setScore(0);
    setFinalScore(0);
    setGameState(GameState.PLAYING);
    setCurrentModel("Multilume");
  };

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden font-sans select-none">
      
      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState} 
        setScore={setScore}
        setFinalScore={setFinalScore}
        setCurrentModel={setCurrentModel}
      />

      {/* HUD - Always visible during gameplay */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white drop-shadow-md flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${currentModel === 'Notor 65' ? 'bg-cyan-200 shadow-[0_0_10px_#fff]' : 'bg-cyan-400'} animate-pulse`}></span>
              Fagerhult {currentModel}
            </h1>
            <p className="text-slate-400 text-sm">
                {currentModel === 'Multilume' 
                  ? `Nästa uppgradering (Notor 65): ${Math.max(0, LEVEL_UP_SCORE - score).toFixed(0)} lumen` 
                  : "MAX LEVEL: Notor 65 Beta Opti"}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
              {score} <span className="text-base text-cyan-700">LUMEN</span>
            </div>
            {highScore > 0 && (
              <p className="text-xs text-slate-500 mt-1">REKORD: {highScore}</p>
            )}
          </div>
        </div>
      )}

      {/* Start Menu */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20">
          <div className="max-w-2xl w-full p-8 text-center animate-in zoom-in duration-500">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-cyan-500/30 blur-xl rounded-full"></div>
                <Lightbulb size={80} className="text-cyan-400 relative z-10" />
              </div>
            </div>
            
            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">
              LJUS<span className="text-cyan-400">KRIGET</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10">
              Fagerhult <span className="text-cyan-400 font-bold">Multilume</span> <span className="text-xs mx-2">VS</span> Glamox (Dåligt Ljus)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <MousePointer2 className="text-cyan-400 mb-2" />
                <h3 className="font-bold text-white">Styr Armaturen</h3>
                <p className="text-sm text-slate-400">Levla upp till <strong>Notor 65</strong> vid {LEVEL_UP_SCORE} lumen. Den är större och svårare!</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <ShieldAlert className="text-red-400 mb-2" />
                <h3 className="font-bold text-white">Undvik Glamox</h3>
                <p className="text-sm text-slate-400">Akta dig för bländande armaturer märkta "GLAMOX".</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <Zap className="text-yellow-400 mb-2" />
                <h3 className="font-bold text-white">Samla Ljus</h3>
                <p className="text-sm text-slate-400">Fånga Lumen-glober för att hålla ljuskvaliteten uppe.</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-12 py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xl font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            >
              Starta Installationen
            </button>
            
            <p className="mt-8 text-xs text-slate-600">
              Powered by React & Gemini AI (för avundsjuka konkurrenter)
            </p>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === GameState.GAME_OVER && (
        <GameOverModal 
          score={finalScore} 
          onRestart={startGame}
          onMenu={() => setGameState(GameState.MENU)}
        />
      )}
    </div>
  );
};

export default App;