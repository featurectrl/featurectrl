import { render } from "react-email";
import type { SendMailOptions } from "@/lib/mailer";
import { AssetProvider, createAttachmentCollector } from "./assets-provider";
import { changeEmailTemplate } from "./templates/change-email-template";
import { emailVerificationTemplate } from "./templates/email-verification-template";
import { invitationTemplate } from "./templates/invitation-template";
import { resetPasswordTemplate } from "./templates/reset-password-template";
import type { EmailTemplate, EmailTemplateProps } from "./types";

const TEMPLATES = {
  "change-email": changeEmailTemplate,
  "email-verification": emailVerificationTemplate,
  invitation: invitationTemplate,
  "reset-password": resetPasswordTemplate,
} as const;

export type TemplateName = keyof typeof TEMPLATES;

export type TemplateProps<T extends TemplateName> = EmailTemplateProps<(typeof TEMPLATES)[T]>;

export async function renderEmailTemplate<T extends TemplateName>(
  name: T,
  props: TemplateProps<T>,
): Promise<Pick<SendMailOptions, "subject" | "text" | "html" | "attachments">> {
  const template = TEMPLATES[name] as EmailTemplate<TemplateProps<T>>;
  const attachmentsCollector = createAttachmentCollector();

  const html = await render(
    <AssetProvider attachmentsCollector={attachmentsCollector}>
      <template.bodyHtml {...props} />
    </AssetProvider>,
  );

  return {
    subject: template.subject(props),
    text: template.bodyText(props),
    html,
    attachments: [...attachmentsCollector],
  };
}
