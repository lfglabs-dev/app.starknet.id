import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

// custom Checkmark icon from new Figma design
const CustomCheckmarkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 20 20">
    <rect width="20" height="20" rx="6" fill="#0C8654" />
    <path d="M9.19634 …" fill="white" />
  </SvgIcon>
);

export default CustomCheckmarkIcon;