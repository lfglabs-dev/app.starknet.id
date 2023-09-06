import React, { FunctionComponent } from "react";

const SignsIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
    >
      <path
        d="M6.73569 15C6.15791 15 6.01347 14.6389 6.01347 14.4583V8.5H3.30513L1.31902 7.05556C0.741243 6.76667 1.07828 6.4537 1.31902 6.33333L3.30513 4.88889H6.01347V2.36111C6.01347 2.24074 6.15791 2 6.73569 2C7.31347 2 7.45791 2.24074 7.45791 2.36111V14.4583C7.45791 14.6389 7.31347 15 6.73569 15Z"
        fill={color}
      />
      <path
        d="M8.36072 7.05556L7.81906 3.44444H13.0552L15.0413 4.88889C15.6191 5.17778 15.282 5.49074 15.0413 5.61111L13.2357 7.05556H8.36072Z"
        fill={color}
      />
    </svg>
  );
};

export default SignsIcon;
