import { renderJSX } from "./render-jsx";
import { AssetProvider, createAttachmentCollector } from "./shared/assets-provider";
import { changeEmailTemplate } from "./templates/change-email-template";
import { emailVerificationTemplate } from "./templates/email-verification-template";
import { invitationTemplate } from "./templates/invitation-template";
import { resetPasswordTemplate } from "./templates/reset-password-template";
import type { EmailAttachment, EmailTemplate, ExtractEmailTemplateProps } from "./types";

const TEMPLATES = {
  "change-email": changeEmailTemplate,
  "email-verification": emailVerificationTemplate,
  invitation: invitationTemplate,
  "reset-password": resetPasswordTemplate,
} as const;

export type TemplateName = keyof typeof TEMPLATES;
export type TemplateProps<T extends TemplateName> = ExtractEmailTemplateProps<
  (typeof TEMPLATES)[T]
>;

export async function renderEmailTemplate<T extends TemplateName>(
  templateName: T,
  templateParameters: TemplateProps<T>,
): Promise<{
  subject: string;
  text: string;
  html: string;
  attachments: EmailAttachment[];
}> {
  const template = TEMPLATES[templateName] as EmailTemplate<TemplateProps<T>>;

  const attachmentsCollector = createAttachmentCollector();

  const subject = template.subject(templateParameters);
  const text = template.bodyText(templateParameters);
  const html = renderJSX(
    <AssetProvider attachmentsCollector={attachmentsCollector}>
      <template.bodyHtml {...templateParameters} />
    </AssetProvider>,
  );

  return {
    subject,
    text,
    html,
    attachments: attachmentsCollector,
  };
}
