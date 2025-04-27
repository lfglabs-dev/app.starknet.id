import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

// custom Checkmark icon from new Figma design
const CustomCheckmarkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="6" fill="#0C8654"/>
      <path d="M9.19634 14.1306C8.56087 13.3023 6.64502 11.5484 5.76654 10.7749C5.23937 10.3043 5.74942 9.20896 6.8019 9.98051C7.64387 10.5977 8.90969 11.7846 9.43736 12.3009C9.93364 9.94628 13.0226 5.99729 13.5389 5.46961C14.0551 4.94193 14.0551 4.94193 14.5799 5.19721C14.9998 5.40144 14.7606 5.80428 14.5885 5.98017C11.7576 9.66536 10.487 12.8115 10.4955 13.5944C10.5041 14.3774 9.99069 15.166 9.19634 14.1306Z" fill="white"/>
    </svg>
  </SvgIcon>
);

export default CustomCheckmarkIcon;