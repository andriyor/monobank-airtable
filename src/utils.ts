import { addDays, differenceInDays, getUnixTime } from 'date-fns';

type Range = {
  from: string;
  to: string;
};

// Monobank only returns up to 31 days per statement request, so split the
// requested span into 30-day windows.
export const dateRange = (startDate: Date, endDate: Date, step = 1) => {
  const ranges: Range[] = [];
  while (Math.abs(differenceInDays(startDate, endDate)) > step) {
    const currentStartDate = startDate;
    startDate = addDays(startDate, 30);
    ranges.push({
      from: getUnixTime(currentStartDate).toString(),
      to: getUnixTime(startDate).toString(),
    });
  }
  ranges.push({
    from: getUnixTime(startDate).toString(),
    to: getUnixTime(endDate).toString(),
  });
  return ranges;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
