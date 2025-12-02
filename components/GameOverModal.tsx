import React, { useEffect, useState } from 'react';
import { generateVillainTaunt } from '../services/geminiService';
import { COLORS } from '../constants';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart, onMenu }) => {
  const [taunt, setTaunt] = useState<string>("Beräknar hån...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    generateVillainTaunt(score).then(text => {
      if (mounted) {
        setTaunt(text);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [score]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center shadow-2xl shadow-red-900/50">
        <h2 className="text-4xl font-extrabold text-red-500 mb-2 uppercase tracking-widest">
          Slocknat!
        </h2>
        <p className="text-slate-400 mb-6">Fagerhult har besegrats av Glamox.</p>

        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <p className="text-xs text-red-400 font-bold uppercase mb-1">Meddelande från Glamox HQ:</p>
          <p className={`text-lg italic text-white transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            "{taunt}"
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-slate-400 uppercase tracking-wider">Poäng</p>
          <p className="text-5xl font-bold text-white font-mono">{score}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-slate-200 transition-transform active:scale-95 shadow-lg shadow-white/20"
          >
            Tänd igen (Spela)
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 text-slate-400 hover:text-white font-semibold transition-colors"
          >
            Tilluvudmenyn
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;