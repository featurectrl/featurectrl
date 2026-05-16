import { Button, Heading, Text } from "react-email";
import { EmailLayout } from "@/emails/shared/EmailLayout";
import type { EmailTemplate } from "@/emails/types";

export type EmailVerificationEmailTemplateProps = {
  email: string;
  url: string;
};

function subject() {
  return "Verify your email";
}

const bodyText = (props: EmailVerificationEmailTemplateProps) =>
  `
Hi,

Confirm your email by visiting:
${props.url}

If you didn't sign up, you can safely ignore this message.
`;

function BodyHtml(props: EmailVerificationEmailTemplateProps) {
  return (
    <EmailLayout>
      <Heading style={{ color: "#111827", fontSize: "20px", margin: "0 0 12px" }}>
        Verify your email
      </Heading>
      <Text style={{ color: "#374151", fontSize: "14px", margin: "0 0 20px" }}>
        Click the button below to confirm your email address.
      </Text>
      <Button href={props.url}>Verify email</Button>
      <Text style={{ color: "#6b7280", fontSize: "12px", margin: "20px 0 0" }}>
        If you didn't sign up, you can safely ignore this message.
      </Text>
    </EmailLayout>
  );
}

export const emailVerificationTemplate: EmailTemplate<EmailVerificationEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
