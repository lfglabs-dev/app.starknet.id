// hard to test because of ENV variables
export default function cdnize(src: string): string {
  return process.env.NODE_ENV === "production" && src.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_CDN_URL}${src}`
    : src;
}
