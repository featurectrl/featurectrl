import type { CSSProperties, ReactNode } from "react";
import { colors, textSize } from "@/emails/theming";
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
      <body style={styles.body}>
        {preview && <Preview>{preview}</Preview>}

        <Section style={styles.header}>
          <Row>
            <Column align="center">
              <Logo style={styles.logo} />
            </Column>
          </Row>
        </Section>

        <Container style={styles.container}>{children}</Container>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    paddingTop: "40px",
    paddingBottom: "40px",
    backgroundColor: colors.stone["100"],
    fontFamily: "sans-serif",
    fontSize: textSize.base,
  },
  header: {
    paddingBottom: "40px",
  },
  logo: {
    height: "40px",
  },
  container: {
    maxWidth: "576px",
    backgroundColor: colors.white,
    borderRadius: "6px",
    padding: "32px",
    marginBottom: "16px",
  },
} as const satisfies Record<string, CSSProperties>;
