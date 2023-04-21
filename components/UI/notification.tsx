import React, { FunctionComponent, ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

type NotificationProps = {
  children: ReactNode;
  onClose?: () => void;
  severity?: "error" | "warning" | "info" | "success";
  visible?: boolean;
};

const Notification: FunctionComponent<NotificationProps> = ({
  children,
  onClose,
  severity = "error",
  visible = false,
}) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={visible}
    >
      <Alert severity={severity} onClose={onClose}>
        {children}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
