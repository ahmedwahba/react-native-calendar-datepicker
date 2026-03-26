import React, { memo, useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import {
  ClassNames,
  CalendarDay,
  Styles,
  CalendarComponents,
  DateType,
  CalendarEvent,
} from '../types';
import { CONTAINER_HEIGHT, WEEKDAYS_HEIGHT } from '../enums';
import { cn } from '../utils';
import { isEqual } from 'lodash';

interface Props {
  day: CalendarDay;
  eventDots?: string[];
  dayEvents?: CalendarEvent[];
  eventViewMode?: boolean;
  isTooltipVisible?: boolean;
  dayIndex?: number;
  totalRows?: number;
  onSelectDate: (date: DateType) => void;
  containerHeight?: number;
  weekdaysHeight?: number;
  styles?: Styles;
  classNames?: ClassNames;
  components?: CalendarComponents;
}

export const EmptyDay = React.memo(() => {
  return <View style={defaultStyles.dayWrapper} />;
});

const Day = ({
  day,
  eventDots,
  dayEvents = [],
  eventViewMode = false,
  isTooltipVisible = false,
  dayIndex = 0,
  totalRows = 6,
  onSelectDate,
  containerHeight = CONTAINER_HEIGHT,
  weekdaysHeight = WEEKDAYS_HEIGHT,
  styles = {},
  classNames = {},
  components = {},
}: Props) => {
  const style = useMemo(
    () => createDefaultStyles(containerHeight, weekdaysHeight),
    [containerHeight, weekdaysHeight]
  );
  const { width: screenWidth } = useWindowDimensions();

  const {
    text,
    date,
    isDisabled,
    isCurrentMonth,
    isToday,
    isSelected,
    inRange,
    leftCrop,
    rightCrop,
    isStartOfWeek,
    isEndOfWeek,
    isCrop,
    inMiddle,
    rangeStart,
    rangeEnd,
  } = day;

  const containerStyle = StyleSheet.flatten([
    defaultStyles.dayContainer,
    styles.day,
    isToday && styles.today,
    !isCurrentMonth && styles.outside,
    isSelected && styles.selected,
    isDisabled && styles.disabled,
    inMiddle && styles.range_middle,
    rangeStart && styles.range_start,
    rangeEnd && styles.range_end,
  ]);

  const textStyle = StyleSheet.flatten([
    styles.day_label,
    isToday && styles.today_label,
    !isCurrentMonth && styles.outside_label,
    isSelected && styles.selected_label,
    isDisabled && styles.disabled_label,
    inMiddle && styles.range_middle_label,
    rangeStart && styles.range_start_label,
    rangeEnd && styles.range_end_label,
  ]);

  const containerClassName = cn(
    classNames.day,
    isToday && classNames.today,
    !isCurrentMonth && classNames.outside,
    isSelected && classNames.selected,
    isDisabled && classNames.disabled,
    inMiddle && classNames.range_middle,
    rangeStart && classNames.range_start,
    rangeEnd && classNames.range_end
  );

  const textClassName = cn(
    classNames.day_label,
    isToday && classNames.today_label,
    !isCurrentMonth && classNames.outside_label,
    isSelected && classNames.selected_label,
    isDisabled && classNames.disabled_label,
    inMiddle && classNames.range_middle_label,
    rangeStart && classNames.range_start_label,
    rangeEnd && classNames.range_end_label
  );

  const EventDots = useMemo(() => {
    if (!eventDots || eventDots.length === 0) return null;
    return (
      <View
        style={[defaultStyles.eventDotsContainer, styles.event_dots_container]}
        className={classNames.event_dots_container}
      >
        {eventDots.map((color, i) => (
          <View
            key={i}
            style={[
              defaultStyles.eventDot,
              { backgroundColor: color },
              styles.event_dot,
            ]}
            className={classNames.event_dot}
          />
        ))}
      </View>
    );
  }, [
    eventDots,
    styles.event_dots_container,
    styles.event_dot,
    classNames.event_dots_container,
    classNames.event_dot,
  ]);

  const EventTooltip = useMemo(() => {
    if (!eventViewMode || !isTooltipVisible || dayEvents.length === 0) {
      return null;
    }

    const rowIndex = Math.floor(dayIndex / 7);
    const colIndex = dayIndex % 7;
    const showAbove = rowIndex >= totalRows - 2;
    const tooltipWidth = Math.min(Math.max(screenWidth * 0.58, 180), 280);

    const verticalPositionStyle = showAbove
      ? ({ bottom: '100%', marginBottom: 6 } as const)
      : ({ top: '100%', marginTop: 6 } as const);

    const horizontalPositionStyle =
      colIndex <= 1
        ? ({ left: 0 } as const)
        : colIndex >= 5
          ? ({ right: 0 } as const)
          : ({ left: '50%', marginLeft: -(tooltipWidth / 2) } as const);

    return (
      <View
        style={[
          defaultStyles.eventTooltip,
          { width: tooltipWidth },
          verticalPositionStyle,
          horizontalPositionStyle,
        ]}
      >
        {dayEvents.map((event, i) => (
          <View
            key={`${event.color}-${i}`}
            style={defaultStyles.eventTooltipItem}
          >
            <View
              style={[
                defaultStyles.eventTooltipDot,
                { backgroundColor: event.color },
              ]}
            />
            <Text style={defaultStyles.eventTooltipText}>
              {event.details || ' '}
            </Text>
          </View>
        ))}
      </View>
    );
  }, [
    eventViewMode,
    isTooltipVisible,
    dayEvents,
    dayIndex,
    totalRows,
    screenWidth,
  ]);

  const RangeFill = useMemo(() => {
    if (!inRange) return null;
    if (!isCrop) {
      return (
        <View
          style={[
            defaultStyles.rangeRoot,
            styles.range_fill,
            isEndOfWeek && styles.range_fill_weekend,
            isStartOfWeek && styles.range_fill_weekstart,
          ]}
          className={cn(
            classNames.range_fill,
            isEndOfWeek && classNames.range_fill_weekend,
            isStartOfWeek && classNames.range_fill_weekstart
          )}
        />
      );
    }
    return (
      <>
        {leftCrop && (
          <View
            style={[
              defaultStyles.rangeRoot,
              defaultStyles.leftCrop,
              styles.range_fill,
            ]}
            className={classNames.range_fill}
          />
        )}
        {rightCrop && (
          <View
            style={[
              defaultStyles.rangeRoot,
              defaultStyles.rightCrop,
              styles.range_fill,
            ]}
            className={classNames.range_fill}
          />
        )}
      </>
    );
  }, [
    inRange,
    isCrop,
    isStartOfWeek,
    isEndOfWeek,
    leftCrop,
    rightCrop,
    styles.range_fill,
    styles.range_fill_weekstart,
    styles.range_fill_weekend,
    classNames.range_fill,
    classNames.range_fill_weekstart,
    classNames.range_fill_weekend,
  ]);

  return (
    <View
      style={[
        defaultStyles.dayWrapper,
        isTooltipVisible && defaultStyles.dayWrapperOverlay,
      ]}
    >
      {RangeFill}
      <View
        style={[style.dayCell, styles.day_cell]}
        className={classNames.day_cell}
      >
        {components.Day ? (
          <Pressable
            disabled={isDisabled}
            onPress={() => onSelectDate(date)}
            accessibilityRole="button"
            accessibilityLabel={text}
            style={containerStyle}
          >
            {components.Day(day)}
          </Pressable>
        ) : (
          <Pressable
            disabled={isDisabled}
            onPress={() => onSelectDate(date)}
            accessibilityRole="button"
            accessibilityLabel={text}
            style={containerStyle}
            className={containerClassName}
          >
            <Text style={textStyle} className={textClassName}>
              {text}
            </Text>
            {EventDots}
            {EventTooltip}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  dayWrapper: {
    width: `${99.9 / 7}%`,
    position: 'relative',
    overflow: 'visible',
  },
  dayWrapperOverlay: {
    zIndex: 30,
    elevation: 30,
  },
  dayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  rangeWrapper: {
    flex: 1,
  },
  rangeRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leftCrop: { left: '50%' },
  rightCrop: { right: '50%' },
  eventDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventTooltip: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  eventTooltipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: 2,
  },
  eventTooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginRight: 8,
  },
  eventTooltipText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#111827',
  },
});

const createDefaultStyles = (containerHeight: number, weekdaysHeight: number) =>
  StyleSheet.create({
    dayCell: {
      minHeight: (containerHeight - weekdaysHeight) / 6,
    },
  });

const customComparator = (prev: Readonly<Props>, next: Readonly<Props>) => {
  const areEqual =
    isEqual(prev.day, next.day) &&
    prev.onSelectDate === next.onSelectDate &&
    prev.containerHeight === next.containerHeight &&
    isEqual(prev.styles, next.styles) &&
    isEqual(prev.classNames, next.classNames) &&
    isEqual(prev.components, next.components) &&
    isEqual(prev.eventDots, next.eventDots) &&
    isEqual(prev.dayEvents, next.dayEvents) &&
    prev.eventViewMode === next.eventViewMode &&
    prev.isTooltipVisible === next.isTooltipVisible &&
    prev.dayIndex === next.dayIndex &&
    prev.totalRows === next.totalRows;

  return areEqual;
};

export default memo(Day, customComparator);
