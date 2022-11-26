export function timeStampToDate(timeStamp: string): string {
  const date = new Date(Number(timeStamp) * 1000);
  const dateFormat = date.getMinutes() + ", " + date.toDateString();

  return dateFormat;
}
