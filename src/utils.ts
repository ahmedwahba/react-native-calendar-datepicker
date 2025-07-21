import dayjs, { isDayjs } from 'dayjs';
import type {
  DateType,
  CalendarDay,
  CalendarMonth,
  CalendarWeek,
  Numerals,
  CalendarType,
} from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRef } from 'react';
import { isEqual } from 'lodash';
import { numeralSystems } from './numerals';
import umalqura from '@umalqura/core';

export const CALENDAR_FORMAT = 'YYYY-MM-DD HH:mm';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const YEAR_PAGE_SIZE = 12;
export const VALID_JALALI_LOCALES = new Set(['fa', 'en']);
export const JALALI_MONTHS = {
  en: [
    'Farvardin',
    'Ordibehesht',
    'Khordad',
    'Tir',
    'Mordad',
    'Shahrivar',
    'Mehr',
    'Aban',
    'Azar',
    'Dey',
    'Bahman',
    'Esfand',
  ],
  fa: [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ],
};

export const isValidJalaliLocale = (locale: string): boolean =>
  VALID_JALALI_LOCALES.has(locale);

export const getJalaliMonths = (locale: string) =>
  JALALI_MONTHS[locale as 'fa' | 'en'] || JALALI_MONTHS.en;

export const getMonths = () => dayjs.months();

export const getMonthName = (month: number) => dayjs.months()[month];

export const convertHijriToGregorian = (umalquraDate: umalqura.UmAlQura) => {
  return umalqura.$.hijriToGregorian(
    umalquraDate.hy,
    umalquraDate.hm,
    umalquraDate.hd
  );
};

export const adjustDayjsHijriDate = (
  dayjsDate: dayjs.Dayjs,
  hijriDate?: umalqura.UmAlQura
): dayjs.Dayjs => {
  let umalquraDate = hijriDate;
  if (!umalquraDate && isDayjs(dayjsDate)) {
    umalquraDate = umalqura(
      new Date(dayjsDate.year(), dayjsDate.month(), dayjsDate.get('date'))
    );
  }
  if (!umalquraDate) {
    umalquraDate = umalqura(new Date(dayjs(dayjsDate).toDate()));
  }
  const gregoryDate = convertHijriToGregorian(umalquraDate);
  let validDate;
  if ((dayjsDate as any).$C === 'islamic') {
    validDate = dayjsDate
      .year(umalquraDate.hy)
      .set('date', umalquraDate.hd)
      .month(umalquraDate.hm - 1);
  } else {
    validDate = dayjs(dayjsDate)
      .toCalendarSystem('islamic')
      .year(umalquraDate.hy)
      .month(umalquraDate.hm - 1);
  }
  (validDate as any).$M = umalquraDate.hm - 1;
  (validDate as any).$C_M = umalquraDate.hm - 1;
  (validDate as any).$D = umalquraDate.hd;
  (validDate as any).$C_D = umalquraDate.hd;
  (validDate as any).$y = umalquraDate.hy;
  (validDate as any).$C_y = umalquraDate.hy;
  (validDate as any).$G_D = gregoryDate.gd;
  (validDate as any).$G_M = gregoryDate.gm;
  (validDate as any).$G_y = gregoryDate.gy;
  (validDate as any).$W = umalquraDate.dayOfWeek;
  return validDate;
};

/**
 * Converts a date to a dayjs object with optional Islamic calendar support.
 *
 * @param {DateType} date - The input date to convert (can be any value dayjs accepts)
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 * @returns {Dayjs} A dayjs object in either the default or Islamic calendar system
 *
 * @example
 * // Get a standard dayjs object in the Geogorian calendar
 * const standard = getDayjs('2025-03-20');
 *
 * @example
 * // Get a dayjs object of a date in the Hijri calendar
 * const hijri = getDayjs('2025-03-20', 'islamic');
 */
export const getDayjs = (date: DateType, calendar?: CalendarType) => {
  if (date === undefined) {
    date = new Date();
  }
  if (calendar === 'islamic') {
    if (date && (date as any).$C === 'islamic') {
      return date as dayjs.Dayjs;
    }
    const dayjsHijri = adjustDayjsHijriDate(date as dayjs.Dayjs);

    return dayjsHijri as dayjs.Dayjs;
  }
  return dayjs(date);
};

