import React, { useState, useEffect } from 'react';
import { Undo2, RotateCcw, Play, Trophy, Sparkles, Wand2, Lightbulb } from 'lucide-react';

const TUBE_CAPACITY = 4;

// Upgraded to cute magical items with pastel gradients and emojis!
const COLOR_MAP = {
  'heart': { style: 'bg-gradient-to-br from-pink-300 to-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.6)]', icon: '💖' },
  'star': { style: 'bg-gradient-to-br from-purple-300 to-fuchsia-400 shadow-[0_0_15px_rgba(216,180,254,0.6)]', icon: '⭐' },
  'moon': { style: 'bg-gradient-to-br from-yellow-200 to-amber-300 shadow-[0_0_15px_rgba(253,230,138,0.6)]', icon: '🌙' },
  'diamond': { style: 'bg-gradient-to-br from-cyan-200 to-blue-300 shadow-[0_0_15px_rgba(165,243,252,0.6)]', icon: '💎' },
  'flower': { style: 'bg-gradient-to-br from-orange-200 to-rose-300 shadow-[0_0_15px_rgba(254,205,211,0.6)]', icon: '🌸' },
  'clover': { style: 'bg-gradient-to-br from-emerald-200 to-green-300 shadow-[0_0_15px_rgba(167,243,208,0.6)]', icon: '🍀' },
  'cloud': { style: 'bg-gradient-to-br from-sky-100 to-indigo-200 shadow-[0_0_15px_rgba(224,231,255,0.6)]', icon: '☁️' },
  'bow': { style: 'bg-gradient-to-br from-fuchsia-400 to-pink-500 shadow-[0_0_15px_rgba(240,171,252,0.6)]', icon: '🎀' },
};

// Generates a fully solvable puzzle working backwards
const generatePuzzle = (level) => {
  const numColors = Math.min(2 + level, 8); 
  const numTubes = numColors + 2;
  let tubes = Array.from({ length: numTubes }, () => []);
  const availableColors = Object.keys(COLOR_MAP).slice(0, numColors);
  
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < TUBE_CAPACITY; j++) {
      tubes[i].push(availableColors[i]);
    }
  }

  let shuffles = 150 + numColors * 30; // Increased shuffle count for better mixing
  let prevMovedTo = -1;

  for (let i = 0; i < shuffles; i++) {
    const validSources = tubes.map((t, idx) => ({ t, idx })).filter(x => x.t.length > 0);
    if (validSources.length === 0) continue;

    let sourceOpts = validSources.filter(x => x.idx !== prevMovedTo);
    if (sourceOpts.length === 0) sourceOpts = validSources;

    const fromIdx = sourceOpts[Math.floor(Math.random() * sourceOpts.length)].idx;
    const validDests = tubes.map((t, idx) => ({ t, idx })).filter(x => x.t.length < TUBE_CAPACITY && x.idx !== fromIdx);
    
    if (validDests.length === 0) continue;
    const toIdx = validDests[Math.floor(Math.random() * validDests.length)].idx;

    const ball = tubes[fromIdx].pop();
    tubes[toIdx].push(ball);
    prevMovedTo = fromIdx; 
  }

  return tubes;
};

const deepClone = (arr) => JSON.parse(JSON.stringify(arr));

