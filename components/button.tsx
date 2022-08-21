import React, { FunctionComponent } from "react";

type ButtonProps = {
  onClick: () => void;
  children: string;
};

const Button: FunctionComponent<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="custom-btn btn-3 uppercase hover:bg-white hover:text-red-600"
    >
      <strong>{children}</strong>
    </button>
  );
};

export default Button;
