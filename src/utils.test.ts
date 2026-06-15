import { expect, test, describe } from 'vitest';

import { dateRange } from './utils';

describe('dateRange', () => {
  test('when range more than step', () => {
    const startDate = new Date('2024.1.1');
    const endDate = new Date('2024.5.15');

    const result = dateRange(startDate, endDate, 30);

    expect(result).toEqual([
      { from: '1704060000', to: '1706652000' },
      { from: '1706652000', to: '1709244000' },
      { from: '1709244000', to: '1711836000' },
      { from: '1711836000', to: '1714424400' },
      { from: '1714424400', to: '1715720400' },
    ]);
  });

  test('when range less then step', () => {
    const startDate = new Date('2024.1.1');
    const endDate = new Date('2024.1.15');

    const result = dateRange(startDate, endDate, 30);

    expect(result).toEqual([{ from: '1704060000', to: '1705269600' }]);
  });
});
