import {Injectable} from '@angular/core';
import momentNs, {Moment} from 'jalali-moment';
import {WeekDays} from '../common/types/week-days.type';
import {UtilsService} from '../common/services/utils/utils.service';
import {IDay} from './day.model';
import {IDayCalendarConfig, IDayCalendarConfigInternal} from './day-calendar-config.model';
import {IMonthCalendarConfig} from '../month-calendar/month-calendar-config';

const moment = momentNs;

@Injectable()
export class DayCalendarService {
  readonly DEFAULT_CONFIG: IDayCalendarConfig = {
    showNearMonthDays: true,
    showWeekNumbers: false,
    firstDayOfWeek: 'sa',
    weekDayFormat: 'dd',
    format: 'YYYY/M/D',
    monthFormat: 'MMMM YYYY',
    dayBtnFormat: 'D',
    allowMultiSelect: false,
    enableMonthSelector: true,
    locale: 'fa'
  };
  readonly GREGORIAN_CONFIG_EXTENTION: IDayCalendarConfig = {
    firstDayOfWeek: 'su',
    weekDayFormat: 'ddd',
    format: 'DD-MM-YYYY',
    monthFormat: 'MMM, YYYY',
    locale: 'en',
    dayBtnFormat: 'DD',
    unSelectOnClick: true
  };
  private readonly DAYS: WeekDays[] = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

  constructor(private utilsService: UtilsService) {
  }

  getConfig(config: IDayCalendarConfig): IDayCalendarConfigInternal {
    const _config = <IDayCalendarConfigInternal>{
      ...this.DEFAULT_CONFIG,
      ...((config && config.locale && config.locale !== 'fa') ? this.GREGORIAN_CONFIG_EXTENTION : {}),
      ...this.utilsService.clearUndefined(config)
    };

    this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max'], _config.locale);

    return _config;
  }

  generateDaysMap(firstDayOfWeek: WeekDays): { [key: string]: number } {
    const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
    const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
    return daysArr.reduce((map, day, index) => {
      map[day] = index;

      return map;
    }, <{ [key: string]: number }>{});
  }

  generateMonthArray(config: IDayCalendarConfigInternal, month: Moment, selected: Moment[]): IDay[][] {
    let monthArray: IDay[][] = [];
    const firstDayOfWeekIndex = this.DAYS.indexOf(config.firstDayOfWeek || 'sa');
    const firstDayOfBoard = month.clone().startOf('month');
    for (let i = 0; i < 8 && (firstDayOfBoard.day() !== firstDayOfWeekIndex); i++) {
      firstDayOfBoard.subtract(1, 'day');
      if (i === 7) {
        throw new Error('first day of Board has set Wrong');
      }
    }

    const current = firstDayOfBoard.clone();
    const prevMonth = month.clone().subtract(1, 'month');
    const nextMonth = month.clone().add(1, 'month');
    const today = moment();
    const safeSelected = selected || [];

    const daysOfCalendar: IDay[] = this.utilsService.createArray(42)
      .reduce((array: IDay[]) => {
        array.push({
          date: current.clone(),
          selected: !!safeSelected.find(selectedDay => current.isSame(selectedDay, 'day')),
          currentMonth: current.isSame(month, 'month'),
          prevMonth: current.isSame(prevMonth, 'month'),
          nextMonth: current.isSame(nextMonth, 'month'),
          currentDay: current.isSame(today, 'day'),
          disabled: this.isDateDisabled(current, config)
        });
        current.add(1, 'day');

        if (current.format('HH') !== '00') {
          current.startOf('day');
          if (array[array.length - 1].date.format('DD') === current.format('DD')) {
            current.add(1, 'day');
          }
        }

        return array;
      }, []);

    daysOfCalendar.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);

      if (!monthArray[weekIndex]) {
        monthArray.push([]);
      }

      monthArray[weekIndex].push(day);
    });

    if (!config.showNearMonthDays) {
      monthArray = this.removeNearMonthWeeks(month, monthArray);
    }

    return monthArray;
  }

  generateWeekdays(firstDayOfWeek: WeekDays, locale?: string): Moment[] {
    const weekdayNames: { [key: string]: Moment } = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'].reduce((acc: { [key: string]: Moment }, d: string, i: number) => {
      const m = moment();
      if (locale) {
        m.locale(locale);
      }
      m.day(i);
      acc[d] = m;
      return acc;
    }, {});
    const weekdays: Moment[] = [];
    const daysMap = this.generateDaysMap(firstDayOfWeek);

    for (const dayKey in daysMap) {
      if (Object.prototype.hasOwnProperty.call(daysMap, dayKey)) {
        weekdays[daysMap[dayKey]] = weekdayNames[dayKey];
      }
    }

    return weekdays;
  }

  isDateDisabled(date: Moment, config: IDayCalendarConfigInternal): boolean {
    if (config.isDayDisabledCallback) {
      return config.isDayDisabledCallback(date);
    }

    if (config.min && date.isBefore(config.min, 'day')) {
      return true;
    }

    return !!(config.max && date.isAfter(config.max, 'day'));
  }

  getHeaderLabel(config: IDayCalendarConfigInternal, month: Moment): string {
    if (config.monthFormatter) {
      return config.monthFormatter(month);
    }
    if (config.locale) {
      month.locale(config.locale);
    }
    return month.format(config.monthFormat);
  }

  shouldShowLeft(min: Moment | undefined, currentMonthView: Moment): boolean {
    return min ? min.isBefore(currentMonthView, 'month') : true;
  }

  shouldShowRight(max: Moment | undefined, currentMonthView: Moment): boolean {
    return max ? max.isAfter(currentMonthView, 'month') : true;
  }

  generateDaysIndexMap(firstDayOfWeek: WeekDays): { [key: number]: string } {
    const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
    const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
    return daysArr.reduce((map, day, index) => {
      map[index] = day;

      return map;
    }, <{ [key: number]: string }>{});
  }

  getMonthCalendarConfig(componentConfig: IDayCalendarConfigInternal): IMonthCalendarConfig {
    return this.utilsService.clearUndefined({
      min: componentConfig.min,
      max: componentConfig.max,
      format: componentConfig.format,
      isNavHeaderBtnClickable: true,
      allowMultiSelect: false,
      yearFormat: componentConfig.yearFormat,
      locale: componentConfig.locale,
      yearFormatter: componentConfig.yearFormatter,
      monthBtnFormat: componentConfig.monthBtnFormat,
      monthBtnFormatter: componentConfig.monthBtnFormatter,
      monthBtnCssClassCallback: componentConfig.monthBtnCssClassCallback,
      showGoToCurrent: componentConfig.showGoToCurrent
    });
  }

  getDayBtnText(config: IDayCalendarConfigInternal, day: Moment): string {
    if (config.dayBtnFormatter) {
      return config.dayBtnFormatter(day);
    }

    return day.format(config.dayBtnFormat);
  }

  getDayBtnCssClass(config: IDayCalendarConfigInternal, day: Moment): string {
    if (config.dayBtnCssClassCallback) {
      return config.dayBtnCssClassCallback(day);
    }

    return '';
  }

  private removeNearMonthWeeks(currentMonth: Moment, monthArray: IDay[][]): IDay[][] {
    if (monthArray.length > 0 && monthArray[monthArray.length - 1].find((day) => day.date.isSame(currentMonth, 'month'))) {
      return monthArray;
    } else {
      return monthArray.slice(0, -1);
    }
  }
}
