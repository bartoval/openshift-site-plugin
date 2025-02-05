import { describe, it, expect } from 'vitest';

import { formatOCPDate } from '../src/console/core/utils/formatOCPDate';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';

describe('formatOCPDate', () => {
  it('formats date correctly', () => {
    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe('5 feb 2024, 15:30');
  });

  it('pads minutes with leading zero when needed', () => {
    const testDate = '2024-02-05T14:05:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe('5 feb 2024, 15:05');
  });

  it('handles empty date input', () => {
    const testDate = '' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe(' ');
  });

  it('handles undefined date input', () => {
    const testDate = undefined as unknown as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe(' ');
  });

  it('formats date at the end of year', () => {
    const testDate = '2024-12-31T23:59:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe('1 gen 2025, 0:59');
  });

  it('formats date at the beginning of year', () => {
    const testDate = '2024-01-01T00:01:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe('1 gen 2024, 1:01');
  });
});
