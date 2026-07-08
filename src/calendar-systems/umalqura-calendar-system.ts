import HijriCalendarSystem from '@calidy/dayjs-calendarsystems/calendarSystems/HijriCalendarSystem';
import umalqura from '@umalqura/core';

/**
 * Islamic calendar system for dayjs, backed by `@umalqura/core` (Umm al-Qura).
 *
 * The calidy dayjs-calendarsystems package ships a `HijriCalendarSystem` that
 * uses a tabular (Fourmilab) arithmetic algorithm which disagrees with the
 * astronomical Umm al-Qura calendar by up to a day. Since every other Hijri
 * computation in this library already flows through `@umalqura/core`, we
 * subclass the calidy system and override just the Hijri <-> Gregorian
 * conversion so all dayjs Islamic operations (`.year`, `.month`, `.date`,
 * `.add`, `.startOf`, `.toCalendarSystem`, clone, ...) stay internally
 * consistent with Umm al-Qura. Localized month names and the Intl-based
 * `intlCalendar = 'islamic-umalqura'` setup are inherited from the base
 * class unchanged.
 */
export default class UmalquraCalendarSystem extends HijriCalendarSystem {
  /**
   * Converts a Gregorian date to Umm al-Qura Hijri.
   *
   * @returns Hijri `{ year, month, day }` where `month` is 0-based to match
   *   what the calidy plugin expects (it writes the result directly into
   *   `$y`, `$M`, `$D`).
   */
  convertFromGregorian(
    date:
      | Date
      | { year: number; month: number; day: number }
      | { $y: number; $M: number; $D: number }
      | string
      | number
      | undefined
      | null
  ): { year: number; month: number; day: number } {
    const gregorian = this.validateDate(date);
    const hijri = umalqura(gregorian);
    return { year: hijri.hy, month: hijri.hm - 1, day: hijri.hd };
  }

  /**
   * Converts an Umm al-Qura Hijri date to Gregorian.
   *
   * The calidy plugin invokes this from `$set`, `startOf`, `add`, and
   * `toCalendarSystem('gregory')` with a 0-based month. When
   * `startOf('week')` or similar routines pass a `day` outside the Hijri
   * month's real range, we mirror the JS `Date`-style roll-over by
   * anchoring to the 1st of the target month and shifting by `day - 1`
   * days (`hijriToGregorian` itself rejects out-of-range days).
   */
  convertToGregorian(
    year: number,
    month: number,
    day: number,
    _hour?: number,
    _minute?: number,
    _second?: number,
    _millisecond?: number
  ): { year: number; month: number; day: number } {
    const daysInMonth = this.safeDaysInMonth(year, month);
    if (day >= 1 && day <= daysInMonth) {
      const g = umalqura.$.hijriToGregorian(year, month + 1, day);
      return { year: g.gy, month: g.gm, day: g.gd };
    }

    const anchor = umalqura.$.hijriToGregorian(year, month + 1, 1);
    const shifted = umalqura.$.addDays(
      new Date(anchor.gy, anchor.gm, anchor.gd),
      day - 1
    );
    return {
      year: shifted.getFullYear(),
      month: shifted.getMonth(),
      day: shifted.getDate(),
    };
  }

  /**
   * Number of days in the given Hijri month. The calidy plugin calls this
   * with the 0-based month it stores in `$M`, so we bridge to the 1-based
   * API `@umalqura/core` exposes.
   *
   * Parameters are typed optional so the widened signature stays assignable
   * to the base class' declared zero-arg `daysInMonth?(): number` while
   * still accepting the two arguments the plugin passes at runtime.
   */
  daysInMonth(year?: number, month?: number): number {
    if (year === undefined || month === undefined) {
      const self = this as unknown as { $y: number; $M: number };
      return this.safeDaysInMonth(self.$y, self.$M);
    }
    return this.safeDaysInMonth(year, month);
  }

  isLeapYear(): boolean {
    const hy = (this as unknown as { $y: number }).$y;
    return umalqura.$.isLeapYear(hy);
  }

  /**
   * Julian day conversions aren't exposed by `@umalqura/core` and no code
   * path in this library reaches them. Throw a clear error if a consumer
   * ever calls into them so the failure is obvious rather than silent.
   */
  convertFromJulian(_julianDay: number): [number, number, number] {
    throw new Error(
      'UmalquraCalendarSystem: convertFromJulian is not supported'
    );
  }

  convertToJulian(_year: number, _month: number, _day: number): number {
    throw new Error('UmalquraCalendarSystem: convertToJulian is not supported');
  }

  private safeDaysInMonth(year: number, month: number): number {
    try {
      return umalqura.$.getDaysInMonth(year, month + 1);
    } catch {
      return 30;
    }
  }
}
