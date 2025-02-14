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
}) => {
  return (
    <div className="relative">
      {children}
      {helperText && (
        <StyledToolTip className="cursor-pointer" title={helperText} placement="top" >
          <> </>
        </StyledToolTip>
      )}
    </div>
  );
};

export default InputHelper;
