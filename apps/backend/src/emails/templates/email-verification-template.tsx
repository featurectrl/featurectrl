import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Section } from "@/emails/components/ui/section";
import { Text } from "@/emails/components/ui/text";
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
      <Heading className="mb-2">Verify your email</Heading>

      <Text className="mb-4">
        Confirm <span className="font-semibold">{props.email}</span> belongs to you by clicking the
        button below.
      </Text>

      <Button href={props.url}>Verify email</Button>

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

export const emailVerificationTemplate: EmailTemplate<EmailVerificationEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
