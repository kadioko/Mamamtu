"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
    const [internal, setInternal] = React.useState(!!defaultChecked);
    const isControlled = typeof checked === "boolean";
    const isOn = isControlled ? checked! : internal;

    function toggle() {
      if (disabled) return;
      const next = !isOn;
      if (!isControlled) setInternal(next);
      onCheckedChange?.(next);
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isOn ? "true" : "false"}
        onClick={toggle}
        disabled={disabled}
        className={cn(
          "inline-flex h-6 w-10 items-center rounded-full border transition-colors",
          isOn ? "bg-primary" : "bg-muted",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow transform transition-transform",
            isOn ? "translate-x-4" : "translate-x-0.5"
          )}
        />
        {/* hidden input for form compatibility */}
        <input
          {...props}
          ref={ref}
          type="checkbox"
          checked={isOn}
          onChange={() => {}}
          hidden
          readOnly
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
