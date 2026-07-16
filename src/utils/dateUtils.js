import dayjs from "dayjs";

export const formatDate = (date, format = "DD-MM-YYYY") => {
  if (!date) return "";

  const finalFormat = format.toUpperCase();
  return dayjs(date).format(finalFormat);
};

export const parseDate = (dateString, format = "DD-MM-YYYY") => {
  if (!dateString) return null;
  const finalFormat = format.toUpperCase();
  const parsed = dayjs(dateString, finalFormat);
  return parsed.isValid() ? parsed.toDate() : null;
};

export const getDaysInMonth = (year, month) => {
  return dayjs(`${year}-${month + 1}-01`).daysInMonth();
};

export const getFirstDayOfMonth = (year, month) => {
  return dayjs(`${year}-${month + 1}-01`).day();
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return dayjs(date1).isSame(dayjs(date2), "day");
};

export const isDateInRange = (date, minDate, maxDate) => {
  if (minDate && dayjs(date).isBefore(dayjs(minDate), "day")) return false;
  if (maxDate && dayjs(date).isAfter(dayjs(maxDate), "day")) return false;
  return true;
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), "day");
};

export const addMonths = (date, months) => {
  return dayjs(date).add(months, "month").toDate();
};

export const addYears = (date, years) => {
  return dayjs(date).add(years, "year").toDate();
};
