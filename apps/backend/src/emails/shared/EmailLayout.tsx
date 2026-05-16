import type { ReactNode } from "react";
import { Body, Container, Head, Hr, Html, pixelBasedPreset, Tailwind, Text } from "react-email";

type EmailLayoutProps = {
  preview?: string;
  children: ReactNode;
};

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
      }}
    >
      <Html>
        <Head />
        <Body>
          <Container>
            {children}
            <Hr />
            <Text>featurectrl</Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
