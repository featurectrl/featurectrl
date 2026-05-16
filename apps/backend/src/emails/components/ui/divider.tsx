import clsx from "clsx";
import { Hr } from "react-email";

type DividerProps = {
  dashed?: boolean;
  className?: string;
};

export function Divider({ dashed, className }: DividerProps) {
  return (
    <Hr
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
