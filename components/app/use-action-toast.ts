"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/actions/types";

// Surfaces an ActionState as a toast and runs `onSuccess` (e.g. close a dialog,
// reset a form) when the action succeeds. Field-level errors still render inline.
export function useActionToast(state: ActionState, onSuccess?: () => void) {
  useEffect(() => {
    if (state.ok) {
      if (state.message) toast.success(state.message);
      onSuccess?.();
    } else if (state.message) {
      toast.error(state.message);
    }
    // Intentionally keyed on `state` only: useActionState yields a fresh object
    // per dispatch, so this fires exactly once per submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
