import React, { FunctionComponent, ReactNode } from "react";
import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";
import InfoIcon from "./iconsComponents/icons/infoIcon";

type InputHelperProps = {
  helperText?: string;
  children?: ReactNode;
  error?: boolean;
};

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

const InputHelper: FunctionComponent<InputHelperProps> = ({
  children,
  helperText,
  error = false,
}) => {
  return (
    <div className="relative">
      {children}
      {helperText ? (
        <StyledToolTip
          className="cursor-pointer"
          title={helperText}
          placement="top"
        >
          <div className="absolute top-1/2 -translate-y-1/2 right-2 bg-white">
            <InfoIcon width="28px" color={error ? "red" : "#454545"} />
          </div>
        </StyledToolTip>
      ) : null}
    </div>
  );
};

export default InputHelper;
