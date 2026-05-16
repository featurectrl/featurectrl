import { Button, Heading, Text } from "react-email";
import { EmailLayout } from "@/emails/shared/EmailLayout";
import type { EmailTemplate } from "@/emails/types";

export type InvitationEmailTemplateProps = {
  invitedEmail: string;
  organizationName: string;
  inviterName?: string;
  url: string;
};

function subject(props: InvitationEmailTemplateProps) {
  return `You're invited to join ${props.organizationName}`;
}

const bodyText = (props: InvitationEmailTemplateProps) => {
  const inviter = props.inviterName ? `${props.inviterName} invited` : "You've been invited";
  return `
Hi,

${inviter} you to join ${props.organizationName} on FeatureCtrl.

Accept the invitation by visiting:
${props.url}

If you weren't expecting this invitation, you can safely ignore this message.
`;
};

function BodyHtml(props: InvitationEmailTemplateProps) {
  const inviter = props.inviterName ? (
    <>
      <strong>{props.inviterName}</strong> invited
    </>
  ) : (
    <>You've been invited</>
  );
  return (
    <EmailLayout>
      <Heading style={{ color: "#111827", fontSize: "20px", margin: "0 0 12px" }}>
        Join {props.organizationName}
      </Heading>
      <Text style={{ color: "#374151", fontSize: "14px", margin: "0 0 20px" }}>
        {inviter} you to join <strong>{props.organizationName}</strong> on FeatureCtrl.
      </Text>
      <Button href={props.url}>Accept invitation</Button>
      <Text style={{ color: "#6b7280", fontSize: "12px", margin: "20px 0 0" }}>
        If you weren't expecting this invitation, you can safely ignore this message.
      </Text>
    </EmailLayout>
  );
}

export const invitationTemplate: EmailTemplate<InvitationEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
