import React, { FunctionComponent } from "react";

const ArrowRightIcon: FunctionComponent<IconProps> = ({
  width,
  className,
  color,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.20877 13.6752C8.21048 13.8496 12.6031 13.7478 14.5492 13.6752C14.0627 14.4018 13.0479 16.0294 12.8811 16.7269C12.6725 17.5989 13.7151 17.8169 14.1321 16.9449C14.5492 16.073 16.8428 14.3291 18.3024 13.4572C19.762 12.5853 18.5109 11.4954 18.3024 11.4954C18.0939 11.4954 15.3833 9.75149 14.9663 8.66158C14.5493 7.57167 13.0897 6.91772 13.0897 8.22561C13.0897 9.53351 15.3833 11.2774 14.9663 11.4954C14.6326 11.6697 8.98893 11.7133 6.20877 11.7133C5.78406 11.7133 5 11.8347 5 12.8326C5 13.237 5.37726 13.6027 6.20877 13.6752Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowRightIcon;
