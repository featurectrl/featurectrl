import type { ReactNode } from "react";
import { Logo } from "./logo";
import { Column } from "./ui/column";
import { Container } from "./ui/container";
import { Preview } from "./ui/preview";
import { Row } from "./ui/row";
import { Section } from "./ui/section";

interface LayoutProps {
  preview?: string;
  children: ReactNode;
}

export function Layout({ preview, children }: LayoutProps) {
  // noinspection HtmlRequiredTitleElement
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
        <meta name="x-apple-disable-message-reformatting" />
      </head>
      <body className="bg-stone-100 font-sans text-base m-0 p-0 py-10">
        {preview && <Preview>{preview}</Preview>}

        <Section className="pb-10">
          <Row>
            <Column align="center">
              <Logo className="h-10" />
            </Column>
          </Row>
        </Section>

        <Container className="max-w-xl bg-white rounded-md p-8 mb-4">{children}</Container>
      </body>
    </html>
  );
}
