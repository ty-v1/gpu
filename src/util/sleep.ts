export const sleep = (t: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), t);
  });
}