/**
 * Get months array
 *
 * @returns months array
 */
export const getMonthsArray = ({
  calendar,
  locale,
}: {
  calendar: CalendarType;
  locale: string;
}): CalendarMonth[] => {
  let monthNames: string[] = dayjs.months();
  let monthShortNames: string[] = dayjs.monthsShort();
    if (calendar === 'islamic') {
      umalqura.locale(locale);
      monthNames = umalqura.months();
      monthShortNames = umalqura.monthsShort();
    }
    else if (calendar === 'jalali') {
      monthNames = getJalaliMonths(locale);
      monthShortNames = getJalaliMonths(locale);
    }
  return monthNames.map((name, index) => ({
    index,
    name: {
      full: name,
      short: monthShortNames[index] || '',
    },
    isSelected: false,
  }));
};

/**
 * Get weekdays
 *
 * @param locale - locale
 * @param firstDayOfWeek - first day of week
 * @param format - format short, min or full
 *
 * @returns weekdays
 */
export const getWeekdays = (
  locale: string,
  firstDayOfWeek: number
): CalendarWeek[] => {
  dayjs.locale(locale);

  const weekdayNames = dayjs.weekdays();
  const weekdayShortNames = dayjs.weekdaysShort();
  const weekdayMinNames = dayjs.weekdaysMin();

  let weekdays: CalendarWeek[] = weekdayNames.map((name, index) => ({
    index,
    name: {
      full: name,
      short: weekdayShortNames[index] || '',
      min: weekdayMinNames[index] || '',
    },
  }));

  if (firstDayOfWeek > 0) {
    weekdays = [
      ...weekdays.slice(firstDayOfWeek, weekdays.length),
      ...weekdays.slice(0, firstDayOfWeek),
    ] as CalendarWeek[];
  }
  return weekdays;
};

export const getFormated = (date: DateType, calendar?: CalendarType) =>
  getDayjs(date, calendar).format(CALENDAR_FORMAT);

export const getDateMonth = (date: DateType, calendar?: CalendarType) =>
  getDayjs(date, calendar).month();

export const getDateYear = (date: DateType, calendar?: CalendarType) =>
  getDayjs(date as dayjs.Dayjs, calendar).year();

/**
 * Check if two dates are on the same day
 *
 * @param a - date to check
 * @param b - date to check
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns true if dates are on the same day, false otherwise
 */
export function areDatesOnSameDay(
  a: DateType,
  b: DateType,
  calendar?: CalendarType
) {
  if (!a || !b) {
    return false;
  }

  const date_a = getDayjs(a, calendar).format(DATE_FORMAT);
  const date_b = getDayjs(b, calendar).format(DATE_FORMAT);

  return date_a === date_b;
}

export function isHijriDateBetween(
  date: DateType,
  startDate: DateType,
  endDate: DateType
) {
  const current = getDayjs(date, 'islamic');
  const start = startDate as dayjs.Dayjs;
  const end = endDate as dayjs.Dayjs;

  const isBeforeEnd = () => {
    if (current.year() > end.year()) return false;
    if (current.year() < end.year()) return true;
    if (current.month() > end.month()) return false;
    if (current.month() < end.month()) return true;
    return current.date() <= end.date();
  };

  const isAfterStart = () => {
    if (start.year() > current.year()) return false;
    if (start.year() < current.year()) return true;
    if (start.month() > current.month()) return false;
    if (start.month() < current.month()) return true;
    return start.date() <= current.date();
  };
  return isAfterStart() && isBeforeEnd();
}

/**
 * Check if date is between two dates
 *
 * @param date - date to check
 * @param options - options
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns true if date is between two dates, false otherwise
 */
export function isDateBetween(
  date: DateType,
  {
    startDate,
    endDate,
  }: {
    startDate?: DateType;
    endDate?: DateType;
  },
  calendar?: CalendarType
): boolean {
  if (!startDate || !endDate) {
    return false;
  }
  let isBetween =
    getDayjs(date, calendar) <= endDate &&
    getDayjs(date, calendar) >= startDate;
  if (calendar === 'islamic') {
    isBetween = isHijriDateBetween(date, startDate, endDate);
  }

  return isBetween;
}

/**
 * Check if date is disabled
 *
 * @param date - date to check
 * @param options - options
 *
 * @returns true if date is disabled, false otherwise
 */
