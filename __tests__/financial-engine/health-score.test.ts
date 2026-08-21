import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from '../../src/lib/financial-engine/health-score';

describe('Health Score Calculations', () => {
  it('calculates perfect score for ideal finances', () => {
    const result = calculateHealthScore({
      monthlyIncome: 10000,
      monthlyExpenses: 5000,      // Savings rate = 50% (>20% = max points 25)
      totalSavings: 50000,        // 10 months expenses (>6mo = max points 20)
      totalLiabilities: 0,        // No debt (max points 20)
      hasInvestments: true,       
      investmentCount: 5,         // >3 investments (max points 15)
      goals: [                    // 100% progress (max points 20)
        { currentAmount: 10000, targetAmount: 10000 }
      ],
    });

    expect(result.score).toBe(100);
    expect(result.grade).toBe('Excellent');
    expect(result.factors.length).toBe(5);
    
    expect(result.factors[0].score).toBe(25); // Savings
    expect(result.factors[1].score).toBe(20); // Emergency
    expect(result.factors[2].score).toBe(20); // Debt
    expect(result.factors[3].score).toBe(15); // Invest
    expect(result.factors[4].score).toBe(20); // Goals
  });

  it('calculates poor score for bad finances', () => {
    const result = calculateHealthScore({
      monthlyIncome: 10000,
      monthlyExpenses: 11000,     // Savings rate = negative (0 points)
      totalSavings: 0,            // 0 months expenses (0 points)
      totalLiabilities: 500000,   // Debt-to-income = 500000 / 120000 = ~4.16 (>1.0 = 2 points)
      hasInvestments: false,      // No investments (0 points)
      investmentCount: 0,         
      goals: [                    // 0% progress (0 points)
        { currentAmount: 0, targetAmount: 10000 }
      ],
    });

    expect(result.score).toBe(2);
    expect(result.grade).toBe('Critical');
  });

  it('handles zero income and zero expenses safely', () => {
    const result = calculateHealthScore({
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalSavings: 0,
      totalLiabilities: 0,
      hasInvestments: false,
      investmentCount: 0,
      goals: [],
    });

    // Score breakdown for zeroes:
    // Savings: 0
    // Emergency: 0
    // Debt: 20 (no debt)
    // Invest: 0
    // Goals: 5 (no goals but passed onboarding = 5 base points)
    expect(result.score).toBe(25);
    expect(result.grade).toBe('Critical');
  });
});
