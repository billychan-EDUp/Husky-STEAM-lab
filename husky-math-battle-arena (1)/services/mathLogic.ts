
import { MathProblem, Operator } from '../types';
import { LEVEL_CONFIG } from '../constants';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateProblem = (level: number): MathProblem => {
  // Default to level 5 if out of bounds
  const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[5];
  const operator = config.operators[randomInt(0, config.operators.length - 1)];

  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  switch (operator) {
    case Operator.ADD:
      // Level 1: 1-9 + 1-9
      // Level 5: 5-20 + 5-20
      num1 = randomInt(1, level === 1 ? 9 : 20);
      num2 = randomInt(1, level === 1 ? 9 : 20);
      answer = num1 + num2;
      break;
    case Operator.SUB:
      // Level 2: 10-20 minus 1-9
      // Higher levels: slightly harder
      num1 = randomInt(level === 2 ? 10 : 15, level === 2 ? 20 : 40);
      num2 = randomInt(1, level === 2 ? 9 : 15); 
      // Ensure positive result
      if (num2 > num1) { const temp = num1; num1 = num2; num2 = temp; }
      answer = num1 - num2;
      break;
    case Operator.MUL:
      // Tables 2-5 for early levels, 2-9 for Level 5
      num1 = randomInt(2, level <= 3 ? 5 : 9);
      num2 = randomInt(2, level <= 3 ? 5 : 9);
      answer = num1 * num2;
      break;
    case Operator.DIV:
      // Answer 2-5 for early levels, 2-9 for Level 5
      answer = randomInt(2, level <= 4 ? 5 : 9);
      num2 = randomInt(2, level <= 4 ? 5 : 9);
      num1 = answer * num2;
      break;
  }

  return { num1, num2, operator, answer };
};
