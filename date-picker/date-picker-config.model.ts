/* eslint-disable */
// @ts-nocheck
import {TDrops, TOpens} from '../common/types/positions.type';
import {IDayCalendarConfig, IDayCalendarConfigInternal} from '../day-calendar/day-calendar-config.model';
import {IMonthCalendarConfig, IMonthCalendarConfigInternal} from '../month-calendar/month-calendar-config';
import {ITimeSelectConfig, ITimeSelectConfigInternal} from '../time-select/time-select-config.model';

export interface IConfig {
  closeOnSelect?: boolean;
  closeOnSelectDelay?: number;
  openOnFocus?: boolean;
  openOnClick?: boolean;
  onOpenDelay?: number;
  disableKeypress?: boolean;
  appendTo?: string | HTMLElement;
  inputElementContainer?: HTMLElement | string;
  drops?: TDrops;
  opens?: TOpens;
  hideInputContainer?: boolean;
  hideOnOutsideClick?: boolean;
  /**
   * Show the confirm/close bar. When omitted the picker decides: modes that
   * build a value across several clicks (range, time, daytime) get the bar and
   * only commit on confirm; single day/month selection commits immediately.
   */
  showActionButtons?: boolean;
  rangeSeparator?: string;
}

export interface IDatePickerModalConfig extends IConfig,
  IDayCalendarConfig,
  IMonthCalendarConfig,
  ITimeSelectConfig {

}

export interface IDatePickerModalConfigInternal extends IConfig,
  IDayCalendarConfigInternal,
  IMonthCalendarConfigInternal,
  ITimeSelectConfigInternal {
}
