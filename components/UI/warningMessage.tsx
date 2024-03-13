import React, { FunctionComponent } from "react";

type WarningMessageProps = {
  children: React.ReactNode;
};

const WarningMessage: FunctionComponent<WarningMessageProps> = ({
  children,
}) => {
  return (
    <div className="flex items-center justify-center bg-[#FFE6CC] px-4 py-2 rounded-lg">
      <p className=" text-base text-[#F57C00] font-bold">{children}</p>
    </div>
  );
};

export default WarningMessage;
