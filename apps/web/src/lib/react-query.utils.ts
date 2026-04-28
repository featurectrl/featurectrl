import {
  type MutationKey,
  type MutationObserverOptions,
  type QueryKey,
  queryOptions,
  type UnusedSkipTokenOptions,
} from "@tanstack/react-query";

type MethodQueryObserverOptions<TData, TError> = Omit<
  UnusedSkipTokenOptions<TData, TError>,
  "queryKey" | "queryFn"
>;

type MethodQueryOptions<TData = unknown, TError = unknown, TInput = void> = (
  args: TInput,
  options?: MethodQueryObserverOptions<TData, TError>,
) => UnusedSkipTokenOptions<TData, TError>;

export interface QueryMethod<TData = unknown, TError = unknown, TInput = void> {
  queryKey: (args: TInput) => QueryKey;
  queryOptions: MethodQueryOptions<TData, TError, TInput>;
}

export type MethodMutationOptions<TData = unknown, TError = unknown, TInput = void> = (
  options?: Omit<MutationObserverOptions<TData, TError, TInput>, "mutationFn">,
) => MutationObserverOptions<TData, TError, TInput>;

export interface MutationMethod<TData = unknown, TError = unknown, TInput = void> {
  mutationKey: () => MutationKey;
  mutationOptions: MethodMutationOptions<TData, TError, TInput>;
}

type MethodResult<TData, TError> = Promise<{
  data: TData;
  error: TError | null;
}>;

export function createReactQueryMethod<TData = unknown, TError = unknown, TInput = void>(opts: {
  key: TInput extends void ? readonly string[] : (args: TInput) => readonly string[];
  query: (args: TInput) => MethodResult<TData, TError>;
}): QueryMethod<TData, TError, TInput>;

export function createReactQueryMethod<TData = unknown, TError = unknown, TInput = void>(opts: {
  key: readonly string[];
  mutate: (args: TInput) => MethodResult<TData, TError>;
}): MutationMethod<TData, TError, TInput>;

export function createReactQueryMethod<TData = unknown, TError = unknown, TInput = void>(
  opts:
    | {
        key: readonly string[] | ((args: TInput) => readonly string[]);
        query: (args: TInput) => MethodResult<TData, TError>;
      }
    | {
        key: readonly string[];
        mutate: (args: TInput) => MethodResult<TData, TError>;
      },
): QueryMethod<TData, TError, TInput> | MutationMethod<TData, TError, TInput> {
  if ("query" in opts) {
    const { query, key } = opts;

    const queryKey = (args: TInput): QueryKey => {
      const keys: readonly string[] = typeof key === "function" ? key(args) : key;
      return ["better-auth", ...keys];
    };

    return {
      queryKey,
      queryOptions: ((args: TInput, options?: MethodQueryObserverOptions<TData, TError>) =>
        queryOptions<TData, TError>({
          queryKey: queryKey(args),
          ...options,

          queryFn: async () => {
            const { error, data } = await query(args as TInput);

            if (error) {
              throw error;
            }

            return data as TData;
          },
        })) as unknown as MethodQueryOptions<TData, TError, TInput>,
    };
  }

  const { mutate, key } = opts;

  const mutationKey = (): MutationKey => ["better-auth", ...key];

  return {
    mutationKey,

    mutationOptions: ((options?) => ({
      mutationKey: mutationKey(),
      ...options,

      mutationFn: async (args: TInput) => {
        const { error, data } = await mutate(args);

        if (error) {
          throw error;
        }

        return data;
      },
    })) satisfies MethodMutationOptions<TData, TError, TInput>,
  };
}
