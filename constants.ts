export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_SIZE = { width: 40, height: 40 }; // Default start size (Multilume)
export const MULTILUME_SIZE = { width: 45, height: 45 };
export const NOTOR_SIZE = { width: 120, height: 30 }; // Notor 65 is long and wide

export const ENEMY_SIZE = { width: 45, height: 45 };
export const LUMEN_SIZE = { width: 15, height: 15 };

export const LEVEL_UP_SCORE = 500;

export const COLORS = {
  FAGERHULT_MAIN: '#00bfff', // Cyan/Blue glow
  FAGERHULT_CORE: '#ffffff',
  GLAMOX_MAIN: '#ef4444',    // Red warning
  GLAMOX_CORE: '#7f1d1d',
  LUMEN: '#fbbf24',          // Gold/Yellow
  BACKGROUND: '#0f172a',
};

export const SPAWN_RATE_INITIAL = 60; // Frames between spawns
export const DIFFICULTY_RAMP = 0.999; // Spawn rate multiplier per frame