import Image, { ImageProps, StaticImageData } from "next/image";
import React, { ImgHTMLAttributes } from "react";
import cdnize from "../../utils/cdnize";

export const CDNImg: React.FC<ImgHTMLAttributes<HTMLImageElement>> = ({
  src,
  ...props
}) => {
  return <img src={src ? cdnize(src) : src} {...props} />;
};

type ImageSrc = string | StaticImageData;

interface CDNImageProps extends Omit<ImageProps, "src"> {
  src: ImageSrc;
}

export const CDNImage: React.FC<CDNImageProps> = ({ src, ...props }) => {
  let imagePath: string;

  if (typeof src === "string") {
    imagePath = src ? cdnize(src) : src;
  } else {
    // if src is not an URL, we can't use the CDN
    imagePath = src.src;
  }

  return <Image src={imagePath} {...props} />;
};
