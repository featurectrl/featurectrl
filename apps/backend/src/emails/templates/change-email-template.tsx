import { Button, Heading, Text } from "react-email";
import { EmailLayout } from "@/emails/shared/EmailLayout";
import type { EmailTemplate } from "@/emails/types";

export type ChangeEmailEmailTemplateProps = {
  currentEmail: string;
  newEmail: string;
  url: string;
};

function subject() {
  return "Confirm your new email address";
}

const bodyText = (props: ChangeEmailEmailTemplateProps) =>
  `
We received a request to change the email on your account from
${props.currentEmail} to ${props.newEmail}.

Click the following link to confirm the change:
${props.url}
`;

function BodyHtml(props: ChangeEmailEmailTemplateProps) {
  return (
    <EmailLayout>
      <Heading style={{ color: "#111827", fontSize: "20px", margin: "0 0 12px" }}>
        Confirm your new email
      </Heading>
      <Text style={{ color: "#374151", fontSize: "14px", margin: "0 0 12px" }}>
        We received a request to change the email on your account from{" "}
        <strong>{props.currentEmail}</strong> to <strong>{props.newEmail}</strong>.
      </Text>
      <Text style={{ color: "#374151", fontSize: "14px", margin: "0 0 20px" }}>
        Click the button below to confirm the change.
      </Text>
      <Button href={props.url}>Confirm change</Button>
      <Text style={{ color: "#6b7280", fontSize: "12px", margin: "20px 0 0" }}>
        If you didn't request this, you can safely ignore this message.
      </Text>
    </EmailLayout>
  );
}

export const changeEmailTemplate: EmailTemplate<ChangeEmailEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