export default function App() {
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState([]);
  const [initialTubes, setInitialTubes] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [shakingTube, setShakingTube] = useState(null);
  const [activeHint, setActiveHint] = useState(null);

  useEffect(() => {
    startLevel(level);
  }, [level]);

  useEffect(() => {
    if (tubes.length === 0) return;
    
    let won = true;
    for (let i = 0; i < tubes.length; i++) {
      const tube = tubes[i];
      if (tube.length > 0) {
        if (tube.length !== TUBE_CAPACITY) { won = false; break; }
        if (!tube.every(color => color === tube[0])) { won = false; break; }
      }
    }

    if (won && !isWon) {
      setIsWon(true);
      setSelectedTube(null);
      setActiveHint(null);
    }
  }, [tubes]);

  const startLevel = (lvl) => {
    const newTubes = generatePuzzle(lvl);
    setTubes(newTubes);
    setInitialTubes(deepClone(newTubes));
    setHistory([]);
    setSelectedTube(null);
    setMoves(0);
    setIsWon(false);
    setActiveHint(null);
  };

  const isTubeComplete = (tube) => {
    return tube.length === TUBE_CAPACITY && tube.every(c => c === tube[0]);
  };

  // Smart hint algorithm
  const getHint = () => {
    setActiveHint(null);
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].length === 0 || isTubeComplete(tubes[i])) continue;
      
      const allSameColor = tubes[i].every(c => c === tubes[i][0]);
      
      for (let j = 0; j < tubes.length; j++) {
        if (i === j || tubes[j].length === TUBE_CAPACITY) continue;
        
        // Don't suggest moving a fully uniform pile into an empty tube (waste of move)
        if (tubes[j].length === 0 && allSameColor) continue;

        if (tubes[j].length === 0 || tubes[j][tubes[j].length - 1] === tubes[i][tubes[i].length - 1]) {
          setActiveHint({ from: i, to: j });
          return;
        }
      }
    }
  };

  const handleTubeClick = (index) => {
    if (isWon) return;
    setActiveHint(null);

    if (selectedTube === null) {
      if (tubes[index].length > 0) setSelectedTube(index);
    } else {
      if (selectedTube === index) {
        setSelectedTube(null);
        return;
      }

      const sourceTube = tubes[selectedTube];
      const destTube = tubes[index];
      const ballToMove = sourceTube[sourceTube.length - 1];
      const topDestBall = destTube.length > 0 ? destTube[destTube.length - 1] : null;

      if (destTube.length < TUBE_CAPACITY && (destTube.length === 0 || topDestBall === ballToMove)) {
        // Valid Move
        setHistory([...history, deepClone(tubes)]);
        const newTubes = deepClone(tubes);
        newTubes[index].push(newTubes[selectedTube].pop());
        
        setTubes(newTubes);
        setMoves(moves + 1);
        setSelectedTube(null);
      } else {
        // Invalid Move - Trigger Shake
        setShakingTube(index);
        setTimeout(() => setShakingTube(null), 400); // match animation duration
        
        if (destTube.length > 0) {
          setSelectedTube(index); // Switch selection instead for fluid feel
        } else {
          setSelectedTube(null);
        }
      }
    }
  };

  const undoMove = () => {
    if (history.length > 0 && !isWon) {
      setTubes(history[history.length - 1]);
      setHistory(history.slice(0, -1));
      setSelectedTube(null);
      setMoves(Math.max(0, moves - 1));
      setActiveHint(null);
    }
  };

  // Dynamically calculate tube width to ensure they fit gracefully on screen
  const tubeWidthClass = tubes.length > 8 ? 'w-12 sm:w-14' : 'w-14 sm:w-16 md:w-20';
  const tubeHeightClass = tubes.length > 8 ? 'h-56 sm:h-64' : 'h-64 sm:h-72 md:h-80';
  const orbSizeClass = tubes.length > 8 ? 'w-10 h-10 sm:w-12 sm:h-12 text-sm' : 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-xl sm:text-2xl md:text-3xl';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 text-purple-900 font-sans flex flex-col items-center py-8 px-4 overflow-hidden relative selection:bg-pink-300/50">
      
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 text-4xl opacity-50 animate-pulse pointer-events-none">✨</div>
      <div className="absolute top-40 right-20 text-5xl opacity-40 animate-bounce pointer-events-none" style={{animationDuration: '3s'}}>☁️</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-60 animate-bounce pointer-events-none" style={{animationDuration: '4s'}}>🦄</div>
      <div className="absolute bottom-40 right-10 text-4xl opacity-50 animate-pulse pointer-events-none">🌈</div>

      {/* Inject custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(-150%) scale(1.05); }
          50% { transform: translateY(-165%) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px) rotate(-2deg); }
          40%, 80% { transform: translateX(6px) rotate(2deg); }
        }
        .animate-float { animation: float 1.5s ease-in-out infinite; }
        .animate-shake-error { animation: shake 0.4s ease-in-out; }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-10 z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 flex items-center gap-2 drop-shadow-sm">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-pink-500 animate-pulse" />
            Unicorn Sort
          </h1>
          <div className="flex gap-4 mt-2 text-sm md:text-base text-purple-700 font-bold">
            <span className="bg-white/50 px-3 py-1 rounded-full border border-pink-200 shadow-sm">Level {level}</span>
            <span className="bg-white/50 px-3 py-1 rounded-full border border-pink-200 shadow-sm">Moves: {moves}</span>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <button onClick={getHint} disabled={isWon}
            className="p-3 rounded-full bg-white hover:bg-pink-50 text-pink-500 border-2 border-pink-200 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-pink-200/50"
            title="Magic Hint!">
            <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={undoMove} disabled={history.length === 0 || isWon}
            className="p-3 rounded-full bg-white hover:bg-pink-50 text-purple-500 border-2 border-purple-200 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-purple-200/50"
            title="Undo Move">
            <Undo2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={() => startLevel(level)} disabled={isWon && history.length === 0}
            className="p-3 rounded-full bg-white hover:bg-indigo-50 text-indigo-500 border-2 border-indigo-200 transition-all active:scale-95 shadow-md shadow-indigo-200/50"
            title="Restart Level">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col justify-center items-center w-full z-10 mb-8">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 max-w-4xl px-4">
          {tubes.map((tube, tubeIndex) => {
            const complete = isTubeComplete(tube);
            const isSelected = selectedTube === tubeIndex;
            const isShaking = shakingTube === tubeIndex;
            const isHintSource = activeHint?.from === tubeIndex;
            const isHintTarget = activeHint?.to === tubeIndex;

            return (
              <div 
                key={tubeIndex}
                onClick={() => handleTubeClick(tubeIndex)}
                className={`
                  relative flex flex-col-reverse items-center justify-start 
                  ${tubeWidthClass} ${tubeHeightClass}
                  p-1 sm:p-2 cursor-pointer transition-all duration-300
                  border-x-[4px] border-b-[4px] rounded-b-[2rem] shadow-lg
                  ${complete 
                    ? 'border-yellow-400 bg-yellow-100/60 shadow-[0_0_30px_rgba(250,204,21,0.5)]' 
                    : 'border-pink-300 bg-white/40 backdrop-blur-md hover:bg-white/60'
                  }
                  ${isSelected ? 'border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.5)] -translate-y-2' : ''}
                  ${isShaking ? 'animate-shake-error border-red-400' : ''}
                  ${(isHintSource || isHintTarget) ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-pink-100' : ''}
                `}
              >
                {/* Flask Lip */}
                <div className={`absolute -top-[4px] -left-[8px] -right-[8px] h-4 rounded-full border-[4px] border-b-0
                  ${complete ? 'border-yellow-400 bg-yellow-200' : isSelected ? 'border-purple-400 bg-purple-100' : 'border-pink-300 bg-pink-50'}
                `}></div>

                {/* Orbs */}
                {tube.map((color, ballIndex) => {
                  const isTopBall = ballIndex === tube.length - 1;
                  const isElevated = isSelected && isTopBall;
                  const orbData = COLOR_MAP[color];

                  return (
                    <div 
                      key={`${tubeIndex}-${ballIndex}`}
                      className={`
                        ${orbSizeClass} rounded-full mb-1 sm:mb-2 flex-shrink-0
                        transition-all duration-300 ease-out z-10 relative
                        flex items-center justify-center border-2 border-white/50
                        ${orbData.style}
                        ${isElevated ? 'animate-float' : 'translate-y-0'}
                      `}
                    >
                      <span className="drop-shadow-md select-none">{orbData.icon}</span>
                      <div className="absolute top-[10%] left-[15%] w-1/3 h-1/3 bg-white/60 rounded-full blur-[1px] rotate-[-45deg]"></div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Win Overlay Modal */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-900/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white border-4 border-pink-300 p-8 md:p-10 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 transform scale-100 animate-in zoom-in-90 duration-500 relative overflow-hidden">
            
            <div className="absolute -top-6 -right-6 text-6xl opacity-20">🌈</div>
            <div className="absolute -bottom-4 -left-4 text-6xl opacity-20">🦄</div>

            <div className="relative w-24 h-24 mb-6 z-10">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
              <div className="relative w-full h-full bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.6)] border-4 border-white">
                <span className="text-4xl">🦄</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2 z-10 text-center">Magical!</h2>
            <p className="text-purple-600 mb-8 text-center text-lg font-medium z-10">
              Level {level} cleared in <span className="text-pink-600 font-bold bg-pink-100 px-2 py-1 rounded-lg">{moves}</span> moves.
            </p>
            
            <button 
              onClick={() => setLevel(level + 1)}
              className="group w-full py-4 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] flex items-center justify-center gap-3 active:scale-95 z-10 border-2 border-pink-200"
            >
              Next Level ✨ <Play className="w-6 h-6 fill-current group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}