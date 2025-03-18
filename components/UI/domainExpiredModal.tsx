import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@/components/UI/iconsComponents/icons/closeIcon";

interface DomainExpiredModalProps {
  open: boolean;
  onClose: () => void;
  onRenew: () => void;
}

const DomainExpiredModal: React.FC<DomainExpiredModalProps> = ({
  open,
  onClose,
  onRenew,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "16px",
          padding: "24px 48px",
          maxWidth: "690px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "QuickZap",
          color: "#454545",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "400",
          position: "relative",
          paddingBottom: "4px",
        }}
      >
        Domain Expiration Notice
      </DialogTitle>
      <DialogContent>
          <div className="px-2">
              <p className="text-center font-normal text-[14px] leading-[24px] text-[#8C8989]">
                Your domain has expired. Would you like to renew it now to keep your website active?
              </p>
          </div>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 4 }}>
        <Button
            sx={{
                fontFamily: "QuickZap",
                textAlign: "center",
                fontWeight: "400",
                fontSize: "14px",
                border: "2px solid #19AA6E",
                borderRadius: "8px",
                padding: "10px 16px",
                backgroundColor: "#0C8654 !important",
                color: "white",
                }}
          onClick={onRenew}
          className=""
        >
          Renew Domain
        </Button>
      </DialogActions>
      <div className="absolute cursor-pointer right-6 top-6" onClick={onClose}>
          <CloseIcon />
        </div>
    </Dialog>
  );
};

export default DomainExpiredModal; 