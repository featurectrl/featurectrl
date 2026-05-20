import type { CSSProperties } from "react";
import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Column } from "@/emails/components/ui/column";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Notice } from "@/emails/components/ui/notice";
import { Row } from "@/emails/components/ui/row";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
import { colors, textSize } from "@/emails/theming";
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
`.trimStart();

function BodyHtml(props: ChangeEmailEmailTemplateProps) {
  return (
    <Layout preview="Confirm the change to finish updating your account.">
      <Heading style={styles.heading}>Confirm your new email</Heading>
      <Text style={styles.intro}>
        You asked to change the email on your featurectrl account. Confirm below to make{" "}
        <span style={styles.bold}>{props.newEmail}</span> the new sign-in address.
      </Text>

      <Section style={styles.summary}>
        <Row>
          <Column valign="middle" style={styles.summaryLabel}>
            From
          </Column>
          <Column valign="middle" style={styles.summaryFrom}>
            {props.currentEmail}
          </Column>
        </Row>

        <Row>
          <Column>
            <Divider dashed />
          </Column>
        </Row>

        <Row>
          <Column valign="middle" style={styles.summaryLabel}>
            To
          </Column>

          <Column align="left" valign="middle" style={styles.summaryTo}>
            {props.newEmail}
          </Column>
        </Row>
      </Section>

      <Button href={props.url}>Confirm new email</Button>

      <Notice style={styles.notice}>
        <Text>
          <span style={styles.bold}>Not you?</span> Don't confirm. Your old address{" "}
          <span style={styles.bold}>{props.currentEmail}</span> stays active.
        </Text>
      </Notice>

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
  summary: {
    backgroundColor: colors.stone["100"],
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.stone["200"],
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  summaryLabel: {
    fontSize: textSize.xs,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: colors.stone["400"],
    fontWeight: 500,
    width: "64px",
    paddingTop: "4px",
    paddingBottom: "4px",
  },
  summaryFrom: {
    fontSize: textSize.sm,
    color: colors.stone["400"],
    fontWeight: 500,
    textDecoration: "line-through",
    paddingTop: "4px",
    paddingBottom: "4px",
    wordBreak: "break-all",
  },
  summaryTo: {
    fontSize: textSize.sm,
    color: colors.stone["900"],
    fontWeight: 500,
    paddingTop: "4px",
    paddingBottom: "4px",
    wordBreak: "break-all",
  },
  notice: { marginTop: "24px" },
  divider: { marginTop: "24px", marginBottom: "24px" },
  urlLink: { fontSize: textSize.sm, wordBreak: "break-all" },
} as const satisfies Record<string, CSSProperties>;

export const changeEmailTemplate: EmailTemplate<ChangeEmailEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
