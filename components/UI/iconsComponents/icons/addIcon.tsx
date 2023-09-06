import React, { FunctionComponent } from "react";

const AddIcon: FunctionComponent<IconProps> = ({ color, width }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
    >
      <path
        d="M7.18182 12.6364V9.09091H3.36364C3.09091 9.09091 2 9.14545 2 8.27273C2 7.45455 3.09091 7.18182 3.36364 7.18182H7.18182V3.63636C7.18182 3.27273 7.12727 2 8 2C9.09091 2 9.09091 3.27273 9.09091 3.63636V7.18182H12.6364C13.1818 7.18182 14 7.4 14 8.27273C14 9.14545 12.9091 9.09091 12.6364 9.09091H9.09091V12.6364C9.09091 13 9.09091 14.2727 8 14.2727C7.12727 14.2727 7.18182 13 7.18182 12.6364Z"
        fill={color}
      />
    </svg>
  );
};

export default AddIcon;
