import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import { Radio } from "@mui/material";

const CustomRadioUncheckedIcon = (props: SvgIconProps) => (
    <SvgIcon {...props} >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="white"/>
        <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#454545"/>
      </svg>
    </SvgIcon>
  );
  
  const CustomRadioCheckedIcon = (props: SvgIconProps) => (
    <SvgIcon {...props} >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="white"/>
        <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#0C8654"/>
        <circle cx="10" cy="10" r="4" fill="#0C8654"/>
      </svg>
    </SvgIcon>
  );
  
  // Custom Radio Button Component based on new Figma design
  const NewCustomRadio = (props: React.ComponentProps<typeof Radio>) => {
    return (
      <Radio
        icon={<CustomRadioUncheckedIcon />}
        checkedIcon={<CustomRadioCheckedIcon />}
        {...props}
      />
    );
  };
  
  export default NewCustomRadio;