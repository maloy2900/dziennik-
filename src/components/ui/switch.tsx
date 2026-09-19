import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-4 rounded-full bg-fg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1 data-[state=checked]:bg-accent-fg",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
