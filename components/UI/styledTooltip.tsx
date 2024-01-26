import React from "react";
import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";

const StyledToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#454545",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#454545",
  },
}));

export default StyledToolTip;
