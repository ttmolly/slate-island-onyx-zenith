import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "ghost" | "quiet";

export function Button({
  className,
  variant = "solid",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-sm px-4 text-sm font-medium transition-transform duration-150 ease-smooth active:scale-95 disabled:opacity-40",
        variant === "solid" && "bg-accent text-accent-fg",
        variant === "ghost" && "border border-border bg-subtle text-fg",
        variant === "quiet" && "bg-transparent px-2 text-muted",
        className,
      )}
      {...props}
    />
  );
}
