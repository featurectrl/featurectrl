import { router } from "@/router.ts";

export const absoluteURL = (opts: Parameters<typeof router.buildLocation>[0]): string => {
  const { href } = router.buildLocation(opts);
  return new URL(href, location.origin).toString();
};
