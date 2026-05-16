import type { SendMailOptions } from "nodemailer";
import type { ComponentType } from "react";

export type EmailTemplate<P extends Record<string, unknown>> = {
  subject: (props: P) => string;
  bodyHtml: ComponentType<P>;
  bodyText: (props: P) => string;
};

export type EmailAttachment = NonNullable<SendMailOptions["attachments"]>[number];

// biome-ignore lint/suspicious/noExplicitAny: this is an infer type
export type ExtractEmailTemplateProps<T extends EmailTemplate<any>> =
  T extends EmailTemplate<infer P> ? P : never;