export function isDateDisabled(
  date: dayjs.Dayjs,
  {
    minDate,
    maxDate,
    enabledDates,
    disabledDates,
    calendar = 'gregory',
  }: {
    minDate?: DateType;
    maxDate?: DateType;
    enabledDates?: DateType[] | ((date: DateType) => boolean) | undefined;
    disabledDates?: DateType[] | ((date: DateType) => boolean) | undefined;
    calendar?: CalendarType;
  }
): boolean {
  if (minDate && date.isBefore(getDayjs(minDate, calendar).startOf('day'))) {
    return true;
  }
  if (maxDate && date.isAfter(getDayjs(maxDate, calendar).endOf('day'))) {
    return true;
  }

  if (enabledDates) {
    if (Array.isArray(enabledDates)) {
      const isEnabled = enabledDates.some((enabledDate) =>
        areDatesOnSameDay(date, enabledDate, calendar)
      );
      return !isEnabled;
    } else if (enabledDates instanceof Function) {
      return !enabledDates(date);
    }
  } else if (disabledDates) {
    if (Array.isArray(disabledDates)) {
      const isDisabled = disabledDates.some((disabledDate) =>
        areDatesOnSameDay(date, disabledDate, calendar)
      );
      return isDisabled;
    } else if (disabledDates instanceof Function) {
      return disabledDates(date);
    }
  }

  return false;
}

/**
 * Check if year is disabled
 *
 * @param year - year to check
 * @param options - options
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns true if year is disabled, false otherwise
 */
export function isYearDisabled(
  year: number,
  {
    minDate,
    maxDate,
  }: {
    minDate?: DateType;
    maxDate?: DateType;
  },
  calendar?: CalendarType
): boolean {
  if (minDate && year < getDateYear(minDate, calendar)) return true;
  if (maxDate && year > getDateYear(maxDate, calendar)) return true;

  return false;
}

/**
 * Check if month is disabled
 *
 * @param month - month to check
 * @param date - date to check
 * @param options - options
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns true if month is disabled, false otherwise
 */
export function isMonthDisabled(
  month: number,
  date: DateType,
  {
    minDate,
    maxDate,
  }: {
    minDate?: DateType;
    maxDate?: DateType;
  },
  calendar?: CalendarType
): boolean {
  if (
    minDate &&
    month < getDateMonth(minDate, calendar) &&
    getDateYear(date, calendar) === getDateYear(minDate, calendar)
  )
    return true;
  if (
    maxDate &&
    month > getDateMonth(maxDate, calendar) &&
    getDateYear(date, calendar) === getDateYear(maxDate, calendar)
  )
    return true;

  return false;
}

/**
 * Get formated date
 *
 * @param date - date to get formated date from
 * @param format - format to get formated date from
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns formated date
 */
export const getFormatedDate = (
  date: DateType,
  format: string,
  calendar?: CalendarType
) => getDayjs(date, calendar).format(format);

/**
 * Get date
 *
 * @param date - date to get
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns date
 */
export const getDate = (date: DateType, calendar?: CalendarType) =>
  getDayjs(date, calendar);

/**
 * Get year range
 *
 * @param year - year to get year range from
 *
 * @returns year range
 */
export const getYearRange = (year: number) => {
  const endYear = YEAR_PAGE_SIZE * Math.ceil(year / YEAR_PAGE_SIZE);
  let startYear = endYear === year ? endYear : endYear - YEAR_PAGE_SIZE;

  if (startYear < 0) {
    startYear = 0;
  }
  return Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => startYear + i);
};

/**
 * Determines the number of days in a specific month of the Islamic (Hijri) calendar.
 *
 * This function calculates the number of days in a given Hijri month by checking
 * the last day's representation in the Islamic calendar. Most Hijri months are
 * either 29 or 30 days long.
 *
 * @param {dayjs.Dayjs} date - A dayjs object representing a reference date in the Islamic calendar
 * @returns {number} The number of days in the specified Hijri month (29 or 30)
 *
 * @example
 * // Determine days in a specific Hijri month
 * const specificMonth = getDaysInHijriMonth(dayjs('1446-04-01').toCalendarSystem('islamic'));
 *
 * @note
 * - The function uses the Umm al-Qura calendar system
 * - Month indexing starts at 1 (1 = Muharram, 12 = Dhu al-Hijjah) so +1 is added
 * - Relies on @umalqura/core calendar conversion
 */
