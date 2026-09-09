import {Injectable} from '@angular/core';
import momentNs, {Moment} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {IMonth} from './month.model';
import {IMonthCalendarConfig, IMonthCalendarConfigInternal} from './month-calendar-config';

const moment = momentNs;

@Injectable()
export class MonthCalendarService {
  readonly DEFAULT_CONFIG: IMonthCalendarConfigInternal = {
    allowMultiSelect: false,
    yearFormat: 'YYYY',
    format: 'MMMM-YYYY',
    isNavHeaderBtnClickable: true,
    monthBtnFormat: 'MMMM',
    locale: 'fa',
    unSelectOnClick: true
  };
  readonly GREGORIAN_DEFAULT_CONFIG: IMonthCalendarConfig = {
    format: 'MM-YYYY',
    monthBtnFormat: 'MMM',
    locale: 'en'
  };

  constructor(private utilsService: UtilsService) {
  }

  getConfig(config: IMonthCalendarConfig): IMonthCalendarConfigInternal {
    const _config = <IMonthCalendarConfigInternal>{
      ...this.DEFAULT_CONFIG,
      ...((config && config.locale && config.locale !== 'fa') ? this.GREGORIAN_DEFAULT_CONFIG : {}),
      ...this.utilsService.clearUndefined(config)
    };

    this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max'], _config.locale);

    return _config;
  }

  generateYear(config: IMonthCalendarConfig, year: Moment, selected: Moment[] = []): IMonth[][] {
    const index = year.clone().locale(config.locale || 'fa').startOf('year');
    const safeSelected = selected || [];

    return this.utilsService.createArray(4).map(() => {
      return this.utilsService.createArray(3).map(() => {
        const date = index.clone();
        const month = {
          date,
          selected: !!safeSelected.find(s => index.isSame(s, 'month')),
          currentMonth: index.isSame(moment(), 'month'),
          disabled: this.isMonthDisabled(date, config),
          text: this.getMonthBtnText(config, date)
        };

        index.add(1, 'month');

        return month;
      });
    });
  }

  isMonthDisabled(date: Moment, config: IMonthCalendarConfig): boolean {
    if (config.min && date.isBefore(config.min, 'month')) {
      return true;
    }

    return !!(config.max && date.isAfter(config.max, 'month'));
  }

  generateYearRange(config: IMonthCalendarConfig, currentYear: Moment): number[] {
    const locale = config.locale || 'fa';
    const years: number[] = [];
    const current = currentYear.clone().locale(locale);
    const startYear = Math.floor(current.year() / 21) * 21;
    for (let year = startYear; year < startYear + 21; year++) {
      years.push(year);
    }
    return years;
  }

  getYearBtnText(config: IMonthCalendarConfig, year: Moment): string {
    if (config.yearFormatter) {
      return config.yearFormatter(year);
    }
    if (config.locale) {
      year.locale(config.locale);
    }
    return year.format(config.yearFormat);
  }

  shouldShowLeft(min: Moment | undefined, currentMonthView: Moment): boolean {
    return min ? min.isBefore(currentMonthView, 'year') : true;
  }

  shouldShowRight(max: Moment | undefined, currentMonthView: Moment): boolean {
    return max ? max.isAfter(currentMonthView, 'year') : true;
  }

  getHeaderLabel(config: IMonthCalendarConfig, year: Moment): string {
    if (config.yearFormatter) {
      return config.yearFormatter(year);
    }
    if (config.locale) {
      year.locale(config.locale);
    }
    return year.format(config.yearFormat);
  }

  getMonthBtnText(config: IMonthCalendarConfig, month: Moment): string {
    if (config.monthBtnFormatter) {
      return config.monthBtnFormatter(month);
    }

    return month.format(config.monthBtnFormat);
  }

  getMonthBtnCssClass(config: IMonthCalendarConfig, month: Moment): string {
    if (config.monthBtnCssClassCallback) {
      return config.monthBtnCssClassCallback(month);
    }

    return '';
  }
}
