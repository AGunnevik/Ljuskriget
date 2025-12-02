export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity extends Position, Size {
  vx: number;
  vy: number;
  color: string;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Player extends Entity {
  speed: number;
  model: 'multilume' | 'notor65';
}

export interface Enemy extends Entity {
  speed: number;
  type: 'chaser' | 'dropper' | 'zigzag';
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
  alpha: number;
}

export interface PowerUp extends Entity {
  type: 'lumen';
  value: number;
}