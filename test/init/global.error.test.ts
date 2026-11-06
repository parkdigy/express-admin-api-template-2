import '../../src/init/global.types';
import '../../src/init/global.pdg';
import '../../src/init/global.error';

describe('paramError', () => {
  it('should return an error message without parameter name', () => {
    const error = globalThis.paramError();
    expect(error.getMsg()).toBe('파라메터 정보가 유효하지 않습니다.');
  });

  it('should return an error message with parameter name', () => {
    const name = 'example';
    const error = globalThis.paramError(name);
    expect(error.getMsg()).toBe(`'${name}' 파라메터 정보가 유효하지 않습니다.`);
  });
});
