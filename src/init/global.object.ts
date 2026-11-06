declare global {
  function objectKeys<T extends string>(obj: Record<T, any>): T[];
}

globalThis.objectKeys = function <T extends string>(obj: Record<T, any>): T[] {
  return Object.keys(obj) as T[];
};

export {};
