export type CalendarViews = 'day' | 'month' | 'year' | 'time';

export enum CalendarActionKind {
  SET_CALENDAR_VIEW = 'SET_CALENDAR_VIEW',
  CHANGE_CURRENT_DATE = 'CHANGE_CURRENT_DATE',
  CHANGE_CURRENT_YEAR = 'CHANGE_CURRENT_YEAR',
  CHANGE_SELECTED_DATE = 'CHANGE_SELECTED_DATE',
  CHANGE_SELECTED_RANGE = 'CHANGE_SELECTED_RANGE',
  CHANGE_SELECTED_MULTIPLE = 'CHANGE_SELECTED_MULTIPLE',
  SET_IS_RTL = 'SET_IS_RTL',
  RESET_STATE = 'RESET_STATE',
}

export const CONTAINER_HEIGHT = 300;
export const WEEKDAYS_HEIGHT = 25;
