import { type ParamOption, type Params } from './param.types';

/********************************************************************************************************************
 * ParamsSetRequired
 * ******************************************************************************************************************/
type ParamsSetRequired<T extends Params> = {
  [K in keyof T]: { [K2 in keyof T[K]]: K2 extends 'required' ? true : T[K][K2] };
};

/********************************************************************************************************************
 * ParamsSetPartial
 * ******************************************************************************************************************/
type ParamsSetPartial<T extends Params> = {
  [K in keyof T]: { [K2 in keyof T[K]]: K2 extends 'required' ? false : T[K][K2] };
};

/********************************************************************************************************************
 * PartialParam
 * ******************************************************************************************************************/
export const PartialParam = <T extends Params, Result = ParamsSetPartial<T>>(params: T): Result => {
  return Object.keys(params).reduce<Params>((res, key) => {
    res[key] = { ...params[key], required: false };
    return res;
  }, {}) as Result;
};

/********************************************************************************************************************
 * RequiredParam
 * ******************************************************************************************************************/
export const RequiredParam = <T extends Params, Result = ParamsSetRequired<T>>(params: T): Result => {
  return Object.keys(params).reduce<Params>((res, key) => {
    res[key] = { ...params[key], required: true };
    return res;
  }, {}) as Result;
};

/********************************************************************************************************************
 * PickParam
 * ******************************************************************************************************************/
export const PickParam = <T extends Params, Keys extends (keyof T)[], Result = Pick<T, Keys[number]>>(
  params: T,
  ...keys: Keys
): Result => {
  return keys
    .filter((key) => key in params)
    .reduce<Record<string, ParamOption>>((res, key) => {
      res[key as string] = params[key];
      return res;
    }, {}) as Result;
};

/********************************************************************************************************************
 * PartialPickParam
 * ******************************************************************************************************************/
export const PartialPickParam = <
  T extends Params,
  Keys extends (keyof T)[],
  Result = ParamsSetPartial<Pick<T, Keys[number]>>,
>(
  params: T,
  ...keys: Keys
): Result => {
  return keys
    .filter((key) => key in params)
    .reduce<Record<string, ParamOption>>((res, key) => {
      res[key as string] = { ...params[key], required: false };
      return res;
    }, {}) as Result;
};

/********************************************************************************************************************
 * RequiredPickParam
 * ******************************************************************************************************************/
export const RequiredPickParam = <
  T extends Params,
  Keys extends (keyof T)[],
  Result = ParamsSetRequired<Pick<T, Keys[number]>>,
>(
  params: T,
  ...keys: Keys
): Result => {
  return keys
    .filter((key) => key in params)
    .reduce<Record<string, ParamOption>>((res, key) => {
      res[key as string] = { ...params[key], required: true };
      return res;
    }, {}) as Result;
};

/********************************************************************************************************************
 * OmitParam
 * ******************************************************************************************************************/
export const OmitParam = <T extends Params, Keys extends (keyof T)[], Result = Omit<T, Keys[number]>>(
  params: T,
  ...keys: Keys
): Result => {
  const newParams = { ...params };
  keys.forEach((key) => {
    delete newParams[key];
  });
  return newParams as unknown as Result;
};

/********************************************************************************************************************
 * PartialOmitParam
 * ******************************************************************************************************************/
export const PartialOmitParam = <
  T extends Params,
  Keys extends (keyof T)[],
  Result = ParamsSetPartial<Omit<T, Keys[number]>>,
>(
  params: T,
  ...keys: Keys
): Result => {
  const newParams = Object.keys(params).reduce<Params>((res, key) => {
    res[key] = { ...params[key], required: false };
    return res;
  }, {});

  keys.forEach((key) => {
    delete newParams[key as string];
  });
  return newParams as unknown as Result;
};

/********************************************************************************************************************
 * RequiredOmitParam
 * ******************************************************************************************************************/
export const RequiredOmitParam = <
  T extends Params,
  Keys extends (keyof T)[],
  Result = ParamsSetRequired<Omit<T, Keys[number]>>,
>(
  params: T,
  ...keys: Keys
): Result => {
  const newParams = Object.keys(params).reduce<Params>((res, key) => {
    res[key] = { ...params[key], required: true };
    return res;
  }, {});

  keys.forEach((key) => {
    delete newParams[key as string];
  });
  return newParams as unknown as Result;
};
