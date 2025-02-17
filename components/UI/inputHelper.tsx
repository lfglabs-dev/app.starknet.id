import React, { FunctionComponent, ReactNode } from "react";


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
       <div className="text-sm text-gray-500 mt-1">         
       {helperText}
      </div>
    )}
    </div>
  );
};

export default InputHelper;
