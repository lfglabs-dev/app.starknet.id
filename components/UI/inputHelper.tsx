import React, { FunctionComponent, ReactNode } from "react";

type InputHelperProps = {
  children: ReactNode;
  error?: boolean;
};

const InputHelper: FunctionComponent<InputHelperProps> = ({ children, error = false }) => {
  return <>{children}</>;
};

export default InputHelper;
