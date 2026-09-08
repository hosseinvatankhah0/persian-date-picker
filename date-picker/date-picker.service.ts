/* eslint-disable */
// @ts-nocheck
import {EventEmitter, Injectable} from '@angular/core';
import {IDatePickerModalConfig, IDatePickerModalConfigInternal} from './date-picker-config.model';
import momentNs, {Moment} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {IDayCalendarConfig} from '../day-calendar/day-calendar-config.model';
import {TimeSelectService} from '../time-select/time-select.service';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';
import {ITimeSelectConfig} from '../time-select/time-select-config.model';
import {CalendarMode} from '../common/types/calendar-mode';

const moment = momentNs;

@Injectable()
export class DatePickerModalService {
  readonly onPickerClosed: EventEmitter<null> = new EventEmitter();
  private defaultConfig: IDatePickerModalConfigInternal = {
    closeOnSelect: true,
    closeOnSelectDelay: 100,
    format: 'YYYY-MM-D',
    openOnFocus: true,
    openOnClick: true,
    onOpenDelay: 0,
    disableKeypress: false,
    showNearMonthDays: true,
    showWeekNumbers: false,
    enableMonthSelector: true,
    showGoToCurrent: true,
    locale: 'fa',
    hideOnOutsideClick: true,
    selectionMode: 'single',
    rangeSeparator: ' - '
  };
  private gregorianExtensionConfig: IDatePickerModalConfig = {
    format: 'DD-MM-YYYY',
    locale: 'en'
  };

  constructor(private utilsService: UtilsService,
              private timeSelectService: TimeSelectService,
              private daytimeCalendarService: DayTimeCalendarService) {
  }

  // todo:: add unit tests
  getConfig(config: IDatePickerModalConfig, mode: CalendarMode = 'daytime'): IDatePickerModalConfigInternal {
    const _config = <IDatePickerModalConfigInternal>{
      ...this.defaultConfig,
      ...((config && config.locale && config.locale !== 'fa') ? this.gregorianExtensionConfig : {}),
      format: this.getDefaultFormatByMode(mode, config),
      ...this.utilsService.clearUndefined(config)
    };

    this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max'], _config.locale);

    if (config && config.allowMultiSelect && config.closeOnSelect === undefined) {
      _config.closeOnSelect = false;
    }

    // Modes that build their value over several interactions need an explicit
    // commit step, so they show the action bar and never auto-close.
    if (_config.showActionButtons === undefined) {
      _config.showActionButtons = _config.selectionMode === 'range' || mode === 'time' || mode === 'daytime';
    }

    if (_config.showActionButtons) {
      _config.closeOnSelect = false;
    }

    // A range is two values joined by a separator; free-text editing of that is
    // ambiguous, so the input is display-only.
    if (_config.selectionMode === 'range' && (!config || config.disableKeypress === undefined)) {
      _config.disableKeypress = true;
    }

    // moment.locale(_config.locale);

    return _config;
  }

  getDayConfigService(pickerConfig: IDatePickerModalConfig): IDayCalendarConfig {
    return {
      min: pickerConfig.min,
      max: pickerConfig.max,
      isDayDisabledCallback: pickerConfig.isDayDisabledCallback,
      weekDayFormat: pickerConfig.weekDayFormat,
      showNearMonthDays: pickerConfig.showNearMonthDays,
      showWeekNumbers: pickerConfig.showWeekNumbers,
      firstDayOfWeek: pickerConfig.firstDayOfWeek,
      format: pickerConfig.format,
      allowMultiSelect: pickerConfig.allowMultiSelect,
      monthFormat: pickerConfig.monthFormat,
      monthFormatter: pickerConfig.monthFormatter,
      enableMonthSelector: pickerConfig.enableMonthSelector,
      yearFormat: pickerConfig.yearFormat,
      yearFormatter: pickerConfig.yearFormatter,
      dayBtnFormat: pickerConfig.dayBtnFormat,
      dayBtnFormatter: pickerConfig.dayBtnFormatter,
      dayBtnCssClassCallback: pickerConfig.dayBtnCssClassCallback,
      monthBtnFormat: pickerConfig.monthBtnFormat,
      monthBtnFormatter: pickerConfig.monthBtnFormatter,
      monthBtnCssClassCallback: pickerConfig.monthBtnCssClassCallback,
      multipleYearsNavigateBy: pickerConfig.multipleYearsNavigateBy,
      showMultipleYearsNavigation: pickerConfig.showMultipleYearsNavigation,
      locale: pickerConfig.locale,
      returnedValueType: pickerConfig.returnedValueType,
      showGoToCurrent: pickerConfig.showGoToCurrent,
      unSelectOnClick: pickerConfig.unSelectOnClick,
      selectionMode: pickerConfig.selectionMode
    };
  }

  getDayTimeConfigService(pickerConfig: IDatePickerModalConfig): ITimeSelectConfig {
    // The daytime panel owns a single moment, so it never runs in range mode.
    return this.daytimeCalendarService.getConfig({...pickerConfig, selectionMode: 'single'});
  }

  getTimeConfigService(pickerConfig: IDatePickerModalConfig): ITimeSelectConfig {
    return this.timeSelectService.getConfig(pickerConfig);
  }

  pickerClosed() {
    this.onPickerClosed.emit();
  }

  // todo:: add unit tests
  isValidInputDateValue(value: string, config: IDatePickerModalConfig): boolean {
    value = value ? value : '';
    const datesStrArr: string[] = this.utilsService.datesStringToStringArray(value);

    return datesStrArr.every(date => this.utilsService.isDateValid(date, config.format, config.locale));
  }

  // todo:: add unit tests
  convertInputValueToMomentArray(value: string, config: IDatePickerModalConfig): Moment[] {
    value = value ? value : '';
    const datesStrArr: string[] = this.utilsService.datesStringToStringArray(value);

    return this.utilsService.convertToMomentArray(datesStrArr, config.format, config.allowMultiSelect, config.locale);
  }

  private getDefaultFormatByMode(mode: CalendarMode, config: IDatePickerModalConfig): string {
    let dateFormat = 'YYYY-MM-DD';
    let monthFormat = 'MMMM YY';
    const timeFormat = 'HH:mm:ss';
    if (config && config.locale && config.locale !== 'fa') {
      dateFormat = 'DD-MM-YYYY';
      monthFormat = 'MMM, YYYY';
    }
    switch (mode) {
      case 'day':
        return dateFormat;
      case 'daytime':
        return dateFormat + ' ' + timeFormat;
      case 'time':
        return timeFormat;
      case 'month':
        return monthFormat;
    }
  }
}
