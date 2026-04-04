import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Calendar, DateType } from '../ui/calendar';
import dayjs from 'dayjs';
import { DateInput } from '../date-input';
import type { CalendarEvent } from 'react-native-calendar-datepicker';

export default function SingleDatePicker() {
  const [date, setDate] = useState<DateType>();

  const events: CalendarEvent[] = useMemo(() => {
    const today = dayjs();
    return [
      {
        date: today.add(2, 'day').format('YYYY-MM-DD'),
        color: '#f43f5e',
        details: 'Team celebration planning',
      },
      {
        date: today.add(2, 'day').format('YYYY-MM-DD'),
        color: '#3b82f6',
        details: 'Client sync at 10:30 AM',
      },
      {
        date: today.add(5, 'day').format('YYYY-MM-DD'),
        color: '#10b981',
        details: 'Vacation for holiday festival',
      },
      {
        date: today.add(8, 'day').format('YYYY-MM-DD'),
        color: '#f59e0b',
        details: 'Doctor appointment',
      },
      {
        date: today.add(8, 'day').format('YYYY-MM-DD'),
        color: '#8b5cf6',
        details: 'Birthday dinner reservation',
      },
      {
        date: today.add(8, 'day').format('YYYY-MM-DD'),
        color: '#f43f5e',
        details: 'Evening workout session',
      },
    ];
  }, []);

  return (
    <View className="flex-1 gap-4">
      <Calendar
        mode="single"
        date={date}
        onChange={({ date }) => setDate(date)}
        events={events}
        eventViewMode
        displayEventTooltip
        onEventDayPress={({ date, dayEvents }) => {
          console.log('Single day pressed:', dayjs(date).format('YYYY-MM-DD'));
          console.log('Single day events:', dayEvents);
        }}
        timePicker
        //use12Hours
        //minDate={new Date()}
        //maxDate={new Date(new Date().getFullYear(), 11, 31)} // end of the year
      />
      <DateInput
        value={date ? dayjs(date).format('MMMM DD, YYYY HH:mm') : null}
        placeholder="Pick a date"
      />
    </View>
  );
}
