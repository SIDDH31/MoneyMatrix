import { describe, it, expect } from 'vitest';
import {
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateCAGR,
  calculateSIPFutureValue,
  calculateRequiredSIP,
} from '../../src/lib/financial-engine/investments';

describe('Investment Calculations', () => {
  describe('calculateSimpleInterest', () => {
    it('calculates standard simple interest', () => {
      // 10000 at 5% for 2 years = 1000
      expect(calculateSimpleInterest(10000, 5, 2)).toBe(1000);
    });

    it('returns 0 for negative inputs', () => {
      expect(calculateSimpleInterest(-10000, 5, 2)).toBe(0);
      expect(calculateSimpleInterest(10000, 5, -2)).toBe(0);
    });

    it('handles 0 interest rate', () => {
      expect(calculateSimpleInterest(10000, 0, 2)).toBe(0);
    });
  });

  describe('calculateCompoundInterest', () => {
    it('calculates standard compound interest (annual)', () => {
      // 10000 at 5% for 2 years = 10000 * 1.05^2 = 11025
      expect(calculateCompoundInterest(10000, 5, 2)).toBeCloseTo(11025, 2);
    });

    it('calculates compound interest (monthly)', () => {
      // 10000 at 12% for 1 year compounded monthly = 10000 * (1 + 0.01)^12 = 11268.25
      expect(calculateCompoundInterest(10000, 12, 1, 12)).toBeCloseTo(11268.25, 2);
    });

    it('handles 0 interest rate', () => {
      expect(calculateCompoundInterest(10000, 0, 5)).toBe(10000);
    });

    it('returns principal for invalid periods/frequencies', () => {
      expect(calculateCompoundInterest(10000, 5, -2)).toBe(10000);
      expect(calculateCompoundInterest(10000, 5, 2, 0)).toBe(10000);
    });
  });

  describe('calculateCAGR', () => {
    it('calculates standard CAGR', () => {
      // 10000 to 20000 in 5 years = ~14.87%
      expect(calculateCAGR(10000, 20000, 5)).toBeCloseTo(14.87, 2);
    });

    it('handles negative growth (loss)', () => {
      // 10000 to 5000 in 2 years
      const cagr = calculateCAGR(10000, 5000, 2);
      expect(cagr).toBeLessThan(0);
    });

    it('returns 0 for invalid inputs', () => {
      expect(calculateCAGR(0, 20000, 5)).toBe(0);
      expect(calculateCAGR(10000, 0, 5)).toBe(0);
      expect(calculateCAGR(10000, 20000, 0)).toBe(0);
    });
  });

  describe('calculateSIPFutureValue', () => {
    it('calculates standard SIP FV (annuity due)', () => {
      // 10,000 per month for 1 year at 12% annual = ~ 128,093.28
      const fv = calculateSIPFutureValue(10000, 12, 1);
      expect(fv).toBeCloseTo(128093.28, 2);
    });

    it('handles 0 interest rate (just principal sum)', () => {
      // 10000 * 12 * 5 = 600000
      expect(calculateSIPFutureValue(10000, 0, 5)).toBe(600000);
    });

    it('returns 0 for negative/zero inputs', () => {
      expect(calculateSIPFutureValue(0, 12, 5)).toBe(0);
      expect(calculateSIPFutureValue(10000, 12, 0)).toBe(0);
    });
  });

  describe('calculateRequiredSIP', () => {
    it('calculates required SIP for target', () => {
      // To get 128093.28 in 1 year at 12%, we need ~10000/month
      const sip = calculateRequiredSIP(128093.28, 12, 1);
      expect(sip).toBeCloseTo(10000, 0);
    });

    it('handles 0 interest rate', () => {
      // To get 600000 in 5 years at 0%, need 600000 / 60 = 10000/mo
      expect(calculateRequiredSIP(600000, 0, 5)).toBe(10000);
    });

    it('returns 0 for negative/zero inputs', () => {
      expect(calculateRequiredSIP(0, 12, 5)).toBe(0);
      expect(calculateRequiredSIP(1000000, 12, 0)).toBe(0);
    });
  });
});
