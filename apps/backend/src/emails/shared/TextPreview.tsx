import { Body, Container, Head, Html } from "react-email";

type TextPreviewLayoutProps = {
  children: string;
};

export function TextPreview({ children }: TextPreviewLayoutProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container
          style={{
            whiteSpace: "pre",
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  );
}
