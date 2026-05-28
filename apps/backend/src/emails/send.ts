import nodemailer from "nodemailer";
import { env } from "@/env";
import { renderEmailTemplate, type TemplateName, type TemplateProps } from "./render";

const transport = env.EMAIL_BACKEND_URL.startsWith("console://")
  ? nodemailer.createTransport({
      streamTransport: true,
      from: env.EMAIL_FROM,
      send: (mail) => {
        console.log("Subject:", mail.data.subject);
        console.log("Body:");
        console.log(mail.data.text)
      },
    })
  : nodemailer.createTransport(env.EMAIL_BACKEND_URL, {
      from: env.EMAIL_FROM,
    });

export type SendRawEmailOptions = nodemailer.SendMailOptions;

export async function sendRawEmail(opts: SendRawEmailOptions): Promise<void> {
  await transport.sendMail(opts);
}

export type SendTemplateEmailOptions<T extends TemplateName> = Omit<
  nodemailer.SendMailOptions,
  "subject" | "text" | "html"
> & {
  templateName: T;
  templateParameters: TemplateProps<T>;
};

export async function sendTemplateEmail<T extends TemplateName>({
  templateName,
  templateParameters,
  attachments = [],
  ...restOptions
}: SendTemplateEmailOptions<T>): Promise<void> {
  const {
    subject,
    text,
    html,
    attachments: contentAttachments = [],
  } = await renderEmailTemplate(templateName, templateParameters);

  await transport.sendMail({
    ...restOptions,

    subject,
    text,
    html,
    attachments: [...attachments, ...contentAttachments],
  });
}
