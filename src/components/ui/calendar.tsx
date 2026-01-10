"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CalendarProps = {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
};

export function Calendar({ mode = "single", selected, onSelect, className }: CalendarProps) {
  const [value, setValue] = React.useState<string | undefined>(
    selected ? toInputValue(selected) : undefined
  );

  React.useEffect(() => {
    if (selected) setValue(toInputValue(selected));
  }, [selected]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    const date = v ? new Date(v + "T00:00:00") : undefined;
    onSelect?.(date);
  }

  return (
    <div className={cn("inline-block", className)}>
      <input
        type="date"
        value={value || ""}
        onChange={handleChange}
        className="w-full rounded-md border px-3 py-2 text-sm"
        aria-label="Select date"
      />
    </div>
  );
}

function toInputValue(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
