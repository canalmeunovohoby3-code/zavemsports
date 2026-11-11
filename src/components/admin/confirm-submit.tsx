"use client";

import { cn } from "@/lib/cn";

type ConfirmSubmitProps = {
  message: string;
  className?: string;
  children: React.ReactNode;
};

export function ConfirmSubmit({
  message,
  className,
  children,
}: ConfirmSubmitProps) {
  return (
    <button
      type="submit"
      className={cn(className)}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
