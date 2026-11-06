import { type ParamArrayItemType, type ParamOption, type ParamType, type ParamTypeDataType } from './param.types';

type LocalParamOption<T extends ParamType, DataType = ParamTypeDataType<T>> = Omit<ParamOption<T, DataType>, 'type'>;
type LocalRequiredParamOption<T extends ParamType, DataType = ParamTypeDataType<T>> = Omit<
  ParamOption<T, DataType>,
  'type' | 'required'
>;

/********************************************************************************************************************
 * makeParam
 * ******************************************************************************************************************/
function MakeParam<
  Type extends ParamType,
  const DataType = ParamTypeDataType<Type>,
  const Option extends LocalParamOption<Type, DataType> = {},
  const Option2 extends LocalParamOption<Type, DataType> = {},
  Result = Readonly<ObjectMerge<{ type: Type } & Option & Option2>>,
>(type: Type, option?: Option, option2?: Option2): Result {
  return { type, ...option, ...option2 } as const as Result;
}

/********************************************************************************************************************
 * Page, Limit
 * ******************************************************************************************************************/
export const Param_Page = () => ({ page: MakeParam('page', { defaultValue: 1 }) });
export const Param_Limit = (defaultValue = 20) => ({ limit: MakeParam('limit', { defaultValue }) });
export const Param_Page_Limit = (limitDefaultValue = 20) => ({
  ...Param_Page(),
  ...Param_Limit(limitDefaultValue),
});

/********************************************************************************************************************
 * ID
 * ******************************************************************************************************************/
export const Param_Id_Integer = () => ({ id: MakeParam('integer') });
export const Param_Id_Integer_Required = () => ({ id: MakeParam('integer', { required: true }) });
export const Param_Id_String = () => ({ id: MakeParam('string') });
export const Param_Id_String_Required = () => ({ id: MakeParam('string', { required: true }) });

/********************************************************************************************************************
 * String
 * ******************************************************************************************************************/
export const Param_String = <const Option extends LocalParamOption<'string'> = {}>(option?: Option) =>
  MakeParam('string', option);
export const Param_String_Nullable = <const Option extends LocalRequiredParamOption<'string'> = {}>(option?: Option) =>
  MakeParam('string', option, { nullable: true });
export const Param_String_Required = <const Option extends LocalRequiredParamOption<'string'> = {}>(option?: Option) =>
  MakeParam('string', option, { required: true });
export const Param_String_Nullable_Required = <const Option extends LocalRequiredParamOption<'string'> = {}>(
  option?: Option
) => MakeParam('string', option, { nullable: true, required: true });

/********************************************************************************************************************
 * 이메일
 * ******************************************************************************************************************/
export const Param_Email = <const Option extends LocalParamOption<'email'> = {}>(option?: Option) =>
  MakeParam('email', option);
export const Param_Email_Nullable = <const Option extends LocalRequiredParamOption<'email'> = {}>(option?: Option) =>
  MakeParam('email', option, { nullable: true });
export const Param_Email_Required = <const Option extends LocalRequiredParamOption<'email'> = {}>(option?: Option) =>
  MakeParam('email', option, { required: true });
export const Param_Email_Nullable_Required = <const Option extends LocalRequiredParamOption<'email'> = {}>(
  option?: Option
) => MakeParam('email', option, { nullable: true, required: true });

/********************************************************************************************************************
 * URL
 * ******************************************************************************************************************/
export const Param_Url = <const Option extends LocalParamOption<'url'> = {}>(option?: Option) =>
  MakeParam('url', option);
export const Param_Url_Nullable = <const Option extends LocalRequiredParamOption<'url'> = {}>(option?: Option) =>
  MakeParam('url', option, { nullable: true });
export const Param_Url_Required = <const Option extends LocalRequiredParamOption<'url'> = {}>(option?: Option) =>
  MakeParam('url', option, { required: true });
export const Param_Url_Nullable_Required = <const Option extends LocalRequiredParamOption<'url'> = {}>(
  option?: Option
) => MakeParam('url', option, { nullable: true, required: true });

/********************************************************************************************************************
 * 전화번호
 * ******************************************************************************************************************/
export const Param_Tel = <const Option extends LocalParamOption<'tel'> = {}>(option?: Option) =>
  MakeParam('tel', option);
