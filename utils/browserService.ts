export function getBrowser(userAgent: string): string | undefined {
  if (userAgent.includes("Chrome")) {
    return "chrome";
  } else if (userAgent.includes("Firefox")) {
    return "firefox";
  } else {
    return undefined;
  }
}
