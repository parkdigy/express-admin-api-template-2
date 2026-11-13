export const fakeTrans = async (callback: () => Promise<unknown>) => {
  await callback();
};
