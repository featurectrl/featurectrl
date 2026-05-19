import clsx from "clsx";

interface DividerProps {
  dashed?: boolean;
  className?: string;
}

export function Divider({ dashed, className }: DividerProps) {
  return (
    <hr
      className={clsx(
        "border-0 border-t border-stone-200",
        {
          "border-solid": !dashed,
          "border-dashed": dashed,
        },
        className,
      )}
    />
  );
}
