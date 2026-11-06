import 'reflect-metadata';
import { type NumberBoolean } from '@types';

export type ParamStringType = 'string' | 'email' | 'url' | 'tel' | 'mobile' | 'business_no' | 'personal_no';
export type ParamPasswordType = 'password';
export type ParamNumberType = 'integer' | 'number' | 'page' | 'limit';
export type ParamBooleanType = 'boolean' | 'number_boolean';
export type ParamDateType = 'date';
export type ParamEnumType = 'enum';
export type ParamArrayType = 'array';
export type ParamObjectType = 'object';
export type ParamObjectArrayType = 'object_array';
export type ParamEnumArrayType = 'enum_array';

export type ParamType =
  | ParamStringType
  | ParamPasswordType
  | ParamNumberType
  | ParamBooleanType
  | ParamDateType
  | ParamEnumType
  | ParamArrayType
  | ParamObjectType
  | ParamObjectArrayType
  | ParamEnumArrayType;

export type ParamArrayItemType = 'string' | 'number';

export type ParamOption<
  T extends ParamType | undefined = undefined,
  BaseType = T extends undefined ? ParamAllDataType : ParamTypeDataType<T>,
> = {
  type: T extends undefined ? ParamType : T;
  objectDataClass?: new () => any; // 데이터 타입 (type 이 object 일 경우에 사용)
  required?: boolean; // 필수 여부
  validValues?: readonly BaseType[]; // 허용 값 목록
  defaultValue?: BaseType | null; // 기본값
  nullable?: boolean; // null 가능 여부
  dash?: boolean; // type 이 tel, mobile, business_no, personal_no 일 경우, '-' 추가 여부
  allowInnerUrl?: boolean; // type 이 url 일 경우, 내부 URL 허용 여부
  noTrim?: boolean; // trim 여부
  arrayValueSeparator?: string; // type 이 array 일 경우, 구분 값 (기본: ',')
  arrayItemType?: ParamArrayItemType; // type 이 array 일 경우, 각 item 의 data type
  dateFormat?: string; // 날짜 형식
  dateType?: 'from' | 'to'; // 날짜 형식 from = 해당 일자의 시작 시간, to = 해당 일자의 마지막 시간
};

export type Params = { [key: string]: ParamOption };

export type ParamAllDataType = string | number | boolean | NumberBoolean | Date | Dict;

export type ParamTypeDataType<T> = T extends ParamStringType | ParamPasswordType
  ? string
  : T extends ParamNumberType
    ? number
    : T extends 'boolean'
      ? boolean
      : T extends 'number_boolean'
        ? NumberBoolean
        : T extends ParamDateType
          ? Date
          : T extends ParamEnumType | ParamEnumArrayType
            ? string | number
            : T extends ParamArrayType | ParamObjectType | ParamObjectArrayType
              ? any
              : never;

export type ParamOptionDataType<
  T,
  ObjectDataType = T extends { objectDataClass: new () => infer V } ? V : undefined,
  Required = T extends { required: infer V } ? (V extends true ? true : false) : false,
  ValidValue = T extends { validValues: infer V } ? (V extends Readonly<Arr> ? V[number] : never) : never,
  NullType = T extends { nullable: infer Nullable } ? (Nullable extends true ? null : never) : never,
  DefaultValue = T extends { defaultValue: infer V } ? V : undefined,
  IsDefaultValue = DefaultValue extends ParamAllDataType | ValidValue | (NullType extends null ? null : never)
    ? true
    : false,
  UndefinedType = Required extends true ? never : IsDefaultValue extends true ? never : undefined,
  Result = T extends { type: infer Type }
    ? Type extends 'object'
      ? ObjectDataType
      : Type extends 'object_array'
        ? ObjectDataType[]
        : Type extends 'array'
          ? T extends { arrayItemType: infer AType }
            ? T extends { validValues: infer VType }
              ? VType extends Readonly<Arr>
                ? VType[number][]
                : ParamTypeDataType<AType>[]
              : ParamTypeDataType<AType>[]
            : never
          : Type extends 'enum_array'
            ? T extends { validValues: infer VType }
              ? VType extends Readonly<Arr>
                ? VType[number][]
                : ParamTypeDataType<Type>[]
              : ParamTypeDataType<Type>[]
            : T extends { validValues: readonly (infer VType)[] }
              ? VType extends ParamAllDataType
                ? VType
                : ParamTypeDataType<Type>
              : ParamTypeDataType<Type>
    : never,
  FinalResult = Result | UndefinedType | NullType,
> = FinalResult;

export type Param<
  T extends Dict,
  Result = {
    [K in keyof T]: ParamOptionDataType<T[K]>;
  },
> = Result;
