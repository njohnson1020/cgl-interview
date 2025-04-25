import Holidays from 'date-holidays';

// utitlity function to get the current date
export function getCurrentDate(): Date {
  return new Date();
}

// utility function to check if a date is a bank holiday in the UK
export function isBankHoliday(date: Date): boolean {
  const hd = new Holidays('GB', 'england');
  const holidays = hd.getHolidays(2025);

  return holidays.some((holiday) => {
    const holidayDate = new Date(holiday.date);
    return (
      date.getDate() === holidayDate.getDate() &&
      date.getMonth() === holidayDate.getMonth() &&
      date.getFullYear() === holidayDate.getFullYear()
    );
  });
}
