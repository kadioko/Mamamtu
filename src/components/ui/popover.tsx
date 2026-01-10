"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Minimal popover implementation suitable for date/time pickers
export const Popover = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block">{children}</div>;
};

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  if (asChild) {
    // When used with asChild, the child handles its own rendering; we only spread props
    const child = React.Children.only(props.children) as React.ReactElement;
    return child;
  }
  return (
    <button ref={ref} className={cn(className)} {...props} />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }
>(({ className, align = "center", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-50 mt-2 w-auto rounded-md border bg-popover p-2 text-popover-foreground shadow-md",
        align === "start" && "origin-top-left",
        align === "end" && "origin-top-right",
        className
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";
