export function parseDate(year: string, day: string, hour: string,
    minute: string, seconds: string) {
  let date = Date.parse(`01-01-${year} ${hour}:${minute}:${seconds}`);
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  for (let i = 1; i < Number.parseInt(day); i++) {
    date += millisecondsInDay;
  }
  return new Date(date);
}