export function getDaysInHijriMonth(date: dayjs.Dayjs): number {
  const lastDay = umalqura(date.year(), date.month() + 1, 30);
  return lastDay.hd === 30 ? 30 : 29;
}

/**
 * Get days in month
 *
 * @param date - date to get days in month from
 * @param showOutsideDays - whether to show outside days
 * @param firstDayOfWeek - first day of week, number 0-6, 0 – Sunday, 6 – Saturday
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns days in month
 */
export function getDaysInMonth(
  date: DateType,
  showOutsideDays: boolean | undefined,
  firstDayOfWeek: number,
  calendar?: CalendarType
) {
  const currentDate = getDayjs(date, calendar);
  let daysInCurrentMonth = currentDate.daysInMonth();
  let prevMonthDays = currentDate.add(-1, 'month').daysInMonth();
  if (calendar === 'islamic') {
    daysInCurrentMonth = getDaysInHijriMonth(currentDate);
    prevMonthDays = getDaysInHijriMonth(
      currentDate.month(currentDate.month() - 1)
    );
  }

  const firstDay = currentDate.date(1 - firstDayOfWeek);
  let prevMonthOffset = (firstDay as dayjs.Dayjs).day() % 7;
  if (calendar === 'islamic') {
    prevMonthOffset = umalqura(
      currentDate.year(),
      currentDate.month() + 1,
      1
    ).dayOfWeek;
  }
  const daysInPrevMonth = showOutsideDays ? prevMonthOffset : 0;
  const monthDaysOffset = prevMonthOffset + daysInCurrentMonth;
  const daysInNextMonth = showOutsideDays
    ? monthDaysOffset > 35
      ? 42 - monthDaysOffset
      : 35 - monthDaysOffset
    : 0;

  const fullDaysInMonth =
    daysInPrevMonth + daysInCurrentMonth + daysInNextMonth;

  return {
    prevMonthDays,
    prevMonthOffset,
    daysInCurrentMonth,
    daysInNextMonth,
    fullDaysInMonth,
  };
}

/**
 * Get first day of month
 *
 * @param date - date to get first day of month from
 * @param firstDayOfWeek - first day of week, number 0-6, 0 – Sunday, 6 – Saturday
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns first day of month
 */
export function getFirstDayOfMonth(
  date: DateType,
  firstDayOfWeek: number,
  calendar?: CalendarType
): number {
  const d = getDate(date, calendar);
  return (d.date(1 - firstDayOfWeek) as dayjs.Dayjs).day();
}

/**
 * Get start of day
 *
 * @param date - date to get start of day from
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns start of day
 */
export function getStartOfDay(
  date: DateType,
  calendar?: CalendarType
): DateType {
  return getDayjs(date, calendar).startOf('day');
}

/**
 * Get end of day
 *
 * @param date - date to get end of day from
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns end of day
 */
export function getEndOfDay(date: DateType, calendar?: CalendarType): DateType {
  return getDayjs(date, calendar).endOf('day');
}

/**
 * Convert date to unix timestamp
 *
 * @param date - date to convert
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns unix timestamp
 */
export function dateToUnix(date: DateType, calendar?: CalendarType): number {
  if (calendar === 'islamic' && date) {
    const dayjsDate = date as dayjs.Dayjs;
    const umalquraDate = umalqura(
      dayjsDate.year(),
      dayjsDate.month() + 1,
      dayjsDate.get('date')
    );
    const gregoryDate = convertHijriToGregorian(umalquraDate);
    const dateTime = new Date(gregoryDate.gy, gregoryDate.gm, gregoryDate.gd);
    return dateTime.getTime() / 1000;
  }
  return getDayjs(date, calendar).unix();
}

/**
 * Remove time from date
 *
 * @param date - date to remove time from
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns date with time removed
 */
export function removeTime(
  date: DateType,
  timeZone: string | undefined,
  calendar?: CalendarType
): DateType {
  if (!date) {
    return undefined;
  }
  if (calendar === 'islamic') {
    let hijriDate = date as dayjs.Dayjs;
    (hijriDate as any).$H = 0;
    (hijriDate as any).$m = 0;
    return hijriDate;
  }

  return dayjs(dayjs.tz(date, timeZone).startOf('day'));
}

