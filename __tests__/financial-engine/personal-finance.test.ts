import { describe, it, expect } from 'vitest';
import {
  calculateNetWorth,
  calculateSavingsRate,
  calculateDebtToIncomeRatio,
  calculateEmergencyFundCoverage,
  calculateExpenseRatio,
  calculateTotalExpenses,
} from '../../src/lib/financial-engine/personal-finance';

describe('Personal Finance Calculations', () => {
  describe('calculateNetWorth', () => {
    it('calculates net worth correctly', () => {
      expect(calculateNetWorth(100000, 20000)).toBe(80000);
      expect(calculateNetWorth(50000, 75000)).toBe(-25000);
      expect(calculateNetWorth(0, 0)).toBe(0);
    });
  });

  describe('calculateSavingsRate', () => {
    it('calculates correct savings rate', () => {
      expect(calculateSavingsRate(10000, 7000)).toBe(30);
      expect(calculateSavingsRate(10000, 10000)).toBe(0);
    });

    it('returns 0 for zero or negative income', () => {
      expect(calculateSavingsRate(0, 5000)).toBe(0);
      expect(calculateSavingsRate(-5000, 5000)).toBe(0);
    });

    it('caps savings rate between 0 and 100', () => {
      expect(calculateSavingsRate(10000, -2000)).toBe(100); // Technically weird, but caps at 100
      expect(calculateSavingsRate(10000, 15000)).toBe(0); // Overspending means 0 savings
    });
    
    it('rounds to 2 decimal places', () => {
      expect(calculateSavingsRate(10000, 6666)).toBe(33.34); // 33.34%
    });
  });

  describe('calculateDebtToIncomeRatio', () => {
    it('calculates standard DTI', () => {
      expect(calculateDebtToIncomeRatio(3000, 10000)).toBe(30);
    });

    it('handles zero income', () => {
      expect(calculateDebtToIncomeRatio(1000, 0)).toBe(100);
      expect(calculateDebtToIncomeRatio(0, 0)).toBe(0);
    });

    it('handles zero debt', () => {
      expect(calculateDebtToIncomeRatio(0, 10000)).toBe(0);
    });
  });

  describe('calculateEmergencyFundCoverage', () => {
    it('calculates coverage in months', () => {
      expect(calculateEmergencyFundCoverage(30000, 5000)).toBe(6);
      expect(calculateEmergencyFundCoverage(12000, 5000)).toBe(2.4);
    });

    it('handles zero savings', () => {
      expect(calculateEmergencyFundCoverage(0, 5000)).toBe(0);
    });

    it('handles zero expenses', () => {
      expect(calculateEmergencyFundCoverage(10000, 0)).toBe(Infinity);
    });
  });

  describe('calculateExpenseRatio', () => {
    it('calculates standard ratio', () => {
      expect(calculateExpenseRatio(2500, 10000)).toBe(25);
    });

    it('handles zero income or zero expense', () => {
      expect(calculateExpenseRatio(0, 10000)).toBe(0);
      expect(calculateExpenseRatio(2500, 0)).toBe(0);
    });
  });

  describe('calculateTotalExpenses', () => {
    it('sums budgets ignoring negatives', () => {
      const budgets = [
        { limit: 5000 },
        { limit: 2500 },
        { limit: -100 }, // Should ignore or clamp to 0 based on implementation
      ];
      expect(calculateTotalExpenses(budgets)).toBe(7500);
    });
    
    it('handles empty array', () => {
      expect(calculateTotalExpenses([])).toBe(0);
    });
  });
});
