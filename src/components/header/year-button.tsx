import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCalendarContext } from '../../calendar-context';
import { formatNumber, adjustDayjsHijriDate, getYearRange } from '../../utils';
import dayjs from 'dayjs';

const YearButton = () => {
  const {
    currentDate,
    calendarView,
    setCalendarView,
    currentYear,
    onChangeYear,
    styles,
    classNames,
    disableYearPicker,
    calendar = 'gregory',
    numerals = 'latn',
  } = useCalendarContext();

  const years = getYearRange(currentYear);
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

  return (
    <Pressable
      disabled={disableYearPicker}
      onPress={() => {
        setCalendarView(calendarView === 'year' ? 'day' : 'year');
        onChangeYear(date.year());
      }}
      testID="btn-year"
      accessibilityRole="button"
      accessibilityLabel={date.format('YYYY')}
    >
      <View
        style={[defaultStyles.container, styles?.year_selector]}
        className={classNames?.year_selector}
      >
        <Text
          style={styles?.year_selector_label}
          className={classNames?.year_selector_label}
        >
          {calendarView === 'year'
            ? `${formatNumber(years[0] || 0, numerals)} - ${formatNumber(years[years.length - 1] || 0, numerals)}`
            : formatNumber(parseInt(date.format('YYYY')), numerals)}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(YearButton);

const defaultStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
