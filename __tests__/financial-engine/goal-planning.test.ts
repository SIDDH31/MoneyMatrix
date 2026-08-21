import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  calculateGoalProgress,
  calculateAmountRemaining,
  calculateMonthsRemaining,
  calculateRequiredMonthlyContribution,
  calculateProjectedCompletion,
} from '../../src/lib/financial-engine/goal-planning';

describe('Goal Planning Calculations', () => {
  beforeAll(() => {
    // Lock the date to a fixed point in time for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T00:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('calculateGoalProgress', () => {
    it('calculates percentage correctly', () => {
      expect(calculateGoalProgress(5000, 10000)).toBe(50);
      expect(calculateGoalProgress(3333, 10000)).toBe(33.3);
    });

    it('caps at 100%', () => {
      expect(calculateGoalProgress(15000, 10000)).toBe(100);
    });

    it('handles zero or negative values', () => {
      expect(calculateGoalProgress(0, 10000)).toBe(0);
      expect(calculateGoalProgress(5000, 0)).toBe(0);
      expect(calculateGoalProgress(-1000, 10000)).toBe(0);
    });
  });

  describe('calculateAmountRemaining', () => {
    it('calculates remaining amount', () => {
      expect(calculateAmountRemaining(2000, 10000)).toBe(8000);
    });

    it('returns 0 if goal is met', () => {
      expect(calculateAmountRemaining(12000, 10000)).toBe(0);
    });

    it('handles negative current amount (debt)', () => {
      expect(calculateAmountRemaining(-2000, 10000)).toBe(10000);
    });
  });

  describe('calculateMonthsRemaining', () => {
    it('calculates months strictly', () => {
      const deadline = new Date('2026-12-01T00:00:00Z');
      expect(calculateMonthsRemaining(deadline)).toBe(4);
      
      const deadlineNextYear = new Date('2027-08-01T00:00:00Z');
      expect(calculateMonthsRemaining(deadlineNextYear)).toBe(12);
    });

    it('returns 0 if deadline has passed', () => {
      const deadline = new Date('2026-01-01T00:00:00Z');
      expect(calculateMonthsRemaining(deadline)).toBe(0);
    });
  });

  describe('calculateRequiredMonthlyContribution', () => {
    it('calculates simple linear contribution (0% return)', () => {
      // Need 12000 over 12 months = 1000/mo
      const deadline = new Date('2027-08-01T00:00:00Z'); // 12 months from 2026-08-01
      expect(calculateRequiredMonthlyContribution(0, 12000, deadline)).toBe(1000);
    });

    it('calculates with expected compounding return', () => {
      // Need 128093.28 over 12 months at 12% return = ~10000/mo (from investments.ts logic)
      const deadline = new Date('2027-08-01T00:00:00Z');
      const required = calculateRequiredMonthlyContribution(0, 128093.28, deadline, 12);
      expect(required).toBeCloseTo(10000, 0);
    });

    it('returns remaining amount if due immediately', () => {
      const deadline = new Date('2026-08-05T00:00:00Z'); // Still in August, months = 0
      expect(calculateRequiredMonthlyContribution(0, 5000, deadline)).toBe(5000);
    });

    it('returns null if no deadline is set', () => {
      expect(calculateRequiredMonthlyContribution(0, 5000, null)).toBeNull();
    });
    
    it('returns 0 if goal is already met', () => {
      const deadline = new Date('2027-08-01T00:00:00Z');
      expect(calculateRequiredMonthlyContribution(15000, 10000, deadline)).toBe(0);
    });
  });

  describe('calculateProjectedCompletion', () => {
    it('projects future date correctly', () => {
      // Need 12000, saving 1000/mo => takes 12 months => 2027-08-01
      const projected = calculateProjectedCompletion(0, 12000, 1000);
      expect(projected?.getFullYear()).toBe(2027);
      expect(projected?.getMonth()).toBe(7); // August is index 7
    });

    it('returns null if monthly contribution is 0', () => {
      expect(calculateProjectedCompletion(0, 12000, 0)).toBeNull();
    });

    it('returns current date if already completed', () => {
      const projected = calculateProjectedCompletion(15000, 12000, 1000);
      expect(projected?.getFullYear()).toBe(2026);
      expect(projected?.getMonth()).toBe(7); // Current fake month
    });
  });
});
