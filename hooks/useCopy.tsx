import { useState } from "react";

export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    setCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return { copied, copyToClipboard };
};
