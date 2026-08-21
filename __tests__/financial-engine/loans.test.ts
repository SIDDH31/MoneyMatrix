import { describe, it, expect } from 'vitest';
import {
  calculateEMI,
  generateAmortizationSchedule,
} from '../../src/lib/financial-engine/loans';

describe('Loan Calculations', () => {
  describe('calculateEMI', () => {
    it('calculates standard EMI correctly', () => {
      // 100,000 at 10% annual for 12 months = ~8791.59
      const emi = calculateEMI(100000, 10, 12);
      expect(emi).toBeCloseTo(8791.59, 2);
    });

    it('handles 0% interest rate', () => {
      // 120,000 for 12 months = 10,000/mo
      expect(calculateEMI(120000, 0, 12)).toBe(10000);
    });

    it('returns 0 for zero principal or zero tenure', () => {
      expect(calculateEMI(0, 10, 12)).toBe(0);
      expect(calculateEMI(100000, 10, 0)).toBe(0);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('generates correct schedule and totals', () => {
      const { emi, totalInterest, totalPayment, schedule } = generateAmortizationSchedule(100000, 10, 12);
      
      expect(emi).toBeCloseTo(8791.59, 2);
      expect(schedule).toHaveLength(12);
      
      // Total payment should be EMI * 12
      expect(totalPayment).toBeCloseTo(8791.59 * 12, 1);
      
      // First month interest = 100000 * (10/12/100) = ~833.33
      expect(schedule[0].interestPayment).toBeCloseTo(833.33, 2);
      expect(schedule[0].principalPayment).toBeCloseTo(8791.59 - 833.33, 2);
      
      // Remaining balance after 12 months should be exactly 0
      expect(schedule[11].remainingBalance).toBe(0);
    });

    it('handles 0% interest rate gracefully', () => {
      const { emi, totalInterest, totalPayment, schedule } = generateAmortizationSchedule(120000, 0, 12);
      
      expect(emi).toBe(10000);
      expect(totalInterest).toBe(0);
      expect(totalPayment).toBe(120000);
      expect(schedule[0].interestPayment).toBe(0);
      expect(schedule[0].principalPayment).toBe(10000);
      expect(schedule[11].remainingBalance).toBe(0);
    });

    it('returns empty schedule for invalid inputs', () => {
      const res1 = generateAmortizationSchedule(0, 10, 12);
      expect(res1.schedule).toHaveLength(0);
      expect(res1.emi).toBe(0);

      const res2 = generateAmortizationSchedule(100000, 10, 0);
      expect(res2.schedule).toHaveLength(0);
    });
  });
});
