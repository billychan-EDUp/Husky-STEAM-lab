export enum GameStage {
  MENU = 'MENU',
  LOADING_ASSETS = 'LOADING_ASSETS',
  BATTLE_INTRO = 'BATTLE_INTRO',
  BATTLE_ACTIVE = 'BATTLE_ACTIVE',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum Operator {
  ADD = '+',
  SUB = '-',
  MUL = '×',
  DIV = '÷'
}

export interface MathProblem {
  num1: number;
  num2: number;
  operator: Operator;
  answer: number;
}

export interface Entity {
  id: string;
  name: string;
  imageUrl: string;
  maxHp: number;
  currentHp: number;
  level: number;
  element: string;
}

export interface GameStats {
  score: number;
  correctAnswers: number;
  fastestAnswerMs: number;
  totalTimeTakenMs: number;
}

export type Medal = 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';

export interface AssetGenerationStatus {
  total: number;
  completed: number;
  currentTask: string;
}