/**
 * Get detailed date object
 *
 * @param date Get detailed date object
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns parsed date object
 */
export const getParsedDate = (date: DateType, calendar?: CalendarType) => {
  const dayjsDate = getDayjs(date, calendar);
  return {
    year: dayjsDate.year(),
    month: dayjsDate.month(),
    hour: dayjsDate.hour(),
    hour12: parseInt(dayjsDate.format('hh')),
    minute: dayjsDate.minute(),
    period: dayjsDate.format('A'),
  };
};

export const addTime = (
  date: dayjs.Dayjs,
  calendar?: CalendarType,
  hour?: number,
  minute?: number
) => {
  if (calendar === 'islamic') {
    let hijriDateTime = date;
    if (hour) (hijriDateTime as any).$H = hour;
    if (minute) (hijriDateTime as any).$m = minute;

    return hijriDateTime;
  }
  if (hour && minute) {
    return date.hour(hour).minute(minute);
  }
  if (hour && !minute) {
    return date.hour(hour);
  }
  if (minute && !hour) {
    return date.minute(minute);
  }

  return date.hour(0).minute(0);
};

const getPrevHijriDate = (date: dayjs.Dayjs, dateDay: number) => {
  const prevMonthIndex = date.month() === 0 ? 11 : date.month() - 1;
  const year = date.month() === 0 ? date.year() - 1 : date.year();
  const hijriDate = umalqura(year, prevMonthIndex + 1, dateDay);

  return adjustDayjsHijriDate(date, hijriDate);
};

const getNextHijriDate = (date: dayjs.Dayjs, dateDay: number) => {
  const nextMonthIndex = date.month() === 11 ? 0 : date.month() + 1;
  const year = date.month() === 11 ? date.year() + 1 : date.year();
  const hijriDate = umalqura(year, nextMonthIndex + 1, dateDay);

  return adjustDayjsHijriDate(date, hijriDate);
};

/**
 * Calculate month days array based on current date
 *
 * @param datetime - The current date that selected
 * @param showOutsideDays
 * @param minDate - min selectable date
 * @param maxDate - max selectable date
 * @param firstDayOfWeek - first day of week, number 0-6, 0 – Sunday, 6 – Saturday
 * @param enabledDates - array of enabled dates, or a function that returns true for a given date (takes precedence over disabledDates)
 * @param disabledDates - array of disabled dates, or a function that returns true for a given date
 * @param prevMonthDays - number of days in the previous month
 * @param prevMonthOffset - number of days to offset the previous month
 * @param daysInCurrentMonth - number of days in the current month
 * @param daysInNextMonth - number of days in the next month
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns days array based on current date
 */
export const getMonthDays = (
  datetime: DateType,
  showOutsideDays: boolean,
  minDate: DateType,
  maxDate: DateType,
  firstDayOfWeek: number,
  enabledDates: DateType[] | ((date: DateType) => boolean) | undefined,
  disabledDates: DateType[] | ((date: DateType) => boolean) | undefined,
  prevMonthDays: number,
  prevMonthOffset: number,
  daysInCurrentMonth: number,
  daysInNextMonth: number,
  numerals: Numerals,
  calendar?: CalendarType
): CalendarDay[] => {
  const date = getDayjs(datetime, calendar);

  const prevDays = showOutsideDays
    ? Array.from({ length: prevMonthOffset }, (_, index) => {
        const prevDay = index + (prevMonthDays - prevMonthOffset + 1);
        let thisDay = date.month(date.month() - 1).set('date', prevDay);
        if (calendar === 'islamic') {
          thisDay = getPrevHijriDate(date, prevDay);
        }

        return generateCalendarDay(
          prevDay,
          thisDay as dayjs.Dayjs,
          minDate,
          maxDate,
          enabledDates,
          disabledDates,
          false,
          index + 1,
          firstDayOfWeek,
          numerals,
          calendar
        );
      })
    : Array(prevMonthOffset).fill(null);

  const currentDays = Array.from({ length: daysInCurrentMonth }, (_, index) => {
    const day = index + 1;
    let thisDay = date.set('date', day);
    if (calendar === 'islamic') {
      const hijriDate = umalqura(date.year(), date.month() + 1, day);
      thisDay = adjustDayjsHijriDate(date, hijriDate);
    }
    return generateCalendarDay(
      day,
      thisDay as dayjs.Dayjs,
      minDate,
      maxDate,
      enabledDates,
      disabledDates,
      true,
      prevMonthOffset + day,
      firstDayOfWeek,
      numerals,
      calendar
    );
  });

  const nextDays = Array.from({ length: daysInNextMonth }, (_, index) => {
    const day = index + 1;
    let thisDay = date.month(date.month() + 1).date(day);
    if (calendar === 'islamic') {
      thisDay = getNextHijriDate(date, day);
    }
    return generateCalendarDay(
      day,
      thisDay as dayjs.Dayjs,
      minDate,
      maxDate,
      enabledDates,
      disabledDates,
      false,
      daysInCurrentMonth + prevMonthOffset + day,
      firstDayOfWeek,
      numerals,
      calendar
    );
  });

  return [...prevDays, ...currentDays, ...nextDays];
};

