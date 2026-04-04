import { useCallback, useMemo, useRef, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  DateType,
  CalendarEvent,
  useDefaultStyles,
} from 'react-native-calendar-datepicker';
import dayjs, { Dayjs } from 'dayjs';

export default function BottomSheetScreen() {
  const defaultStyles = useDefaultStyles();
  const [date, setDate] = useState<DateType>();
  const [isGregorian, setIsGregorian] = useState<boolean>(true);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [dates, setDates] = useState<DateType[]>();
  const [range, setRange] = useState<{
    startDate: DateType;
    endDate: DateType;
  }>({ startDate: undefined, endDate: undefined });

  const events: CalendarEvent[] = useMemo(() => {
    const today = dayjs();
    return [
      {
        date: today.add(1, 'day').format('YYYY-MM-DD'),
        color: '#f43f5e',
        details: 'Doctor appointment at 09:00',
      },
      {
        date: today.add(1, 'day').format('YYYY-MM-DD'),
        color: '#3b82f6',
        details: 'Product roadmap sync',
      },
      {
        date: today.add(3, 'day').format('YYYY-MM-DD'),
        color: '#10b981',
        // details: 'Vacation for holiday festival',
      },
      {
        date: today.add(5, 'day').format('YYYY-MM-DD'),
        color: '#f59e0b',
        details: 'Conference opening session',
      },
      {
        date: today.add(5, 'day').format('YYYY-MM-DD'),
        color: '#8b5cf6',
        details: 'Workshop: React Native animations',
      },
      {
        date: today.add(5, 'day').format('YYYY-MM-DD'),
        color: '#f43f5e',
        details: 'Dinner with friends',
      },
    ];
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // const handleSheetChanges = useCallback((index: number) => {
  //   console.log('handleSheetChanges', index);
  // }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <Button onPress={handlePresentModalPress} title="Present Modal" />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          //onChange={handleSheetChanges}
        >
          <BottomSheetView style={styles.contentContainer}>
          <Button onPress={() => setIsGregorian(!isGregorian)} title="Toggle Gregorian/Islamic" />
          <Button  title="reset" onPress={() => {setDate(undefined)}}  />
            <DateTimePicker
              styles={defaultStyles}
              mode="range"
              minDate={new Date(2024, 11, 20)}
              maxDate={new Date(2026, 11, 20)}
              // date={date}
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={(params) => {setRange(params); console.log('date:', params.startDate)}}
              // firstDayOfWeek={6}
              multiRangeMode
              showOutsideDays
              //timePicker
              calendar={isGregorian ? "gregory" : "islamic"}
              locale="ar"
              events={events}
              eventViewMode
              displayEventTooltip
              onEventDayPress={({ date, dayEvents }) => {
                console.log(
                  'Bottom sheet day pressed:',
                  dayjs(date).format('YYYY-MM-DD')
                );
                console.log('Bottom sheet day events:', dayEvents);
              }}
              //numerals="arabext"
            />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    height: 400,
  },
});