export const Param_Tel_Nullable = <const Option extends LocalRequiredParamOption<'tel'> = {}>(option?: Option) =>
  MakeParam('tel', option, { nullable: true });
export const Param_Tel_Required = <const Option extends LocalRequiredParamOption<'tel'> = {}>(option?: Option) =>
  MakeParam('tel', option, { required: true });
export const Param_Tel_Nullable_Required = <const Option extends LocalRequiredParamOption<'tel'> = {}>(
  option?: Option
) => MakeParam('tel', option, { nullable: true, required: true });

/********************************************************************************************************************
 * 휴대폰번호
 * ******************************************************************************************************************/
export const Param_Mobile = <const Option extends LocalParamOption<'mobile'> = {}>(option?: Option) =>
  MakeParam('mobile', option);
export const Param_Mobile_Nullable = <const Option extends LocalRequiredParamOption<'mobile'> = {}>(option?: Option) =>
  MakeParam('mobile', option, { nullable: true });
export const Param_Mobile_Required = <const Option extends LocalRequiredParamOption<'mobile'> = {}>(option?: Option) =>
  MakeParam('mobile', option, { required: true });
export const Param_Mobile_Nullable_Required = <const Option extends LocalRequiredParamOption<'mobile'> = {}>(
  option?: Option
) => MakeParam('mobile', option, { nullable: true, required: true });

/********************************************************************************************************************
 * 사업자등록번호
 * ******************************************************************************************************************/
export const Param_BusinessNo = <const Option extends LocalParamOption<'business_no'> = {}>(option?: Option) =>
  MakeParam('business_no', option);
export const Param_BusinessNo_Nullable = <const Option extends LocalRequiredParamOption<'business_no'> = {}>(
  option?: Option
) => MakeParam('business_no', option, { nullable: true });
export const Param_BusinessNo_Required = <const Option extends LocalRequiredParamOption<'business_no'> = {}>(
  option?: Option
) => MakeParam('business_no', option, { required: true });
export const Param_BusinessNo_Nullable_Required = <const Option extends LocalRequiredParamOption<'business_no'> = {}>(
  option?: Option
) => MakeParam('business_no', option, { nullable: true, required: true });

/********************************************************************************************************************
 * 주민등록번호
 * ******************************************************************************************************************/
export const Param_PersonalNo = <const Option extends LocalParamOption<'personal_no'> = {}>(option?: Option) =>
  MakeParam('personal_no', option);
export const Param_PersonalNo_Nullable = <const Option extends LocalRequiredParamOption<'personal_no'> = {}>(
  option?: Option
) => MakeParam('personal_no', option, { nullable: true });
export const Param_PersonalNo_Required = <const Option extends LocalRequiredParamOption<'personal_no'> = {}>(
  option?: Option
) => MakeParam('personal_no', option, { required: true });
export const Param_PersonalNo_Nullable_Required = <const Option extends LocalRequiredParamOption<'personal_no'> = {}>(
  option?: Option
) => MakeParam('personal_no', option, { nullable: true, required: true });

/********************************************************************************************************************
 * 비밀번호
 * ******************************************************************************************************************/
export const Param_Password = <const Option extends LocalParamOption<'password'> = {}>(option?: Option) =>
  MakeParam('password', option);
export const Param_Password_Nullable = <const Option extends LocalRequiredParamOption<'password'> = {}>(
  option?: Option
) => MakeParam('password', option, { nullable: true });
export const Param_Password_Required = <const Option extends LocalRequiredParamOption<'password'> = {}>(
  option?: Option
) => MakeParam('password', option, { required: true });
export const Param_Password_Nullable_Required = <const Option extends LocalRequiredParamOption<'password'> = {}>(
  option?: Option
) => MakeParam('password', option, { nullable: true, required: true });

/********************************************************************************************************************
 * Integer
 * ******************************************************************************************************************/
export const Param_Integer = <const Option extends LocalParamOption<'integer'> = {}>(option?: Option) =>
  MakeParam('integer', option);
export const Param_Integer_Nullable = <const Option extends LocalRequiredParamOption<'integer'> = {}>(
  option?: Option
) => MakeParam('integer', option, { nullable: true });
export const Param_Integer_Required = <const Option extends LocalRequiredParamOption<'integer'> = {}>(
  option?: Option
) => MakeParam('integer', option, { required: true });
export const Param_Integer_Nullable_Required = <const Option extends LocalRequiredParamOption<'integer'> = {}>(
  option?: Option
) => MakeParam('integer', option, { nullable: true, required: true });

