import type { CSSProperties } from "react";
import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
import { textSize } from "@/emails/theming";
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
Confirm ${props.email} belongs to you by clicking the link below:
${props.url}

If you didn't sign up, you can safely ignore this message.
`.trimStart();

function BodyHtml(props: EmailVerificationEmailTemplateProps) {
  return (
    <Layout preview="Confirm your email to finish setting up your account.">
      <Heading style={styles.heading}>Verify your email</Heading>

      <Text style={styles.intro}>
        Confirm <span style={styles.bold}>{props.email}</span> belongs to you by clicking the button
        below.
      </Text>

      <Button href={props.url}>Verify email</Button>

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
  divider: { marginTop: "24px", marginBottom: "24px" },
  urlLink: { fontSize: textSize.sm, wordBreak: "break-all" },
} as const satisfies Record<string, CSSProperties>;

export const emailVerificationTemplate: EmailTemplate<EmailVerificationEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
