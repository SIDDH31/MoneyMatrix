import { describe, it, expect } from 'vitest';
import {
  calculateTotalROI,
  analyzePortfolio,
  calculatePortfolioWeight,
} from '../../src/lib/financial-engine/portfolio-analytics';

describe('Portfolio Analytics', () => {
  describe('calculateTotalROI', () => {
    it('calculates ROI percentage', () => {
      expect(calculateTotalROI(10000, 15000)).toBe(50);
      expect(calculateTotalROI(10000, 5000)).toBe(-50);
    });

    it('handles zero or negative investment', () => {
      expect(calculateTotalROI(0, 5000)).toBe(0);
      expect(calculateTotalROI(-1000, 5000)).toBe(0);
    });
  });

  describe('calculatePortfolioWeight', () => {
    it('calculates percentage weight', () => {
      expect(calculatePortfolioWeight(25000, 100000)).toBe(25);
    });

    it('handles zeroes', () => {
      expect(calculatePortfolioWeight(0, 100000)).toBe(0);
      expect(calculatePortfolioWeight(25000, 0)).toBe(0);
    });
  });

  describe('analyzePortfolio', () => {
    const mockPositions = [
      { id: '1', name: 'Stock A', category: 'Equities', investedAmount: 10000, currentValue: 15000 },
      { id: '2', name: 'Stock B', category: 'Equities', investedAmount: 5000, currentValue: 4000 },
      { id: '3', name: 'Bond A', category: 'Fixed Income', investedAmount: 10000, currentValue: 11000 },
    ];

    it('calculates total metrics accurately', () => {
      const summary = analyzePortfolio(mockPositions);

      expect(summary.totalInvested).toBe(25000);
      expect(summary.totalCurrentValue).toBe(30000);
      expect(summary.totalGainLoss).toBe(5000);
      expect(summary.totalReturnPercentage).toBe(20); // (30000 - 25000) / 25000 = 20%
    });

    it('aggregates allocations by category and sorts by weight', () => {
      const summary = analyzePortfolio(mockPositions);

      expect(summary.allocations).toHaveLength(2);
      
      // Equities: 19000, Fixed Income: 11000
      // Total: 30000
      // Equities weight: 19000/30000 = ~63.33%
      // Fixed Income weight: 11000/30000 = ~36.67%

      expect(summary.allocations[0].category).toBe('Equities');
      expect(summary.allocations[0].value).toBe(19000);
      expect(summary.allocations[0].weightPercentage).toBeCloseTo(63.33, 1);

      expect(summary.allocations[1].category).toBe('Fixed Income');
      expect(summary.allocations[1].value).toBe(11000);
      expect(summary.allocations[1].weightPercentage).toBeCloseTo(36.67, 1);
    });

    it('ignores invalid negative positions', () => {
      const badPositions = [
        ...mockPositions,
        { id: '4', name: 'Bad Data', category: 'Unknown', investedAmount: -100, currentValue: 500 },
      ];
      
      const summary = analyzePortfolio(badPositions);
      expect(summary.totalInvested).toBe(25000); // Bad pos is ignored
    });
    
    it('handles empty portfolio', () => {
      const summary = analyzePortfolio([]);
      expect(summary.totalInvested).toBe(0);
      expect(summary.totalCurrentValue).toBe(0);
      expect(summary.totalGainLoss).toBe(0);
      expect(summary.totalReturnPercentage).toBe(0);
      expect(summary.allocations).toHaveLength(0);
    });
  });
});
