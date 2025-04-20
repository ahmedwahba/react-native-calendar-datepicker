import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { useCalendarContext } from '../calendar-context';
import Day, { EmptyDay } from './day';
import {
  getParsedDate,
  getMonthDays,
  getDaysInMonth,
  areDatesOnSameDay,
  isDateBetween,
  getDayjs,
  addTime,
} from '../utils';
import Weekdays from './weekdays';
import { DateType } from 'src/types';

const Days = () => {
  const {
    mode,
    calendar,
    locale,
    numerals = 'latn',
    timeZone,
    date,
    startDate,
    endDate,
    dates,
    currentDate,
    onSelectDate,
    showOutsideDays,
    minDate,
    maxDate,
    enabledDates,
    disabledDates,
    firstDayOfWeek,
    containerHeight,
    weekdaysHeight,
    styles,
    classNames,
    weekdaysFormat,
    multiRangeMode,
    hideWeekdays,
    components,
    isRTL,
  } = useCalendarContext();

  const style = useMemo(() => createDefaultStyles(isRTL), [isRTL]);

  const { hour, minute } = getParsedDate(currentDate, calendar);

  const handleSelectDate = useCallback(
    (selectedDate: DateType) => {
      const newDate = addTime(
        getDayjs(selectedDate, calendar),
        hour,
        minute,
        calendar
      );

      onSelectDate(newDate);
    },
    [calendar, hour, minute, onSelectDate]
  );

  const containerStyle = useMemo(
    () => [style.daysContainer, styles?.days],
    [style.daysContainer, styles?.days]
  );

  const daysGrid = useMemo(() => {
    let today = dayjs().tz(timeZone);
    if (calendar === 'islamic') {
      today = getDayjs(today, calendar);
    }

    const {
      fullDaysInMonth,
      prevMonthDays,
      prevMonthOffset,
      daysInCurrentMonth,
      daysInNextMonth,
    } = getDaysInMonth(currentDate, showOutsideDays, firstDayOfWeek, calendar);

    return getMonthDays(
      currentDate,
      showOutsideDays,
      minDate,
      maxDate,
      firstDayOfWeek,
      enabledDates,
      disabledDates,
      prevMonthDays,
      prevMonthOffset,
      daysInCurrentMonth,
      daysInNextMonth,
      numerals,
      calendar
    ).map((day, index) => {
      if (!day) return null;

      let leftCrop = day.dayOfMonth === 1;
      let rightCrop = day.dayOfMonth === fullDaysInMonth;
      const isFirstDayOfMonth = day.dayOfMonth === 1;
      const isLastDayOfMonth = day.dayOfMonth === fullDaysInMonth;
      const isToday = areDatesOnSameDay(day.date, today, calendar);
      let inRange = false;
      let isSelected = false;
      let isCrop = false;
      let inMiddle = false;
      let rangeStart = false;
      let rangeEnd = false;

      if (mode === 'range') {
        rightCrop = false;
        const selectedStartDay = areDatesOnSameDay(
          day.date,
          startDate,
          calendar
        );
        const selectedEndDay = areDatesOnSameDay(day.date, endDate, calendar);
        isSelected = selectedStartDay || selectedEndDay;
        inRange = isDateBetween(day.date, { startDate, endDate }, calendar);

        if (selectedStartDay) leftCrop = true;
        if (selectedEndDay) rightCrop = true;
        if (index % 7 === 0 && !selectedStartDay) leftCrop = false;
        if (index % 7 === 6 && !selectedEndDay) rightCrop = false;

        if (
          (isFirstDayOfMonth && selectedEndDay) ||
          (isLastDayOfMonth && selectedStartDay) ||
          getDayjs(startDate, calendar).format('DDMMYYYY') ===
            getDayjs(endDate, calendar).format('DDMMYYYY')
        ) {
          inRange = false;
        }

        isCrop = inRange && (leftCrop || rightCrop) && !(leftCrop && rightCrop);
        inMiddle = inRange && !leftCrop && !rightCrop;
        rangeStart = inRange && leftCrop;
        rangeEnd = inRange && rightCrop;
      } else if (mode === 'multiple') {
        const safeDates = dates || [];
        isSelected = safeDates.some((d) =>
          areDatesOnSameDay(day.date, d, calendar)
        );

        // if the selected days in a row, implements range mode style to selected days
        if (multiRangeMode) {
          const yesterday = getDayjs(day.date, calendar).subtract(1, 'day');
          const tomorrow = getDayjs(day.date, calendar).add(1, 'day');

          const yesterdaySelected = safeDates.some((d) =>
            areDatesOnSameDay(d, yesterday, calendar)
          );
          const tomorrowSelected = safeDates.some((d) =>
            areDatesOnSameDay(d, tomorrow, calendar)
          );

          // Reset all flags
          inRange = false;
          leftCrop = false;
          rightCrop = false;

          if (isSelected) {
            // Case: both adjacent days are selected - this is a middle day
            if (yesterdaySelected && tomorrowSelected) {
              inRange = true;
            }
            // Case: only tomorrow is selected - this is the start of a range
            else if (tomorrowSelected) {
              inRange = true;
              leftCrop = true;
            }
            // Case: only yesterday is selected - this is the end of a range
            else if (yesterdaySelected) {
              inRange = true;
              rightCrop = true;
            }

            // Handle edge cases for first and last days of month
            // Only apply these special cases when the day is actually part of a range
            if (inRange) {
              if (isFirstDayOfMonth && !tomorrowSelected) {
                inRange = false;
              }
              if (isLastDayOfMonth && !yesterdaySelected) {
                inRange = false;
              }
            }
          }
          // Set derived flags based on the core flags
          isCrop = inRange && (leftCrop || rightCrop);
          inMiddle = inRange && !leftCrop && !rightCrop;
          rangeStart = inRange && leftCrop;
          rangeEnd = inRange && rightCrop;
        }
      } else if (mode === 'single') {
        isSelected = areDatesOnSameDay(day.date, date, calendar);
      }

      return {
        ...day,
        isToday,
        isSelected,
        inRange,
        leftCrop,
        rightCrop,
        isCrop,
        inMiddle,
        rangeStart,
        rangeEnd,
      };
    });
  }, [
    mode,
    calendar,
    numerals,
    timeZone,
    showOutsideDays,
    firstDayOfWeek,
    minDate,
    maxDate,
    enabledDates,
    disabledDates,
    date,
    startDate,
    endDate,
    dates,
    multiRangeMode,
    currentDate,
  ]);

  return (
    <View style={style.container} testID="day-selector">
      {!hideWeekdays ? (
        <Weekdays
          locale={locale}
          firstDayOfWeek={firstDayOfWeek}
          styles={styles}
          classNames={classNames}
          weekdaysFormat={weekdaysFormat}
          weekdaysHeight={weekdaysHeight}
          components={components}
          isRTL={isRTL}
        />
      ) : null}
      <View style={containerStyle} className={classNames?.days} testID="days">
        {daysGrid?.map((day, index) => {
          return day ? (
            <Day
              key={index}
              day={day}
              onSelectDate={handleSelectDate}
              containerHeight={containerHeight}
              weekdaysHeight={weekdaysHeight}
              styles={styles}
              classNames={classNames}
              components={components}
            />
          ) : (
            <EmptyDay key={index} />
          );
        })}
      </View>
    </View>
  );
};

const createDefaultStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
    },
    daysContainer: {
      width: '100%',
      height: '100%',
      flexWrap: 'wrap',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignContent: 'flex-start',
    },
  });

export default Days;
