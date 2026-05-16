import { Button, Heading, Text } from "react-email";
import { EmailLayout } from "@/emails/shared/EmailLayout";
import type { EmailTemplate } from "@/emails/types";

export type ResetPasswordEmailTemplateProps = {
  email: string;
  url: string;
};

function subject() {
  return "Reset your password";
}

const bodyText = (props: ResetPasswordEmailTemplateProps) =>
  `
Hi,

We received a request to reset the password for your account.

Reset your password by visiting:
${props.url}

If you didn't request this, you can safely ignore this message and your password will remain unchanged.
`;

function BodyHtml(props: ResetPasswordEmailTemplateProps) {
  return (
    <EmailLayout>
      <Heading style={{ color: "#111827", fontSize: "20px", margin: "0 0 12px" }}>
        Reset your password
      </Heading>
      <Text style={{ color: "#374151", fontSize: "14px", margin: "0 0 20px" }}>
        Click the button below to choose a new password for your account.
      </Text>
      <Button href={props.url}>Reset password</Button>
      <Text style={{ color: "#6b7280", fontSize: "12px", margin: "20px 0 0" }}>
        If you didn't request this, you can safely ignore this message.
      </Text>
    </EmailLayout>
  );
}

export const resetPasswordTemplate: EmailTemplate<ResetPasswordEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
