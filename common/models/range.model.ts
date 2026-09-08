import {Moment} from 'jalali-moment';

/**
 * Position of a cell relative to the currently selected range.
 * Used to drive the connected-pill styling of range calendars.
 */
export interface IRangeState {
  isStart: boolean;
  isEnd: boolean;
  isInRange: boolean;
  isPreview: boolean;
}

export interface IRange {
  from?: Moment;
  to?: Moment;
}
