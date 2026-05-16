import type { InvitationEmailTemplateProps } from "@/emails/templates/invitation-template";

export const props: InvitationEmailTemplateProps = {
  invitedEmail: "invitee@featurectrl.io",
  organizationName: "Acme Inc",
  inviterName: "Jane Doe",
  url: "https://featurectrl.io/select-organization?invitation=demo",
};
