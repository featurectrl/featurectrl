import type { CSSProperties } from "react";
import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Notice } from "@/emails/components/ui/notice";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
import { textSize } from "@/emails/theming";
import type { EmailTemplate } from "@/emails/types";

export type ResetPasswordEmailTemplateProps = {
  email: string;
  url: string;
};

function subject() {
  return "Reset your featurectrl password";
}

const bodyText = (props: ResetPasswordEmailTemplateProps) =>
  `
We received a request to reset the password for ${props.email}.

Reset your password by visiting:
${props.url}

If you didn't request this, you can safely ignore this message and your password will remain unchanged.
`.trimStart();

function BodyHtml(props: ResetPasswordEmailTemplateProps) {
  return (
    <Layout preview="Set a new password for your featurectrl account.">
      <Heading style={styles.heading}>Reset your password</Heading>
      <Text>
        We received a request to reset the password for{" "}
        <span style={styles.bold}>{props.email}</span>. Choose a new one with the button below.
      </Text>

      <Notice style={styles.notice}>
        <Text>
          <span style={styles.bold}>Didn't ask for this?</span> You can safely ignore this email -
          your password won't change unless you click the link above.
        </Text>
      </Notice>

      <Button href={props.url}>Set new password</Button>

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
  bold: { fontWeight: 600 },
  notice: { marginTop: "24px", marginBottom: "24px" },
  divider: { marginTop: "24px", marginBottom: "24px" },
  urlLink: { fontSize: textSize.sm, wordBreak: "break-all" },
} as const satisfies Record<string, CSSProperties>;

export const resetPasswordTemplate: EmailTemplate<ResetPasswordEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
