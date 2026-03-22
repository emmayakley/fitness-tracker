const { formatDate, calcEndDate, filterPrivateRoutines } = require('../utils');

//tests for formatDate
describe('formatDate', () => {
  test('format a date correctly to be YYYY-MM-DD', () => {
    const result = formatDate('2026-03-16T00:00:00.000Z');
    expect(result).toBe('2026-03-16');
  });

  test('successfully handles a Date object', () => {
    const result = formatDate(new Date('2026-03-16'));
    expect(result).toBe('2026-03-16');
  });
});

//tests for calcEndDate
describe('calcEndDate', () => {
  test('calculates end date (12 weeks) correctly', () => {
    const result = calcEndDate('2026-03-16');
    expect(result).toBe('2026-06-08');
  });
});

//test for filterPrivateRoutines
describe('filterPrivateRoutines', () => {
  test('filter out public routines', () => {
    const routines = [
      { id: 1, name: 'private 1', is_public: false },
      { id: 2, name: 'public 1', is_public: true },
      { id: 3, name: 'private 2', is_public: false },
    ];
    const result = filterPrivateRoutines(routines);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('private 1');
  });

  test('return an empty array if no private routines', () => {
    const routines = [
      { id: 1, name: 'public 1', is_public: true },
      { id: 2, name: 'public 2', is_public: true },
      { id: 3, name: 'public 3', is_public: true },
    ];
    const result = filterPrivateRoutines(routines);
    expect(result).toHaveLength(0);
  });

  test('return array with all routines if all are private', () => {
    const routines = [
      { id: 1, name: 'private 1', is_public: false },
      { id: 2, name: 'private 2', is_public: false },
      { id: 3, name: 'private 3', is_public: false },
    ];
    const result = filterPrivateRoutines(routines);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('private 1');
  });
});
