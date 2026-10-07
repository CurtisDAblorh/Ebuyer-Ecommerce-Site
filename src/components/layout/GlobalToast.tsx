"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dismissToast } from "@/store/uiSlice";

export function GlobalToast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((s) => s.ui.toast);

  return (
    <Snackbar
      key={toast?.id}
      open={Boolean(toast)}
      autoHideDuration={2500}
      onClose={(_e, reason) => reason !== "clickaway" && dispatch(dismissToast())}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={toast?.severity ?? "success"}
        variant="filled"
        onClose={() => dispatch(dismissToast())}
        sx={{ borderRadius: 999, alignItems: "center" }}
      >
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}
