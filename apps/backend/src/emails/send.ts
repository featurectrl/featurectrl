import { sendMail } from "@/lib/mailer";
import { renderEmailTemplate, type TemplateName, type TemplateProps } from "./render";

export async function sendTemplatedEmail<T extends TemplateName>(
  name: T,
  to: string,
  props: TemplateProps<T>,
): Promise<void> {
  const rendered = await renderEmailTemplate(name, props);
  await sendMail({ to, ...rendered });
}
