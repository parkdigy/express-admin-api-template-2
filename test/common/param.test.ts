import '../../src/init/global.types';
import '../../src/init/global.pdg';
import '../../src/init/global.string';
import '../../src/init/global.error';
import param from '../../src/common/param';
import {
  Param_Array,
  Param_Array_Required,
  Param_Boolean,
  Param_BusinessNo,
  Param_Date,
  Param_Email,
  Param_Enum,
  Param_Integer,
  Param_Mobile,
  Param_Number,
  Param_Object_Required,
  Param_Password,
  Param_PersonalNo,
  Param_String,
  Param_String_Required,
  Param_Tel,
} from '../../src/common/param/param.preset';

describe('param', () => {
  it('required 파라메터', () => {
    expect(() => param({ params: {} as Dict } as MyRequest, { string: Param_String_Required() })).toThrow(
      "'string' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() =>
      param({ params: { array: '' } as Dict } as MyRequest, { array: Param_Array_Required('string') })
    ).toThrow("'array' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { array: [] } as Dict } as MyRequest, { array: Param_Array_Required('string') })
    ).toThrow("'array' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { object: '' } as Dict } as MyRequest, { object: Param_Object_Required(class {}) })
    ).toThrow("'object' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { object: {} } as Dict } as MyRequest, { object: Param_Object_Required(class {}) })
    ).toThrow("'object' 파라메터 정보가 유효하지 않습니다.");
  });

  it('invalid 파라메터', () => {
    expect(() => param({ params: { integer: 1.23 } as Dict } as MyRequest, { integer: Param_Integer() })).toThrow(
      "'integer' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { integer: '1.23' } as Dict } as MyRequest, { integer: Param_Integer() })).toThrow(
      "'integer' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { email: 'test' } as Dict } as MyRequest, { email: Param_Email() })).toThrow(
      "'email' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { email: 'test@' } as Dict } as MyRequest, { email: Param_Email() })).toThrow(
      "'email' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { email: 'test@test' } as Dict } as MyRequest, { email: Param_Email() })).toThrow(
      "'email' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { tel: '02123456' } as Dict } as MyRequest, { tel: Param_Tel() })).toThrow(
      "'tel' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { mobile: '021234567' } as Dict } as MyRequest, { mobile: Param_Mobile() })).toThrow(
      "'mobile' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() => param({ params: { mobile: '010123456' } as Dict } as MyRequest, { mobile: Param_Mobile() })).toThrow(
      "'mobile' 파라메터 정보가 유효하지 않습니다."
    );
    expect(() =>
      param({ params: { business_no: '012345678' } as Dict } as MyRequest, { business_no: Param_BusinessNo() })
    ).toThrow("'business_no' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { business_no: '012-34-5678' } as Dict } as MyRequest, { business_no: Param_BusinessNo() })
    ).toThrow("'business_no' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { business_no: '012-345678-9' } as Dict } as MyRequest, { business_no: Param_BusinessNo() })
    ).toThrow("'business_no' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { personal_no: '012345678901' } as Dict } as MyRequest, { personal_no: Param_PersonalNo() })
    ).toThrow("'personal_no' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { personal_no: '012345-678901' } as Dict } as MyRequest, { personal_no: Param_PersonalNo() })
    ).toThrow("'personal_no' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { array: ['a', 'd'] } as Dict } as MyRequest, {
        array: Param_Array('string', { validValues: ['a', 'b', 'c'] }),
      })
    ).toThrow("'array' 파라메터 정보가 유효하지 않습니다.");
    expect(() =>
      param({ params: { array: [1, 2, 4] } as Dict } as MyRequest, {
        array: Param_Array('number', { validValues: [1, 2, 3] }),
      })
    ).toThrow("'array' 파라메터 정보가 유효하지 않습니다.");
  });

  it('파라메터', () => {
    const result = param(
      {
        params: {
          string: 'string',
          string_space: ' string ',
          string_empty: '',
          email: 'test@test.com',
          email_empty: '',
          password: 'password',
          password_space: ' password ',
          password_empty: '',
          tel: '022345678',
          tel_dash: '02-234-5678',
          tel_to_dash: '022345678',
          tel_dash_to_dash: '02-234-5678',
          mobile: '01012345678',
          mobile_dash: '010-1234-5678',
          mobile_to_dash: '01012345678',
          mobile_dash_to_dash: '010-1234-5678',
          business_no: '0123456789',
          business_no_dash: '012-34-56789',
          business_no_to_dash: '0123456789',
          business_no_dash_to_dash: '012-34-56789',
          personal_no: '0123456789012',
          personal_no_dash: '012345-6789012',
          personal_no_to_dash: '0123456789012',
          personal_no_dash_to_dash: '012345-6789012',
          number: 1.23,
          number_string: '1.23',
          number_empty: '',
          integer: 1,
          integer_string: '1',
          integer_empty: '',
          boolean_true: true,
          boolean_false: false,
          boolean_1: 1,
          boolean_0: 0,
          boolean_10: 10,
          boolean_minus_10: -10,
          boolean_empty: '',
          date: '2024-01-01 12:34:56',
          enum: 'E1',
          array_number: [1, 2, 3],
          array_number_string: [1, '2', 3],
          array_string: ['a', 'b', 'c', '1', '2', '3'],
          array_string_number: ['a', 'b', 'c', 1, 2, 3],
        } as Dict,
      } as MyRequest,
      {
        string: Param_String(),
        string_space: Param_String(),
        string_empty: Param_String(),
        email: Param_Email(),
        email_empty: Param_Email(),
        password: Param_Password(),
        password_space: Param_Password(),
        password_empty: Param_Password(),
        tel: Param_Tel(),
        tel_dash: Param_Tel(),
        tel_to_dash: Param_Tel({ dash: true }),
        tel_dash_to_dash: Param_Tel({ dash: true }),
        mobile: Param_Mobile(),
        mobile_dash: Param_Mobile(),
        mobile_to_dash: Param_Mobile({ dash: true }),
        mobile_dash_to_dash: Param_Mobile({ dash: true }),
        business_no: Param_BusinessNo(),
        business_no_dash: Param_BusinessNo(),
        business_no_to_dash: Param_BusinessNo({ dash: true }),
        business_no_dash_to_dash: Param_BusinessNo({ dash: true }),
        personal_no: Param_PersonalNo(),
        personal_no_dash: Param_PersonalNo(),
        personal_no_to_dash: Param_PersonalNo({ dash: true }),
        personal_no_dash_to_dash: Param_PersonalNo({ dash: true }),
        number: Param_Number(),
        number_string: Param_Number(),
        number_empty: Param_Number(),
        integer: Param_Integer(),
        integer_string: Param_Integer(),
        integer_empty: Param_Integer(),
        boolean_true: Param_Boolean(),
        boolean_false: Param_Boolean(),
        boolean_1: Param_Boolean(),
        boolean_10: Param_Boolean(),
        boolean_minus_10: Param_Boolean(),
        boolean_0: Param_Boolean(),
        boolean_empty: Param_Boolean(),
        date: Param_Date(),
        enum: Param_Enum(['E1', 'E2']),
        array_number: Param_Array('number'),
        array_number_string: Param_Array('number'),
        array_string: Param_Array('string'),
        array_string_number: Param_Array('string'),
      }
    );

    expect(result).toEqual({
      string: 'string',
      string_space: 'string',
      string_empty: undefined,
      email: 'test@test.com',
      email_empty: undefined,
      password: 'password',
      password_space: ' password ',
      password_empty: undefined,
      tel: '022345678',
      tel_dash: '022345678',
      tel_to_dash: '02-234-5678',
      tel_dash_to_dash: '02-234-5678',
      mobile: '01012345678',
      mobile_dash: '01012345678',
      mobile_to_dash: '010-1234-5678',
      mobile_dash_to_dash: '010-1234-5678',
      business_no: '0123456789',
      business_no_dash: '0123456789',
      business_no_to_dash: '012-34-56789',
      business_no_dash_to_dash: '012-34-56789',
      personal_no: '0123456789012',
      personal_no_dash: '0123456789012',
      personal_no_to_dash: '012345-6789012',
      personal_no_dash_to_dash: '012345-6789012',
      number: 1.23,
      number_string: 1.23,
      number_empty: undefined,
      integer: 1,
      integer_string: 1,
      integer_empty: undefined,
      boolean_true: true,
      boolean_false: false,
      boolean_1: true,
      boolean_0: false,
      boolean_10: true,
      boolean_minus_10: true,
      boolean_empty: undefined,
      date: new Date('2024-01-01 12:34:56'),
      enum: 'E1',
      array_number: [1, 2, 3],
      array_number_string: [1, 2, 3],
      array_string: ['a', 'b', 'c', '1', '2', '3'],
      array_string_number: ['a', 'b', 'c', '1', '2', '3'],
    });
  });
});