/********************************************************************************************************************
 * Number
 * ******************************************************************************************************************/
export const Param_Number = <const Option extends LocalParamOption<'number'> = {}>(option?: Option) =>
  MakeParam('number', option);
export const Param_Number_Required = <const Option extends LocalRequiredParamOption<'number'> = {}>(option?: Option) =>
  MakeParam('number', option, { required: true });

/********************************************************************************************************************
 * Boolean
 * ******************************************************************************************************************/
export const Param_Boolean = <const Option extends LocalParamOption<'boolean'> = {}>(option?: Option) =>
  MakeParam('boolean', option);
export const Param_Boolean_Nullable = <const Option extends LocalRequiredParamOption<'boolean'> = {}>(
  option?: Option
) => MakeParam('boolean', option, { nullable: true });
export const Param_Boolean_Required = <const Option extends LocalRequiredParamOption<'boolean'> = {}>(
  option?: Option
) => MakeParam('boolean', option, { required: true });
export const Param_Boolean_Nullable_Required = <const Option extends LocalRequiredParamOption<'boolean'> = {}>(
  option?: Option
) => MakeParam('boolean', option, { nullable: true, required: true });

/********************************************************************************************************************
 * Number Boolean
 * ******************************************************************************************************************/
export const Param_NumberBoolean = <const Option extends LocalParamOption<'number_boolean'> = {}>(option?: Option) =>
  MakeParam('number_boolean', option);
export const Param_NumberBoolean_Nullable = <const Option extends LocalRequiredParamOption<'number_boolean'> = {}>(
  option?: Option
) => MakeParam('number_boolean', option, { nullable: true });
export const Param_NumberBoolean_Required = <const Option extends LocalRequiredParamOption<'number_boolean'> = {}>(
  option?: Option
) => MakeParam('number_boolean', option, { required: true });
export const Param_NumberBoolean_Nullable_Required = <
  const Option extends LocalRequiredParamOption<'number_boolean'> = {},
>(
  option?: Option
) => MakeParam('number_boolean', option, { nullable: true, required: true });

/********************************************************************************************************************
 * Date
 * ******************************************************************************************************************/
export const Param_Date = <const Option extends LocalParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option);
export const Param_Date_Nullable = <const Option extends LocalRequiredParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { nullable: true });
export const Param_Date_Required = <const Option extends LocalRequiredParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { required: true });
export const Param_Date_Nullable_Required = <const Option extends LocalRequiredParamOption<'date'> = {}>(
  option?: Option
) => MakeParam('date', option, { nullable: true, required: true });

/********************************************************************************************************************
 * Date From
 * ******************************************************************************************************************/
export const Param_DateFrom = <const Option extends LocalParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { dateType: 'from' });
export const Param_DateFrom_Nullable = <const Option extends LocalRequiredParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { dateType: 'from', nullable: true });
export const Param_DateFrom_Required = <const Option extends LocalRequiredParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { dateType: 'from', required: true });
export const Param_DateFrom_Nullable_Required = <const Option extends LocalRequiredParamOption<'date'> = {}>(
  option?: Option
) => MakeParam('date', option, { dateType: 'from', nullable: true, required: true });

/********************************************************************************************************************
 * Date To
 * ******************************************************************************************************************/
export const Param_DateTo = <const Option extends LocalParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { dateType: 'to' });
export const Param_DateTo_Nullable = <const Option extends LocalRequiredParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { dateType: 'to', nullable: true });
export const Param_DateTo_Required = <const Option extends LocalRequiredParamOption<'date'> = {}>(option?: Option) =>
  MakeParam('date', option, { dateType: 'to', required: true });
export const Param_DateTo_Nullable_Required = <const Option extends LocalRequiredParamOption<'date'> = {}>(
  option?: Option
) => MakeParam('date', option, { dateType: 'to', nullable: true, required: true });

/********************************************************************************************************************
 * Enum
 * ******************************************************************************************************************/
export const Param_Enum = <
  ValidValueType extends string | number,
  const Option extends LocalParamOption<'enum', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum', option, { validValues });
export const Param_Enum_Nullable = <
  ValidValueType extends string | number,
  const Option extends LocalRequiredParamOption<'enum', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum', option, { validValues, nullable: true });
