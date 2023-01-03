import React, { FunctionComponent } from "react";

const MintSquareIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 49 54"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.7295 23.6396L24.7846 20.6143L27.8397 23.6396L24.7846 26.665L21.7295 23.6396Z"
        fill="#333"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.74121 23.6396L24.7869 6.76025L41.8325 23.6396L24.7869 40.519L7.74121 23.6396ZM16.5972 23.6396L24.7869 31.7495L32.9766 23.6396L24.7869 15.5298L16.5972 23.6396Z"
        fill="#333"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.884766 23.6675L24.7854 -7.42609e-05L48.6861 23.6675L24.7854 47.335L0.884766 23.6675ZM2.65596 23.6675L24.7854 45.5811L46.9149 23.6675L24.7854 1.75384L2.65596 23.6675Z"
        fill="#333"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.03702 26.0249L5.03699 26.0249L0.786133 30.2343L5.03699 34.4437L20.5353 49.7908L24.7861 54.0002L29.037 49.7908L44.5353 34.4437L48.7861 30.2343L44.5353 26.0249L40.2844 30.2343L36.0336 34.4437L29.037 41.3721L24.7862 45.5814L24.7861 45.5814L20.5353 41.3721L13.5387 34.4437L9.28784 30.2343L9.28787 30.2343L5.03702 26.0249Z"
        fill="#333"
      ></path>
    </svg>
  );
};

export default MintSquareIcon;
