import React, { FunctionComponent, ReactNode } from "react";
import StyledToolTip from "./styledTooltip";


type InputHelperProps = {
  children: ReactNode;
  helperText?: string;
  error?: boolean;
};

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
          <div className="absolute top-1/2 -translate-y-1/2 right-2">
            
          </div>
        </StyledToolTip>
      ) : null}
    </div>
  );
};

export default InputHelper;
