/**
 * heartRate Utility Tests
 * Tests: threshold constants, HR status labeling, color mapping
 */
import {
  HR_HIGH_THRESHOLD,
  HR_LOW_THRESHOLD,
  filterHeartRateSpike,
  getHrStatus,
} from '../../utils/heartRate';

describe('heartRate utils', () => {
  describe('constants', () => {
    it('should define high threshold at 100', () => {
      expect(HR_HIGH_THRESHOLD).toBe(100);
    });

    it('should define low threshold at 60', () => {
      expect(HR_LOW_THRESHOLD).toBe(60);
    });
  });

  describe('getHrStatus', () => {
    it('should return "สูงกว่าปกติ" for BPM > 100', () => {
      const status = getHrStatus(101);
      expect(status.label).toBe('สูงกว่าปกติ');
      expect(status.color).toBe('#EF4444');
      expect(status.bg).toBe('#FEF2F2');
    });

    it('should return "ต่ำกว่าปกติ" for BPM < 60', () => {
      const status = getHrStatus(59);
      expect(status.label).toBe('ต่ำกว่าปกติ');
      expect(status.color).toBe('#3B82F6');
      expect(status.bg).toBe('#EFF6FF');
    });

    it('should return "ปกติ" for BPM between 60 and 100 (inclusive)', () => {
      const status60 = getHrStatus(60);
      expect(status60.label).toBe('ปกติ');
      expect(status60.color).toBe('#065F46');
      expect(status60.bg).toBe('#D1FAE5');

      const status80 = getHrStatus(80);
      expect(status80.label).toBe('ปกติ');

      const status100 = getHrStatus(100);
      expect(status100.label).toBe('ปกติ');
    });
  });

  describe('filterHeartRateSpike', () => {
    it('accepts the first reading when there is no current value', () => {
      expect(filterHeartRateSpike(null, null, 140)).toEqual({ accept: true, pending: null });
    });

    it('accepts small changes', () => {
      expect(filterHeartRateSpike(78, null, 120)).toEqual({ accept: true, pending: null });
    });

    it('rejects a single jump over 50 BPM and remembers it', () => {
      expect(filterHeartRateSpike(78, null, 140)).toEqual({ accept: false, pending: 140 });
    });

    it('accepts a jump that is confirmed by the next reading', () => {
      expect(filterHeartRateSpike(78, 140, 138)).toEqual({ accept: true, pending: null });
    });

    it('keeps rejecting readings that do not agree with each other', () => {
      expect(filterHeartRateSpike(78, 140, 10)).toEqual({ accept: false, pending: 10 });
    });

    it('clears a remembered spike when readings return near the current value', () => {
      expect(filterHeartRateSpike(78, 140, 80)).toEqual({ accept: true, pending: null });
    });
  });
});
