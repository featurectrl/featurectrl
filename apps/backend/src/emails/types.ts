import type { FC } from "react";

export type EmailTemplate<P extends Record<string, unknown>> = {
  subject: (props: P) => string;
  bodyHtml: FC<P>;
  bodyText: (props: P) => string;
};

// biome-ignore lint/suspicious/noExplicitAny: this is an infer type
export type EmailTemplateProps<T extends EmailTemplate<any>> =
  T extends EmailTemplate<infer P> ? P : never;
