"use client";

import { startTransition } from "react";

export function submitAction(
  action: (formData: FormData) => void,
  form: HTMLFormElement | null,
) {
  if (!form) return;
  const formData = new FormData(form);
  startTransition(() => {
    action(formData);
  });
}
