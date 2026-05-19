interface PreviewProps {
  children: string;
}

const HIDDEN_STYLE = {
  display: "none",
  overflow: "hidden",
  lineHeight: "1px",
  opacity: 0,
  maxHeight: 0,
  maxWidth: 0,
} as const;

const PADDING = " ‌ ".repeat(40);

export function Preview({ children }: PreviewProps) {
  return (
    <div style={HIDDEN_STYLE}>
      {children}
      {PADDING}
    </div>
  );
}
