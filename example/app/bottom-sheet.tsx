import { useCallback, useRef, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from 'react-native-ui-datepicker';
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
              mode="single"
              date={date}
              // startDate={range.startDate}
              // endDate={range.endDate}
              onChange={(params) => {setDate(params.date); console.log('date:', params)}}
              // firstDayOfWeek={6}
              multiRangeMode
              showOutsideDays
              timePicker
              calendar={isGregorian ? "gregory" : "islamic"}
              //locale="en"
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
