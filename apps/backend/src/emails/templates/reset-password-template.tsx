import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Notice } from "@/emails/components/ui/notice";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
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
      <Heading className="mb-2">Reset your password</Heading>
      <Text>
        We received a request to reset the password for{" "}
        <span className="font-semibold">{props.email}</span>. Choose a new one with the button
        below.
      </Text>

      <Notice className="my-6">
        <Text>
          <span className="font-semibold">Didn't ask for this?</span> You can safely ignore this
          email - your password won't change unless you click the link above.
        </Text>
      </Notice>

      <Button href={props.url}>Set new password</Button>

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

export const resetPasswordTemplate: EmailTemplate<ResetPasswordEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
