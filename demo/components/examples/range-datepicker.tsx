import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Calendar, DateType } from '../ui/calendar';
import dayjs from 'dayjs';
import { DateInput } from '../date-input';
import type { CalendarEvent } from 'react-native-calendar-datepicker';

export default function RangeDatePicker() {
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
        details: 'Family lunch',
      },
      {
        date: today.add(3, 'day').format('YYYY-MM-DD'),
        color: '#3b82f6',
        details: 'Flight check-in reminder',
      },
      {
        date: today.add(3, 'day').format('YYYY-MM-DD'),
        color: '#10b981',
        details: 'Hotel booking confirmation',
      },
      {
        date: today.add(6, 'day').format('YYYY-MM-DD'),
        color: '#f59e0b',
        details: 'Conference keynote',
      },
    ];
  }, []);

  const from = range.startDate
    ? dayjs(range.startDate).format('MMM DD, YYYY')
    : '';
  const to = range.endDate ? dayjs(range.endDate).format('MMM DD, YYYY') : '';

  return (
    <View className="flex-1 gap-4">
      <Calendar
        mode="range"
        startDate={range.startDate}
        endDate={range.endDate}
        onChange={(params) => setRange(params)}
        events={events}
        eventViewMode
        onEventDayPress={({ date, dayEvents }) => {
          console.log('Range day pressed:', dayjs(date).format('YYYY-MM-DD'));
          console.log('Range day events:', dayEvents);
        }}
      />
      <DateInput
        value={from || to ? `${from} - ${to}` : null}
        placeholder="Pick a range"
      />
    </View>
  );
}
