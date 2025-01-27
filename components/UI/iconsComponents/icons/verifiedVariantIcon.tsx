import React, { FunctionComponent } from "react";

const verifiedVariantIcon: FunctionComponent<IconProps> = ({
  width,
  color,
}) => {
  return (
    <svg
      width={width}
      height="12"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4991_3904)">
        <circle cx="6.875" cy="6" r="5.25" fill={color} />
        <path
          d="M6.33506 8.46454C5.97685 7.97134 4.89716 6.92679 4.40209 6.46616C4.10501 6.18588 4.39191 5.53418 4.98497 5.99374C5.45942 6.36138 6.17279 7.06818 6.47018 7.37562C6.74888 5.97446 8.48733 3.62528 8.77792 3.31142C9.06851 2.99755 9.06851 2.99755 9.36419 3.14966C9.60074 3.27135 9.46615 3.51102 9.36929 3.61564C7.77613 5.8079 7.06154 7.67987 7.06663 8.14585C7.07173 8.61183 6.78283 9.08103 6.33506 8.46454Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4991_3904">
          <rect x="0.875" width="12" height="12" rx="6" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default verifiedVariantIcon;
