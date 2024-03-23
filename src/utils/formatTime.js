import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function excelDateToJSDate(excelDate) {
  // Excel serial date starts from January 1, 1900
  const excelStartDate = new Date(1899, 11, 31); // December 31, 1899
  const millisecondsInDay = 24 * 60 * 60 * 1000;

  // Convert excelDate to milliseconds
  const offset = (excelDate - 1) * millisecondsInDay;

  // Calculate the date by adding the offset to the excelStartDate
  return new Date(excelStartDate.getTime() + offset);
}
