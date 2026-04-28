import { type QueryClient, QueryObserver } from "@tanstack/react-query";
import type { BetterAuth, Session } from "@/lib/auth";

export function withPersistentLastSession({
  queryClient,
  betterAuth,
  storageKey,
  storageKeyExpiryTime,
  autoSaveInterval,
  storage,
}: {
  queryClient: QueryClient;
  betterAuth: BetterAuth;
  autoSaveInterval: number;
  storageKey: string;
  storageKeyExpiryTime: number;
  storage: Storage;
}) {
  const lastSessionData = readLastSessionSnapshot(storage, storageKey, { storageKeyExpiryTime });
  if (lastSessionData) {
    queryClient.setQueryData(betterAuth.getSession.queryKey(), lastSessionData);
  }

  const observer = new QueryObserver(queryClient, betterAuth.getSession.queryOptions());
  const unsubscribe = observer.subscribe(({ data: session, isFetching }) => {
    if (!isFetching) {
      writeLastSessionSnapshot(storage, storageKey, session ?? null);
    }
  });

  const autoSave = setInterval(() => {
    const queryState = queryClient.getQueryState<Session>(betterAuth.getSession.queryKey());

    if (queryState && !queryState.isInvalidated && queryState.dataUpdateCount) {
      writeLastSessionSnapshot(storage, storageKey, queryState.data ?? null);
    }
  }, autoSaveInterval);

  return () => {
    unsubscribe();
    clearInterval(autoSave);
  };
}

function writeLastSessionSnapshot(
  storage: Storage,
  storageKey: string,
  sessionData: Session | null,
) {
  if (sessionData) {
    storage.setItem(storageKey, JSON.stringify({ ...sessionData, timestamp: Date.now() }));
  } else {
    storage.removeItem(storageKey);
  }
}

function readLastSessionSnapshot(
  storage: Storage,
  storageKey: string,
  {
    storageKeyExpiryTime,
  }: {
    storageKeyExpiryTime: number;
  },
): Session | null {
  const raw = storage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const lastSession = JSON.parse(raw) as Session & {
      timestamp: number;
    };

    if (lastSession.timestamp - Date.now() < storageKeyExpiryTime) {
      return lastSession;
    }
  } catch {}

  storage.removeItem(storageKey);
  return null;
}
