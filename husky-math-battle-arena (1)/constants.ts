
import { Operator } from './types';

export const MAX_LEVELS = 5;
export const TURN_TIME_LIMIT_SEC = 10;
export const PLAYER_MAX_HP = 100;

// Scoring
export const BASE_DAMAGE = 15;
export const SCORE_PER_HP_REMAINING = 10;
export const SCORE_PER_SEC_REMAINING = 50;

export const LEVEL_CONFIG = {
  1: { name: 'Grass Lands', difficulty: 1, operators: [Operator.ADD] },
  2: { name: 'Rocky Road', difficulty: 2, operators: [Operator.SUB] },
  3: { name: 'Electric Plant', difficulty: 3, operators: [Operator.MUL] },
  4: { name: 'Icy Peak', difficulty: 4, operators: [Operator.DIV] },
  5: { name: 'Volcano Core', difficulty: 5, operators: [Operator.ADD, Operator.SUB, Operator.MUL, Operator.DIV] },
};

// Updated prompts to emphasize pure white background for better blending
export const MONSTER_PROMPTS = [
  "A cute plant-based pokemon-style monster, leaf turtle, simple design, vector art, isolated on pure white background, sticker style",
  "A sturdy rock-type pokemon-style monster, pebble golem, simple design, vector art, isolated on pure white background, sticker style",
  "A fast electric-type pokemon-style monster, yellow lightning cat, simple design, vector art, isolated on pure white background, sticker style",
  "A cool ice-type pokemon-style monster, blue penguin, simple design, vector art, isolated on pure white background, sticker style",
  "A fierce fire-type pokemon-style monster, little red dragon, simple design, vector art, isolated on pure white background, sticker style"
];

export const PLAYER_PROMPT = "A brave blue husky dog wearing futuristic goggles, hero character, pokemon trainer style, simple vector art, isolated on pure white background";