const getStartOfHijriWeek = (date: dayjs.Dayjs) => {
  const hijriDate = umalqura(date.year(), date.month() + 1, date.get('date'));
  return adjustDayjsHijriDate(date, hijriDate.startOf('week'));
};

/**
 * Generate day object for displaying inside day cell
 *
 * @param number - number of day
 * @param date - calculated date based on day, month, and year
 * @param minDate - min selectable date
 * @param maxDate - max selectable date
 * @param enabledDates - array of enabled dates, or a function that returns true for a given date (takes precedence over disabledDates)
 * @param disabledDates - array of disabled dates, or a function that returns true for a given date
 * @param isCurrentMonth - define the day is in the current month
 * @param dayOfMonth - number the day in the current month
 * @param firstDayOfWeek - first day of week, number 0-6, 0 – Sunday, 6 – Saturday
 * @param {CalendarType} [calendar] - Optional calendar type to use ('islamic' for Hijri calendar)
 *
 * @returns days object based on current date
 */
const generateCalendarDay = (
  number: number,
  date: dayjs.Dayjs,
  minDate: DateType,
  maxDate: DateType,
  enabledDates: DateType[] | ((date: DateType) => boolean) | undefined,
  disabledDates: DateType[] | ((date: DateType) => boolean) | undefined,
  isCurrentMonth: boolean,
  dayOfMonth: number,
  firstDayOfWeek: number,
  numerals: Numerals,
  calendar?: CalendarType
) => {
  let startOfWeek = getDayjs(date, calendar)
    .startOf('week')
    .add(firstDayOfWeek, 'day');
  if (calendar === 'islamic') {
    startOfWeek = getStartOfHijriWeek(date);
  }

  return {
    text: formatNumber(number, numerals),
    number,
    date: date,
    isDisabled: isDateDisabled(date, {
      minDate,
      maxDate,
      enabledDates,
      disabledDates,
    }),
    isCurrentMonth,
    dayOfMonth,
    isStartOfWeek: date.isSame(startOfWeek, 'day'),
    isEndOfWeek: date.day() === (firstDayOfWeek + 6) % 7,
  };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deep compare memo
 *
 * @param value - value to compare
 * @param deps - dependencies
 *
 * @returns memoized value
 */
export function useDeepCompareMemo<T>(value: T, deps: any[]): T {
  const ref = useRef<T>();
  const depsRef = useRef<any[]>();

  if (
    !depsRef.current ||
    !deps.every((dep, i) => isEqual(dep, depsRef.current![i]))
  ) {
    ref.current = value;
    depsRef.current = deps;
  }

  return ref.current as T;
}

function getDigitMap(numerals: Numerals): Record<string, string> {
  const digitMap: Record<string, string> = {};
  const numeralDigits = numeralSystems[numerals];

  for (let i = 0; i < 10; i++) {
    digitMap[i.toString()] = numeralDigits[i]!;
  }

  return digitMap;
}

function replaceDigits(input: string, numerals: Numerals): string {
  const digitMap = getDigitMap(numerals);
  return input.replace(/\d/g, (digit) => digitMap[digit] || digit);
}

export function formatNumber(value: number, numerals: Numerals): string {
  return replaceDigits(value.toString(), numerals);
}
