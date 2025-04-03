import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCalendarContext } from '../../calendar-context';
import MonthButton from './month-button';
import YearButton from './year-button';
import { TimeButton } from './time-button';
import { NavigationPosition } from '../../types';

type Props = {
  position: NavigationPosition;
};

const Selectors = ({ position }: Props) => {
  const { mode, calendarView, timePicker, timePickerOptions } =
    useCalendarContext();

  const renderTimePicker = () =>
    timePicker && mode === 'single' && calendarView !== 'year' ? (
      <TimeButton />
    ) : null;

  return (
    <View
      style={[
        defaultStyles.container,
        position === 'around' && defaultStyles.justifySpaceEvenly,
        position === 'left' && defaultStyles.rowReverse,
      ]}
    >
      <View
        style={[
          defaultStyles.monthAndYear,
          position === 'left' && defaultStyles.rowReverse,
        ]}
      >
        {calendarView !== 'year' ? <MonthButton /> : null}
        <YearButton />
        {timePickerOptions?.renderBesideSelectors && renderTimePicker()}
      </View>
      {!timePickerOptions?.renderBesideSelectors && renderTimePicker()}
    </View>
  );
};

export default memo(Selectors);

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthAndYear: {
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  justifySpaceEvenly: {
    justifyContent: 'space-evenly',
  },
});
