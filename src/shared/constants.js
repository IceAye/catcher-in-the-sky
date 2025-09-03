import { msToMinutes } from './utils/time.js';

export const GAME_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  STOPPED: 'stopped'
};

export const MOVE_DIRECTIONS = {
  DOWN: 'DOWN',
  UP: 'UP',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
}

export const SCORE_RULES = {
  GLITCH_CATCH_REWARD: 15,
  CELL_CONFLICT_PENALTY: -8,
  OUT_OF_BOUNDS_PENALTY: -5,
  GLITCH_FAST_CATCH_BONUS: 20,
  GLITCH_FAST_CATCH_THRESHOLD: 3,
  GLITCH_MISS_PENALTY: 3,
  GLITCH_MISS_THRESHOLD: -5,
};

export const DEFAULT_GAME_TIME_IN_MIN = msToMinutes(1000 * 60 * 2);