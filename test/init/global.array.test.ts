import '../../src/init/global.types';
import '../../src/init/global.array';

describe('split', () => {
  it('should split an array into chunks correctly', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chunks = original.split(3);
    expect(chunks).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });

  it('should handle empty arrays', () => {
    const original: unknown[] = [];
    const chunks = original.split(3);
    expect(chunks).toEqual([]);
  });

  it('should handle chunk sizes larger than the array length', () => {
    const original = [1, 2, 3];
    const chunks = original.split(5);
    expect(chunks).toEqual([[1, 2, 3]]);
  });

  it('should handle chunk sizes of 1', () => {
    const original = [1, 2, 3];
    const chunks = original.split(1);
    expect(chunks).toEqual([[1], [2], [3]]);
  });
});
