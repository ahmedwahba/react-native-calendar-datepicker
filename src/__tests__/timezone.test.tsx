/**
 * Smoke tests for the "displayed day differs from returned value" bug report.
 *
 * Scenario: UI shows 19-04-2026 while the consumer's `.toISOString()` on the
 * returned value yields 2026-04-18T21:00:00.000Z (= midnight April 19 in a
 * UTC+3 locale). This happened because the library returned local-time
 * dayjs objects that were never anchored to the `timeZone` prop.
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import DateTimePicker from '../datetime-picker';
import { addTime, getStartOfDay, getDayjs, getParsedDate } from '../utils';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('timezone anchoring', () => {
  describe('addTime falsy-check regression', () => {
    test('sets hour when hour=0', () => {
      const base = dayjs('2026-04-19T05:30:00Z');
      const result = addTime(base, 'gregory', 0, 30);
      expect(result.hour()).toBe(0);
      expect(result.minute()).toBe(30);
    });

    test('sets minute when minute=0', () => {
      const base = dayjs('2026-04-19T05:30:00Z');
      const result = addTime(base, 'gregory', 10, 0);
      expect(result.hour()).toBe(10);
      expect(result.minute()).toBe(0);
    });

    test('sets both when hour=0 and minute=0', () => {
      const base = dayjs('2026-04-19T05:30:00Z');
      const result = addTime(base, 'gregory', 0, 0);
      expect(result.hour()).toBe(0);
      expect(result.minute()).toBe(0);
    });
  });

  describe('tz-aware helpers', () => {
    test('getStartOfDay(timeZone) anchors to that tz midnight', () => {
      const result = getStartOfDay('2026-04-19T10:00:00Z', 'gregory', 'UTC');
      expect(dayjs(result as dayjs.Dayjs).toISOString()).toBe(
        '2026-04-19T00:00:00.000Z'
      );
    });

    test('getDayjs(timeZone) preserves the intended wall-clock day', () => {
      const d = getDayjs('2026-04-19T10:00:00Z', 'gregory', 'UTC');
      expect(d.date()).toBe(19);
    });

    test('getParsedDate(timeZone) reads hour/minute in that tz', () => {
      const parsed = getParsedDate(
        '2026-04-19T10:30:00Z',
        'gregory',
        'UTC'
      );
      expect(parsed.hour).toBe(10);
      expect(parsed.minute).toBe(30);
    });
  });

  describe('onChange returns tz-anchored value (single mode)', () => {
    test('timeZone=UTC: tapping a day returns dayjs whose ISO day matches UI', () => {
      const onChange = jest.fn();
      render(
        <DateTimePicker
          mode="single"
          timeZone="UTC"
          date={new Date(Date.UTC(2026, 3, 15))}
          onChange={onChange}
        />
      );

      // Tap day "19"
      const dayNode = screen.getByText('19');
      fireEvent.press(dayNode);

      expect(onChange).toHaveBeenCalled();
      const returned = onChange.mock.calls.at(-1)![0].date;
      const iso = dayjs(returned as dayjs.Dayjs).toISOString();
      expect(iso.slice(0, 10)).toBe('2026-04-19');
    });

    test('timeZone=UTC with timePicker: returned ISO day matches UI day', () => {
      const onChange = jest.fn();
      render(
        <DateTimePicker
          mode="single"
          timeZone="UTC"
          timePicker
          date={new Date(Date.UTC(2026, 3, 15))}
          onChange={onChange}
        />
      );

      const dayNode = screen.getByText('19');
      fireEvent.press(dayNode);

      expect(onChange).toHaveBeenCalled();
      const returned = onChange.mock.calls.at(-1)![0].date;
      const iso = dayjs(returned as dayjs.Dayjs).toISOString();
      expect(iso.slice(0, 10)).toBe('2026-04-19');
    });
  });
});
