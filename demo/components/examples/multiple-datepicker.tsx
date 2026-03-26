import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Calendar, DateType } from '../ui/calendar';
import { DateInput } from '../date-input';
import dayjs from 'dayjs';
import type { CalendarEvent } from 'react-native-calendar-datepicker';

export default function MultipleDatePicker() {
  const [dates, setDates] = useState<DateType[]>();

  const events: CalendarEvent[] = useMemo(() => {
    const today = dayjs();
    return [
      {
        date: today.add(4, 'day').format('YYYY-MM-DD'),
        color: '#8b5cf6',
        details: 'Sprint planning',
      },
      {
        date: today.add(4, 'day').format('YYYY-MM-DD'),
        color: '#f43f5e',
        details: 'Design review with product',
      },
      {
        date: today.add(7, 'day').format('YYYY-MM-DD'),
        color: '#10b981',
        details: 'Vacation for holiday festival',
      },
    ];
  }, []);

  const selectedDates = dates
    ?.map((date) => dayjs(date).format('MMM DD, YYYY'))
    .join(' - ');

  return (
    <View className="flex-1 gap-4">
      <Calendar
        mode="multiple"
        dates={dates}
        onChange={({ dates }) => setDates(dates)}
        events={events}
        eventViewMode
      />
      <DateInput value={selectedDates || null} placeholder="Pick some dates" />
    </View>
  );
}
