export type AppsyncResolver<T, S = {}> = (event: AppSyncPassThroughInput<T>) => Promise<S>;

type AppSyncPassThroughInput<T extends Object> = {
  readonly arguments: T;
};
