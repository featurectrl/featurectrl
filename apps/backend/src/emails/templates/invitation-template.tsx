import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Column } from "@/emails/components/ui/column";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Row } from "@/emails/components/ui/row";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
import type { EmailTemplate } from "@/emails/types";

export type InvitationEmailTemplateProps = {
  invitedEmail: string;
  organizationName: string;
  inviterName?: string;
  url: string;
};

function subject(props: InvitationEmailTemplateProps) {
  return `You're invited to join ${props.organizationName} on featurectrl`;
}

const bodyText = (props: InvitationEmailTemplateProps) => {
  const inviter = props.inviterName ? `${props.inviterName} invited` : "You've been invited";
  return `
${inviter} you to join ${props.organizationName} on featurectrl.

Accept the invitation by visiting:
${props.url}

If you weren't expecting this invitation, you can safely ignore this message.
`.trimStart();
};

function BodyHtml(props: InvitationEmailTemplateProps) {
  const orgAvatarLetter = props.organizationName.charAt(0).toUpperCase();

  return (
    <Layout preview={`Join the ${props.organizationName} workspace on featurectrl.`}>
      <Heading className="mb-2">
        {props.inviterName ? (
          <>
            {props.inviterName} invited you to {props.organizationName}.
          </>
        ) : (
          <>You're invited to {props.organizationName}.</>
        )}
      </Heading>

      <Text className="mb-4">
        {props.inviterName ? (
          <>
            <span className="font-semibold">{props.inviterName}</span> added you to the{" "}
            <span className="font-semibold">{props.organizationName}</span> on featurectrl. You'll
            be able to manage feature flags alongside the team.
          </>
        ) : (
          <>
            You've been added to the <span className="font-semibold">{props.organizationName}</span>{" "}
            workspace on featurectrl. You'll be able to manage feature flags alongside the team.
          </>
        )}
      </Text>

      <Section className="bg-stone-100 border border-solid border-stone-200 rounded-lg p-4 mb-4">
        <Row>
          <Column className="w-10 pr-3">
            <div className="size-10 rounded-lg bg-stone-900 text-stone-100 text-center text-base font-semibold leading-10">
              {orgAvatarLetter}
            </div>
          </Column>

          <Column>
            <div className="text-base font-semibold text-stone-900">{props.organizationName}</div>
            <div className="text-xs uppercase text-stone-500">Organization</div>
          </Column>
        </Row>
      </Section>

      <Button href={props.url}>Accept invitation</Button>

      <Divider className="my-6" />

      <Section>
        <Text size="sm" muted>
          Trouble with the button? Paste this URL into your browser
        </Text>
        <Link href={props.url} className="text-sm break-all">
          {props.url}
        </Link>
      </Section>
    </Layout>
  );
}

export const invitationTemplate: EmailTemplate<InvitationEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
