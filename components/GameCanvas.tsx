import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, Enemy, Particle, PowerUp } from '../types';
import { COLORS, MULTILUME_SIZE, NOTOR_SIZE, ENEMY_SIZE, LUMEN_SIZE, SPAWN_RATE_INITIAL, DIFFICULTY_RAMP, LEVEL_UP_SCORE } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setFinalScore: (score: number) => void;
  setCurrentModel: (model: string) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, setScore, setFinalScore, setCurrentModel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const scoreRef = useRef<number>(0);
  
  // Game Entities Refs
  const playerRef = useRef<Player>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    width: MULTILUME_SIZE.width,
    height: MULTILUME_SIZE.height,
    vx: 0,
    vy: 0,
    speed: 5,
    color: COLORS.FAGERHULT_MAIN,
    model: 'multilume'
  });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  
  // Input state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef<{ x: number, y: number } | null>(null);
  
  // Game Logic state
  const frameCountRef = useRef<number>(0);
  const spawnRateRef = useRef<number>(SPAWN_RATE_INITIAL);

  const spawnEnemy = (width: number, height: number) => {
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x = 0, y = 0, vx = 0, vy = 0;
    const speed = 3 + Math.random() * 2 + (scoreRef.current / 500); // Speed increases with score

    switch(edge) {
      case 0: // Top
        x = Math.random() * width;
        y = -ENEMY_SIZE.height;
        vy = speed;
        vx = (Math.random() - 0.5) * 2;
        break;
      case 1: // Right
        x = width + ENEMY_SIZE.width;
        y = Math.random() * height;
        vx = -speed;
        vy = (Math.random() - 0.5) * 2;
        break;
      case 2: // Bottom
        x = Math.random() * width;
        y = height + ENEMY_SIZE.height;
        vy = -speed;
        vx = (Math.random() - 0.5) * 2;
        break;
      case 3: // Left
        x = -ENEMY_SIZE.width;
        y = Math.random() * height;
        vx = speed;
        vy = (Math.random() - 0.5) * 2;
        break;
    }

    enemiesRef.current.push({
      x, y, vx, vy,
      width: ENEMY_SIZE.width,
      height: ENEMY_SIZE.height,
      color: COLORS.GLAMOX_MAIN,
      speed,
      type: Math.random() > 0.7 ? 'chaser' : 'dropper'
    });
  };

  const spawnPowerUp = (width: number, height: number) => {
    powerUpsRef.current.push({
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
      width: LUMEN_SIZE.width,
      height: LUMEN_SIZE.height,
      vx: 0,
      vy: 0,
      color: COLORS.LUMEN,
      type: 'lumen',
      value: 50
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        width: 3, height: 3,
        color: color,
        life: 1.0,
        maxLife: 1.0,
        alpha: 1
      });
    }
  };

  const levelUpEffect = (x: number, y: number) => {
    // Big blue explosion for level up
    for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          width: 4, height: 4,
          color: COLORS.FAGERHULT_MAIN,
          life: 1.5,
          maxLife: 1.5,
          alpha: 1
        });
      }
  }

  const update = useCallback((canvas: HTMLCanvasElement) => {
    if (gameState !== GameState.PLAYING) return;

    const width = canvas.width;
    const height = canvas.height;
    const player = playerRef.current;

    // 0. Level Up Logic
    if (scoreRef.current >= LEVEL_UP_SCORE && player.model === 'multilume') {
        player.model = 'notor65';
        player.width = NOTOR_SIZE.width;
        player.height = NOTOR_SIZE.height;
        setCurrentModel('Notor 65');
        levelUpEffect(player.x, player.y);
    }

    // 1. Update Player Movement
    if (mousePos.current) {
      const dx = mousePos.current.x - player.x;
      const dy = mousePos.current.y - player.y;
      player.x += dx * 0.1;
      player.y += dy * 0.1;
    } else {
      if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) player.y -= player.speed;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) player.y += player.speed;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) player.x -= player.speed;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) player.x += player.speed;
    }

    player.x = Math.max(player.width/2, Math.min(width - player.width/2, player.x));
    player.y = Math.max(player.height/2, Math.min(height - player.height/2, player.y));

    // 2. Spawn Enemies
    frameCountRef.current++;
    if (frameCountRef.current >= spawnRateRef.current) {
      spawnEnemy(width, height);
      frameCountRef.current = 0;
      if (spawnRateRef.current > 10) spawnRateRef.current *= DIFFICULTY_RAMP;
    }

    // 3. Spawn Powerups
    if (Math.random() < 0.01) {
      spawnPowerUp(width, height);
    }

    // 4. Update Enemies
    enemiesRef.current.forEach(enemy => {
      if (enemy.type === 'chaser') {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.vx = Math.cos(angle) * (enemy.speed * 0.6);
        enemy.vy = Math.sin(angle) * (enemy.speed * 0.6);
      }
      
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
    });

    enemiesRef.current = enemiesRef.current.filter(e => 
      e.x > -100 && e.x < width + 100 && e.y > -100 && e.y < height + 100
    );

    // 5. Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.alpha = p.life;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 6. Collision Detection
    for (const enemy of enemiesRef.current) {
      // Simple AABB for boxy shapes (since Notor is long)
      const collision = 
        player.x - player.width/2 < enemy.x + enemy.width/2 &&
        player.x + player.width/2 > enemy.x - enemy.width/2 &&
        player.y - player.height/2 < enemy.y + enemy.height/2 &&
        player.y + player.height/2 > enemy.y - enemy.height/2;
      
      if (collision) {
        setFinalScore(Math.floor(scoreRef.current));
        createExplosion(player.x, player.y, COLORS.FAGERHULT_MAIN);
        setGameState(GameState.GAME_OVER);
        return; 
      }
    }

    powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
      // Box collision for powerups too
      const collision = 
        player.x - player.width/2 < powerUp.x + powerUp.width/2 &&
        player.x + player.width/2 > powerUp.x - powerUp.width/2 &&
        player.y - player.height/2 < powerUp.y + powerUp.height/2 &&
        player.y + player.height/2 > powerUp.y - powerUp.height/2;

      if (collision) {
        scoreRef.current += powerUp.value;
        setScore(Math.floor(scoreRef.current));
        createExplosion(powerUp.x, powerUp.y, COLORS.LUMEN);
        return false;
      }
      return true;
    });

    scoreRef.current += 0.1;
    setScore(Math.floor(scoreRef.current));

  }, [gameState, setGameState, setScore, setFinalScore, setCurrentModel]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Draw PowerUps (Lumen)
    powerUpsRef.current.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(Math.random()*4-2, Math.random()*4-2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Enemies (Glamox)
    enemiesRef.current.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      
      const jitterX = Math.random() * 2 - 1;
      const jitterY = Math.random() * 2 - 1;
      ctx.translate(jitterX, jitterY);

      ctx.shadowBlur = 15;
      ctx.shadowColor = COLORS.GLAMOX_MAIN;

      // Body
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.rect(-e.width/2, -e.height/2, e.width, e.height);
      ctx.fill();
      
      // Ugly red/yellow light source
      ctx.fillStyle = Math.random() > 0.5 ? '#fef08a' : '#ef4444';
      ctx.fillRect(-e.width/2 + 3, -e.height/2 + 3, e.width - 6, e.height - 6);

      // Text "GLAMOX"
      ctx.fillStyle = 'black';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GLAMOX', 0, 0);

      ctx.restore();
    });

    // Draw Player
    const p = playerRef.current;
    if (gameState !== GameState.GAME_OVER) {
      ctx.save();
      ctx.translate(p.x, p.y);
      
      ctx.shadowBlur = 25;
      ctx.shadowColor = COLORS.FAGERHULT_MAIN;
      
      const w = p.width;
      const h = p.height;

      if (p.model === 'multilume') {
        // MULTILUME DESIGN (Rounded Square)
        const r = 8; 
        ctx.fillStyle = '#f8fafc'; // Clean white
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h, r);
        ctx.fill();

        // Microprism texture
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        const spacing = 5;
        for(let x = -w/2 + 3; x < w/2 - 3; x += spacing) {
            for(let y = -h/2 + 3; y < h/2 - 3; y += spacing) {
                ctx.fillRect(x, y, 2, 2);
            }
        }
        
        // Frame
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();

      } else {
        // NOTOR 65 DESIGN (Long Rectangular)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-w/2, -h/2, w, h);
        
        // Beta Opti louvres (lines across)
        ctx.fillStyle = '#e2e8f0';
        // Draw the louvre grid
        const sections = 10;
        const sectionW = w / sections;
        for(let i=0; i<sections; i++) {
             // Darker lines for louvres
             ctx.fillStyle = '#94a3b8';
             ctx.fillRect(-w/2 + (i*sectionW), -h/2, 2, h);
             
             // Light glow inside
             ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
             ctx.fillRect(-w/2 + (i*sectionW) + 2, -h/2 + 2, sectionW - 4, h - 4);
        }
        
        // Outer housing
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(-w/2, -h/2, w, h);
      }
      
      ctx.restore();
    }

    // Draw Particles
    particlesRef.current.forEach(part => {
      ctx.save();
      ctx.globalAlpha = part.alpha;
      ctx.fillStyle = part.color;
      ctx.fillRect(part.x, part.y, part.width, part.height);
      ctx.restore();
    });

  }, [gameState]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update(canvas);
    draw(ctx, canvas);

    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; mousePos.current = null; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    const handleMouseMove = (e: MouseEvent) => { 
        mousePos.current = { x: e.clientX, y: e.clientY }; 
    };
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); 
        if(e.touches.length > 0) {
            mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Start Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Reset Logic
  useEffect(() => {
    if (gameState === GameState.PLAYING && scoreRef.current === 0) {
      enemiesRef.current = [];
      particlesRef.current = [];
      powerUpsRef.current = [];
      spawnRateRef.current = SPAWN_RATE_INITIAL;
      if (canvasRef.current) {
        playerRef.current.x = canvasRef.current.width / 2;
        playerRef.current.y = canvasRef.current.height / 2;
        // Reset to Multilume
        playerRef.current.model = 'multilume';
        playerRef.current.width = MULTILUME_SIZE.width;
        playerRef.current.height = MULTILUME_SIZE.height;
        setCurrentModel('Multilume');
      }
    } else if (gameState === GameState.MENU) {
        scoreRef.current = 0;
        setCurrentModel('Multilume');
    }
  }, [gameState, setCurrentModel]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

export default GameCanvas;