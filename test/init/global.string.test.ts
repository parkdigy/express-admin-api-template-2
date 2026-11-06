import '../../src/init/global.types';
import '../../src/init/global.string';

describe('replaceBatch', () => {
  it('should replace multiple substrings correctly', () => {
    const original = 'Hello, {name}! Today is {day}.';
    const replaced = original.replaceBatch({
      '{name}': () => 'John',
      '{day}': () => 'Monday',
    });
    expect(replaced).toBe('Hello, John! Today is Monday.');
  });

  it('should handle empty replace object', () => {
    const original = 'Hello, {name}! Today is {day}.';
    const replaced = original.replaceBatch({});
    expect(replaced).toBe(original);
  });

  it('should handle replace functions that return empty strings', () => {
    const original = 'Hello, {name}! Today is {day}.';
    const replaced = original.replaceBatch({
      '{name}': () => '',
      '{day}': () => '',
    });
    expect(replaced).toBe('Hello, ! Today is .');
  });
});
