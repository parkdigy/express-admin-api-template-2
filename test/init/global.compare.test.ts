import '../../src/init/global.types';
import '../../src/init/global.compare';

describe('isClass', () => {
  it('should return true if the object is a class', () => {
    class MyClass {}
    expect(globalThis.isClass(MyClass)).toBe(true);
  });

  it('should return false if the object is not a class', () => {
    expect(globalThis.isClass({})).toBe(false);
    expect(globalThis.isClass([])).toBe(false);
    expect(globalThis.isClass(null)).toBe(false);
    expect(globalThis.isClass(undefined)).toBe(false);
  });
});
