import type { ReactNode } from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  pixelBasedPreset,
  Row,
  Section,
  Tailwind,
} from "react-email";
import { Logo } from "./logo";

type LayoutProps = {
  preview?: string;
  children: ReactNode;
};

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Tailwind config={{ presets: [pixelBasedPreset] }}>
      <Html>
        <Head />
        {preview && <Preview>{preview}</Preview>}
        <Body className="bg-stone-100 font-sans text-base m-0 p-0 py-10">
          <Section className="pb-10">
            <Row>
              <Column align="center">
                <Logo className="h-10" />
              </Column>
            </Row>
          </Section>

          <Container className="max-w-xl bg-white rounded-md p-8 mb-4">{children}</Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
