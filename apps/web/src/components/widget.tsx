import * as React from "react";

import { cn } from "@/lib/utils";

type WidgetVariant = "default" | "danger";

const WidgetVariantContext = React.createContext<WidgetVariant>("default");

interface WidgetProps extends React.ComponentProps<"section"> {
  variant?: WidgetVariant;
}

function Widget({ className, variant = "default", children, ...props }: WidgetProps) {
  return (
    <WidgetVariantContext value={variant}>
      <section
        data-slot="widget"
        data-variant={variant}
        className={cn(
          "flex flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1",
          variant === "danger" ? "ring-destructive/30" : "ring-foreground/10",
          className,
        )}
        {...props}
      >
        {children}
      </section>
    </WidgetVariantContext>
  );
}

function WidgetHeader({ className, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(WidgetVariantContext);
  return (
    <div
      data-slot="widget-header"
      className={cn(
        "flex items-center justify-between gap-3 border-b px-5 py-3",
        "*:data-[slot=widget-action]:ml-auto",
        {
          "border-destructive/30": variant === "danger",
        },
        className,
      )}
      {...props}
    />
  );
}

function WidgetHeaderText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-header-text"
      className={cn("flex min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function WidgetTitle({ className, ...props }: React.ComponentProps<"h3">) {
  const variant = React.useContext(WidgetVariantContext);
  return (
    <h3
      data-slot="widget-title"
      className={cn(
        "text-sm font-semibold leading-tight tracking-tight",
        variant === "danger" && "text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function WidgetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="widget-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function WidgetAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-action"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

function WidgetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-body"
      className={cn("flex flex-col gap-4 px-5 py-4", className)}
      {...props}
    />
  );
}

function WidgetRows({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-rows"
      className={cn("flex flex-col divide-y divide-border px-5", className)}
      {...props}
    />
  );
}

function WidgetRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-row"
      className={cn("grid grid-cols-1 gap-4 py-4 sm:grid-cols-[15rem_1fr] sm:gap-6", className)}
      {...props}
    />
  );
}

function WidgetRowLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-row-label"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function WidgetRowLabelTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-row-label-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function WidgetRowLabelDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="widget-row-label-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function WidgetList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="widget-list"
      className={cn("flex flex-col divide-y divide-border", className)}
      {...props}
    />
  );
}

function WidgetListItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="widget-list-item"
      className={cn("flex items-center gap-3 px-5 py-3", className)}
      {...props}
    />
  );
}

function WidgetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-footer"
      className={cn(
        "flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}

export type { WidgetVariant };
export {
  Widget,
  WidgetAction,
  WidgetBody,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetHeaderText,
  WidgetList,
  WidgetListItem,
  WidgetRow,
  WidgetRowLabel,
  WidgetRowLabelDescription,
  WidgetRowLabelTitle,
  WidgetRows,
  WidgetTitle,
};
