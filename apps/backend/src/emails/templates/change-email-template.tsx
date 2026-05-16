import { Column, Row, Section } from "react-email";
import { Layout } from "@/emails/components/layout";
import { Button } from "@/emails/components/ui/button";
import { Divider } from "@/emails/components/ui/divider";
import { Heading } from "@/emails/components/ui/heading";
import { Link } from "@/emails/components/ui/link";
import { Notice } from "@/emails/components/ui/notice";
import { Text } from "@/emails/components/ui/text";
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
      <Heading className="mb-2">Confirm your new email</Heading>
      <Text className="mb-4">
        You asked to change the email on your featurectrl account. Confirm below to make{" "}
        <span className="font-semibold">{props.newEmail}</span> the new sign-in address.
      </Text>

      <Section className="bg-stone-100 border border-solid border-stone-200 rounded-lg p-4 mb-6">
        <Row>
          <Column
            valign="middle"
            className="text-xs uppercase tracking-wider text-stone-400 font-medium w-16 py-1"
          >
            From
          </Column>
          <Column
            valign="middle"
            className="text-sm text-stone-400 font-medium line-through py-1 break-all"
          >
            {props.currentEmail}
          </Column>
        </Row>

        <Row>
          <Column>
            <Divider dashed />
          </Column>
        </Row>

        <Row>
          <Column
            valign="middle"
            className="text-xs uppercase tracking-wider text-stone-400 font-medium w-16 py-1"
          >
            To
          </Column>

          <Column
            align="left"
            valign="middle"
            className="text-sm text-stone-900 font-medium py-1 break-all"
          >
            {props.newEmail}
          </Column>
        </Row>
      </Section>

      <Button href={props.url}>Confirm new email</Button>

      <Notice className="mt-6">
        <Text>
          <span className="font-semibold">Not you?</span> Don't confirm. Your old address{" "}
          <span className="font-semibold">{props.currentEmail}</span> stays active.
        </Text>
      </Notice>

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

export const changeEmailTemplate: EmailTemplate<ChangeEmailEmailTemplateProps> = {
  subject,
  bodyText,
  bodyHtml: BodyHtml,
};
