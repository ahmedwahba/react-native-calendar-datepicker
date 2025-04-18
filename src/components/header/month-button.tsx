import React, { memo } from 'react';
import dayjs from 'dayjs';
import { Pressable, Text, View } from 'react-native';
import { useCalendarContext } from '../../calendar-context';
import { adjustDayjsHijriDate, isValidJalaliLocale } from '../../utils';

const MonthButton = () => {
  const {
    currentDate,
    calendarView,
    setCalendarView,
    calendar = 'gregory',
    locale,
    styles,
    classNames,
    disableMonthPicker,
    monthCaptionFormat,
  } = useCalendarContext();
  let date =
    calendar === 'jalali'
      ? dayjs(currentDate).calendar(calendar)
      : dayjs(currentDate).toCalendarSystem('gregory');
  if (calendar === 'islamic') {
    date =
      (currentDate as any).$C === 'islamic'
        ? (currentDate as dayjs.Dayjs)
        : adjustDayjsHijriDate(currentDate as dayjs.Dayjs);
  }

  const currentMonthText = (date as dayjs.Dayjs)
    ?.locale(
      calendar === 'jalali' && !isValidJalaliLocale(locale) ? 'en' : locale
    )
    .format(monthCaptionFormat === 'full' ? 'MMMM' : 'MMM');

  return (
    <Pressable
      disabled={disableMonthPicker}
      onPress={() =>
        setCalendarView(calendarView === 'month' ? 'day' : 'month')
      }
      testID="btn-month"
      accessibilityRole="button"
      accessibilityLabel={currentMonthText}
    >
      <View
        style={styles?.month_selector}
        className={classNames?.month_selector}
      >
        <Text
          style={styles?.month_selector_label}
          className={classNames?.month_selector_label}
        >
          {currentMonthText}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(MonthButton);
