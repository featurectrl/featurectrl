import type { CSSProperties } from "react";
import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Column } from "@/emails/components/ui/column";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Row } from "@/emails/components/ui/row";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
import { colors, textSize } from "@/emails/theming";
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
      <Heading style={styles.heading}>
        {props.inviterName ? (
          <>
            {props.inviterName} invited you to {props.organizationName}.
          </>
        ) : (
          <>You're invited to {props.organizationName}.</>
        )}
      </Heading>

      <Text style={styles.intro}>
        {props.inviterName ? (
          <>
            <span style={styles.bold}>{props.inviterName}</span> added you to the{" "}
            <span style={styles.bold}>{props.organizationName}</span> on featurectrl. You'll be able
            to manage feature flags alongside the team.
          </>
        ) : (
          <>
            You've been added to the <span style={styles.bold}>{props.organizationName}</span>{" "}
            workspace on featurectrl. You'll be able to manage feature flags alongside the team.
          </>
        )}
      </Text>

      <Section style={styles.card}>
        <Row>
          <Column style={styles.avatarColumn}>
            <div style={styles.avatar}>{orgAvatarLetter}</div>
          </Column>

          <Column>
            <div style={styles.orgName}>{props.organizationName}</div>
            <div style={styles.orgLabel}>Organization</div>
          </Column>
        </Row>
      </Section>

      <Button href={props.url}>Accept invitation</Button>

      <Divider style={styles.divider} />

      <Section>
        <Text size="sm" muted>
          Trouble with the button? Paste this URL into your browser
        </Text>
        <Link href={props.url} style={styles.urlLink}>
          {props.url}
        </Link>
      </Section>
    </Layout>
  );
}

const styles = {
  heading: { marginBottom: "8px" },
  intro: { marginBottom: "16px" },
  bold: { fontWeight: 600 },
  card: {
    backgroundColor: colors.stone["100"],
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.stone["200"],
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  },
  avatarColumn: {
    width: "40px",
    paddingRight: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: colors.stone["900"],
    color: colors.stone["100"],
    textAlign: "center",
    fontSize: textSize.base,
    fontWeight: 600,
  },
  orgName: {
    fontSize: textSize.base,
    fontWeight: 600,
    color: colors.stone["900"],
  },
  orgLabel: {
    fontSize: textSize.xs,
    textTransform: "uppercase",
    color: colors.stone["500"],
  },
  divider: { marginTop: "24px", marginBottom: "24px" },
  urlLink: { fontSize: textSize.sm, wordBreak: "break-all" },
} as const satisfies Record<string, CSSProperties>;

export const invitationTemplate: EmailTemplate<InvitationEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
