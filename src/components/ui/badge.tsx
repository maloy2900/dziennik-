import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-elevated text-fg",
        outline: "border-border text-muted",
        win: "border-transparent bg-win/15 text-win",
        loss: "border-transparent bg-loss/15 text-loss",
        be: "border-transparent bg-be/15 text-be",
        long: "border-transparent bg-win/15 text-win",
        short: "border-transparent bg-loss/15 text-loss",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
