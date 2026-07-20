import { useEffect, useState } from "react";

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1_500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyToClipboard(text: string | undefined): Promise<void> {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return { copied, copyToClipboard };
}
