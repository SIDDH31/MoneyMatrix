import type { RiskTolerance } from '@/lib/models';
import { riskQuizSchema } from '../validations/onboarding';
import * as z from 'zod';

type QuizData = z.infer<typeof riskQuizSchema>;

export function calculateRiskScore(answers: QuizData): { score: number; tolerance: RiskTolerance } {
  let score = 0;

  // Q1: Reaction to 20% drop (Max 4 points)
  switch (answers.reactionToDrop) {
    case 'sell_all': score += 1; break;
    case 'sell_some': score += 2; break;
    case 'do_nothing': score += 3; break;
    case 'buy_more': score += 4; break;
  }

  // Q2: Time Horizon (Max 4 points)
  switch (answers.timeHorizon) {
    case 'less_than_1': score += 1; break;
    case '1_to_3': score += 2; break;
    case '3_to_7': score += 3; break;
    case 'more_than_7': score += 4; break;
  }

  // Q3: Primary Objective (Max 4 points)
  switch (answers.primaryObjective) {
    case 'capital_preservation': score += 1; break;
    case 'income': score += 2; break;
    case 'growth': score += 3; break;
    case 'speculation': score += 4; break;
  }

  // Total possible score: 12. Min score: 3.
  let tolerance: RiskTolerance = 'MODERATE';

  if (score <= 4) tolerance = 'CONSERVATIVE';
  else if (score <= 6) tolerance = 'MODERATELY_CONSERVATIVE';
  else if (score <= 8) tolerance = 'MODERATE';
  else if (score <= 10) tolerance = 'MODERATELY_AGGRESSIVE';
  else tolerance = 'AGGRESSIVE';

  return { score, tolerance };
}
