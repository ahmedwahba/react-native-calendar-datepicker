import dayjs from 'dayjs';
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
    return dayjs(date).toCalendarSystem('islamic');
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
  const monthNames =
    calendar === 'jalali' ? getJalaliMonths(locale) : dayjs.months();
  const monthShortNames =
    calendar === 'jalali' ? getJalaliMonths(locale) : dayjs.monthsShort();

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
  getDayjs(date, calendar).year();

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

  return (
    getDayjs(date, calendar) <= endDate && getDayjs(date, calendar) >= startDate
  );
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
 * @param {number} month - The month number (0-11) to check the length of
 * @returns {number} The number of days in the specified Hijri month (29 or 30)
 *
 * @example
 * // Get the number of days in the 9th month (Ramadan) of the current Hijri year
 * const daysInRamadan = getDaysInHijriMonth(dayjs().calendar('islamic'), 8);
 *
 * @example
 * // Determine days in a specific Hijri month
 * const specificMonth = getDaysInHijriMonth(dayjs('1445-04-01').toCalendarSystem('islamic'), 5);
 *
 * @note
 * - The function uses the Umm al-Qura calendar system (en-SA locale)
 * - Month indexing starts at 0 (0 = Muharram, 11 = Dhu al-Hijjah)
 * - Relies on locale-specific Islamic calendar conversion
 */
export function getDaysInHijriMonth(date: dayjs.Dayjs, month: number): number {
  const lastDay = date.month(month).date(30);
  const lastHijriDay = new Date(lastDay.toString()).toLocaleDateString(
    'en-SA-u-ca-islamic-umalqura'
  );
  return lastHijriDay.split('/')[0] === '30' ? 30 : 29;
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
    daysInCurrentMonth = getDaysInHijriMonth(currentDate, currentDate.month());
    prevMonthDays = getDaysInHijriMonth(currentDate, currentDate.month() - 1);
  }

  const firstDay = currentDate.date(1 - firstDayOfWeek);
  const prevMonthOffset = (firstDay as dayjs.Dayjs).day() % 7;
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
  return date
    ? getDayjs(dayjs.tz(date, timeZone).startOf('day'), calendar)
    : undefined;
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
        const number = index + (prevMonthDays - prevMonthOffset + 1);
        const thisDay = date.month(date.month() - 1).date(number);
        return generateCalendarDay(
          number,
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
    const thisDay = date.date(day);
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
    const thisDay = date.month(date.month() + 1).date(day);
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
  const startOfWeek = getDayjs(date, calendar)
    .startOf('week')
    .add(firstDayOfWeek, 'day');

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
