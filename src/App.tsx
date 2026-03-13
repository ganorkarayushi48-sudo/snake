import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal, Play, RotateCcw, Keyboard, Trophy, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Configuration
const GRID_WIDTH = 30;
const GRID_HEIGHT = 15;
const INITIAL_SNAKE = [
  { x: 10, y: 7 },
  { x: 9, y: 7 },
  { x: 8, y: 7 },
];
const INITIAL_DIRECTION = 'RIGHT';
const TICK_RATE = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function App() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 20, y: 7 });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [highScore, setHighScore] = useState(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1,
      };
      const isColliding = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isColliding) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions with walls
      if (
        newHead.x <= 0 || 
        newHead.x >= GRID_WIDTH - 1 || 
        newHead.y <= 0 || 
        newHead.y >= GRID_HEIGHT - 1
      ) {
        setGameState('GAME_OVER');
        return prevSnake;
      }

      // Check collisions with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameState('GAME_OVER');
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current = setInterval(moveSnake, TICK_RATE);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (gameState !== 'PLAYING') {
        if (key === 'enter' || key === ' ') startGame();
        return;
      }

      let newDir: Direction | null = null;
      if (key === 'w' || e.key === 'ArrowUp') newDir = 'UP';
      if (key === 's' || e.key === 'ArrowDown') newDir = 'DOWN';
      if (key === 'a' || e.key === 'ArrowLeft') newDir = 'LEFT';
      if (key === 'd' || e.key === 'ArrowRight') newDir = 'RIGHT';

      if (newDir) {
        // Prevent 180 degree turns
        const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (newDir !== opposites[directionRef.current]) {
          directionRef.current = newDir;
          setDirection(newDir);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameState('PLAYING');
    setFood({ x: 20, y: 7 });
  };

  const renderGrid = () => {
    const rows = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let rowStr = "";
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isSnakeHead = snake[0].x === x && snake[0].y === y;
        const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
        const isFood = food.x === x && food.y === y;
        const isBorder = x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;

        if (isBorder) rowStr += "#";
        else if (isSnakeHead) rowStr += "@";
        else if (isSnakeBody) rowStr += "o";
        else if (isFood) rowStr += "*";
        else rowStr += " ";
      }
      rows.push(rowStr);
    }
    return rows.join("\n");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff41] font-mono flex flex-col items-center justify-center p-4 selection:bg-[#00ff41] selection:text-black">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between border-b border-[#00ff41]/20 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">Terminal_Snake_v1.0</h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 opacity-50" />
            <span>HI_SCORE: {highScore.toString().padStart(4, '0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
            <span>SCORE: {score.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-[#00ff41]/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative bg-black border-2 border-[#00ff41] p-2 shadow-[0_0_20px_rgba(0,255,65,0.15)]">
          {/* ASCII Board */}
          <pre className="text-lg leading-none whitespace-pre select-none cursor-default">
            {renderGrid()}
          </pre>

          {/* Overlays */}
          <AnimatePresence>
            {gameState === 'START' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6"
              >
                <h2 className="text-2xl font-bold mb-4 animate-pulse">SYSTEM READY</h2>
                <p className="text-sm opacity-70 mb-8 max-w-xs">
                  USE [WASD] TO NAVIGATE. EAT THE [*] TO GROW. AVOID THE WALLS [#] AND YOURSELF.
                </p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00ff41] text-black font-bold hover:bg-[#00cc33] transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  INITIALIZE_GAME
                </button>
              </motion.div>
            )}

            {gameState === 'GAME_OVER' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 border-4 border-red-500/50"
              >
                <h2 className="text-3xl font-bold text-red-500 mb-2">CRITICAL_FAILURE</h2>
                <p className="text-xl mb-6">FINAL_SCORE: {score}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00ff41] text-black font-bold hover:bg-[#00cc33] transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    REBOOT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl text-xs opacity-50">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-[#00ff41]">
            <Keyboard className="w-4 h-4" />
            CONTROLS
          </div>
          <p>W / ↑ : UP</p>
          <p>S / ↓ : DOWN</p>
          <p>A / ← : LEFT</p>
          <p>D / → : RIGHT</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-[#00ff41]">
            <Code className="w-4 h-4" />
            SOURCE
          </div>
          <p>Language: TypeScript (Web)</p>
          <p>Engine: React Hooks</p>
          <p>Style: ASCII / Brutalist</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-[#00ff41]">
            <Terminal className="w-4 h-4" />
            PYTHON_VERSION
          </div>
          <p>Standalone script available in project root as <span className="text-[#00ff41]">snake.py</span></p>
          <p>Run via: python snake.py</p>
        </div>
      </div>

      {/* Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