export const Param_Enum_Required = <
  ValidValueType extends string | number,
  const Option extends LocalRequiredParamOption<'enum', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum', option, { validValues, required: true });
export const Param_Enum_Nullable_Required = <
  ValidValueType extends string | number,
  const Option extends LocalRequiredParamOption<'enum', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum', option, { validValues, nullable: true, required: true });

/********************************************************************************************************************
 * Array
 * ******************************************************************************************************************/
export const Param_Array = <
  ArrayItemType extends ParamArrayItemType,
  ArrayItemDataType = ParamTypeDataType<ArrayItemType>,
  const Option extends LocalParamOption<'array', ArrayItemDataType> = {},
>(
  arrayItemType: ArrayItemType,
  option?: Option
) => MakeParam('array', option, { arrayItemType });
export const Param_Array_Nullable = <
  ArrayItemType extends ParamArrayItemType,
  ArrayItemDataType = ParamTypeDataType<ArrayItemType>,
  const Option extends LocalRequiredParamOption<'array', ArrayItemDataType> = {},
>(
  arrayItemType: ArrayItemType,
  option?: Option
) => MakeParam('array', option, { arrayItemType, nullable: true });
export const Param_Array_Required = <
  ArrayItemType extends ParamArrayItemType,
  ArrayItemDataType = ParamTypeDataType<ArrayItemType>,
  const Option extends LocalRequiredParamOption<'array', ArrayItemDataType> = {},
>(
  arrayItemType: ArrayItemType,
  option?: Option
) => MakeParam('array', option, { arrayItemType, required: true });
export const Param_Array_Nullable_Required = <
  ArrayItemType extends ParamArrayItemType,
  ArrayItemDataType = ParamTypeDataType<ArrayItemType>,
  const Option extends LocalRequiredParamOption<'array', ArrayItemDataType> = {},
>(
  arrayItemType: ArrayItemType,
  option?: Option
) => MakeParam('array', option, { arrayItemType, nullable: true, required: true });

/********************************************************************************************************************
 * Object
 * ******************************************************************************************************************/
export const Param_Object = <T, const Option extends LocalParamOption<'object', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object', option, { objectDataClass });
export const Param_Object_Nullable = <T, const Option extends LocalRequiredParamOption<'object', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object', option, { objectDataClass, nullable: true });
export const Param_Object_Required = <T, const Option extends LocalRequiredParamOption<'object', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object', option, { objectDataClass, required: true });
export const Param_Object_Nullable_Required = <T, const Option extends LocalRequiredParamOption<'object', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object', option, { objectDataClass, nullable: true, required: true });

/********************************************************************************************************************
 * Object Array
 * ******************************************************************************************************************/
export const Param_ObjectArray = <T, const Option extends LocalParamOption<'object_array', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object_array', option, { objectDataClass });
export const Param_ObjectArray_Nullable = <T, const Option extends LocalRequiredParamOption<'object_array', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object_array', option, { objectDataClass, nullable: true });
export const Param_ObjectArray_Required = <T, const Option extends LocalRequiredParamOption<'object_array', T> = {}>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object_array', option, { objectDataClass, required: true });
export const Param_ObjectArray_Nullable_Required = <
  T,
  const Option extends LocalRequiredParamOption<'object_array', T> = {},
>(
  objectDataClass: new () => T,
  option?: Option
) => MakeParam('object_array', option, { objectDataClass, nullable: true, required: true });

/********************************************************************************************************************
 * Enum Array
 * ******************************************************************************************************************/
export const Param_EnumArray = <
  ValidValueType extends string | number,
  const Option extends LocalParamOption<'enum_array', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum_array', option, { validValues });
export const Param_EnumArray_Nullable = <
  ValidValueType extends string | number,
  const Option extends LocalRequiredParamOption<'enum_array', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum_array', option, { validValues, nullable: true });
export const Param_EnumArray_Required = <
  ValidValueType extends string | number,
  const Option extends LocalRequiredParamOption<'enum_array', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum_array', option, { validValues, required: true });
export const Param_EnumArray_Nullable_Required = <
  ValidValueType extends string | number,
  const Option extends LocalRequiredParamOption<'enum_array', ValidValueType> = {},
>(
  validValues: readonly ValidValueType[],
  option?: Option
) => MakeParam('enum_array', option, { validValues, nullable: true, required: true });
