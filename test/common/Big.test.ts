import '../../src/init/global.types';
import Big from '../../src/common/Big';

describe('Big', () => {
  let big: Big;

  beforeEach(() => {
    big = new Big('10');
  });

  it('should initialize with the correct value', () => {
    expect(big.getValue()).toBe('10');
  });

  it('should add a number to the value', () => {
    big.add(5);
    expect(big.getValue()).toBe('15');
  });

  it('should subtract a number from the value', () => {
    big.subtract(5);
    expect(big.getValue()).toBe('5');
  });

  it('should divide the value by a number', () => {
    big.divide(2);
    expect(big.getValue()).toBe('5');
  });

  it('should multiply the value by a number', () => {
    big.multiply(2);
    expect(big.getValue()).toBe('20');
  });

  it('should round the value to the specified precision', () => {
    big = new Big('3.14159');
    big.round(2);
    expect(big.getValue()).toBe('3.14');
  });

  it('should ceil the value to the specified precision', () => {
    big = new Big('3.14159');
    big.ceil(2);
    expect(big.getValue()).toBe('3.15');
  });

  it('should floor the value to the specified precision', () => {
    big = new Big('3.14159');
    big.floor(2);
    expect(big.getValue()).toBe('3.14');
  });

  it('should correctly format numbers', () => {
    const big = new Big('123456.7890');
    expect(big.getPretty()).toBe('123,456.789');

    const big2 = new Big('0123456.000');
    expect(big2.getPretty()).toBe('123,456');

    const big3 = new Big('0.000123456');
    expect(big3.getPretty()).toBe('0.000123456');

    const big4 = new Big('0.000000');
    expect(big4.getPretty()).toBe('0');
  });

  it('should negate the value', () => {
    big.negate();
    expect(big.getValue()).toBe('-10');
  });

  it('should compare the value with another number', () => {
    expect(big.compare(5)).toBe(1);
    expect(big.compare(10)).toBe(0);
    expect(big.compare(15)).toBe(-1);
  });

  it('should check if the value is equal to another number', () => {
    expect(big.isEqual(5)).toBe(false);
    expect(big.isEqual(10)).toBe(true);
    expect(big.isEqual(15)).toBe(false);
  });

  it('should check if the value is bigger than another number', () => {
    expect(big.isBigger(5)).toBe(true);
    expect(big.isBigger(10)).toBe(false);
    expect(big.isBigger(15)).toBe(false);
  });

  it('should check if the value is smaller than another number', () => {
    expect(big.isSmaller(5)).toBe(false);
    expect(big.isSmaller(10)).toBe(false);
    expect(big.isSmaller(15)).toBe(true);
  });

  it('should check if the value is equal to or bigger than another number', () => {
    expect(big.isEqualOrBigger(5)).toBe(true);
    expect(big.isEqualOrBigger(10)).toBe(true);
    expect(big.isEqualOrBigger(15)).toBe(false);
  });

  it('should check if the value is equal to or smaller than another number', () => {
    expect(big.isEqualOrSmaller(5)).toBe(false);
    expect(big.isEqualOrSmaller(10)).toBe(true);
    expect(big.isEqualOrSmaller(15)).toBe(true);
  });
});
