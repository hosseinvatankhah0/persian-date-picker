import {ECalendarValue} from '../../types/calendar-value-enum';
import {SingleCalendarValue} from '../../types/single-calendar-value';
import {Injectable} from '@angular/core';
import momentNs, {Moment, unitOfTime} from 'jalali-moment';
import {CalendarValue} from '../../types/calendar-value';
import {IDate} from '../../models/date.model';
import {CalendarMode} from '../../types/calendar-mode';
import {DateValidator} from '../../types/validator.type';
import {ICalendarInternal} from '../../models/calendar.model';

const moment = momentNs;

export interface DateLimits {
  minDate?: SingleCalendarValue;
  maxDate?: SingleCalendarValue;
  minTime?: SingleCalendarValue;
  maxTime?: SingleCalendarValue;
}

@Injectable()
export class UtilsService {
  static debounce(func: Function, wait: number) {
    let timeout: any;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  createArray(size: number): number[] {
    return new Array(size).fill(1);
  }

  convertToMoment(date: SingleCalendarValue | undefined, format?: string, locale?: string): Moment {
    let m: Moment | null = null;
    if (!date) {
      m = null;
    } else if (typeof date === 'string') {
      m = moment.from(date, locale || 'fa', format);
    } else {
      m = date.clone();
    }
    if (m && locale) {
      m.locale(locale);
    }
    return m!;
  }

  isDateValid(date: string, format?: string, locale?: string): boolean {
    if (date === '') {
      return true;
    }
    return moment.from(date, locale || 'fa', format).isValid();
  }

  getDefaultDisplayDate(current: Moment,
                        selected: Moment[],
                        allowMultiSelect?: boolean,
                        minDate?: Moment,
                        locale?: string): Moment {
    let m = moment();
    if (selected && selected.length) {
      m = selected[allowMultiSelect ? selected.length - 1 : 0].clone();
    } else if (current) {
      m = current.clone();
    } else if (minDate && minDate.isAfter(moment())) {
      m = minDate.clone();
    }
    if (locale) {
      m.locale(locale);
    }
    return m;
  }

  getInputType(value: CalendarValue, allowMultiSelect?: boolean): ECalendarValue {
    if (Array.isArray(value)) {
      if (!value.length) {
        return ECalendarValue.MomentArr;
      } else if (typeof value[0] === 'string') {
        return ECalendarValue.StringArr;
      } else if (moment.isMoment(value[0])) {
        return ECalendarValue.MomentArr;
      }
    } else {
      if (typeof value === 'string') {
        return ECalendarValue.String;
      } else if (moment.isMoment(value)) {
        return ECalendarValue.Moment;
      }
    }

    return allowMultiSelect ? ECalendarValue.MomentArr : ECalendarValue.Moment;
  }

  convertToMomentArray(value: CalendarValue, format?: string, allowMultiSelect?: boolean, locale?: string): Moment[] {
    const loc = locale || 'fa';
    switch (this.getInputType(value, allowMultiSelect)) {
      case (ECalendarValue.String):
        return value ? [moment(<string>value, format, true).locale(loc)] : [];
      case (ECalendarValue.StringArr):
        return (<string[]>value).map(v => v ? moment(v, format, true).locale(loc) : null).filter((v): v is Moment => Boolean(v));
      case (ECalendarValue.Moment):
        return value ? [(<Moment>value).clone().locale(loc)] : [];
      case (ECalendarValue.MomentArr):
        return (<Moment[]>value || []).map(v => v.clone().locale(loc));
      default:
        return [];
    }
  }

  convertFromMomentArray(format?: string,
                         value: Moment[] = [],
                         convertTo: ECalendarValue = ECalendarValue.MomentArr,
                         locale?: string): CalendarValue {
    const loc = locale || 'fa';
    const fmt = format || 'YYYY-MM-DD';
    switch (convertTo) {
      case (ECalendarValue.String):
        return value[0] ? value[0].locale(loc).format(fmt) : '';
      case (ECalendarValue.StringArr):
        return value.filter(Boolean).map(v => v.locale(loc).format(fmt));
      case (ECalendarValue.Moment):
        return value[0] ? value[0].clone().locale(loc) : '';
      case (ECalendarValue.MomentArr):
        return value ? value.map(v => v.clone().locale(loc)) : [];
      default:
        return value;
    }
  }

  convertToString(value: CalendarValue, format?: string, locale?: string): string {
    let tmpVal: string[];

    if (typeof value === 'string') {
      tmpVal = [value];
    } else if (Array.isArray(value)) {
      if (value.length) {
        tmpVal = (<SingleCalendarValue[]>value).map((v) => {
          return this.convertToMoment(v, format, locale).format(format);
        });
      } else {
        tmpVal = <string[]>value;
      }
    } else if (moment.isMoment(value)) {
      tmpVal = [value.format(format)];
    } else {
      return '';
    }

    return tmpVal.filter(Boolean).join(' | ');
  }

  clearUndefined<T extends Record<string, any>>(obj: T): T {
    if (!obj) {
      return obj;
    }

    Object.keys(obj).forEach((key) => (obj[key] === undefined) && delete obj[key]);
    return obj;
  }

  updateSelected(isMultiple: boolean,
                 currentlySelected: Moment[],
                 date: IDate,
                 granularity: unitOfTime.Base = 'day'): Moment[] {
    const isSelected = !date.selected;
    if (isMultiple) {
      return isSelected
        ? currentlySelected.concat([date.date])
        : currentlySelected.filter(d => !d.isSame(date.date, granularity));
    } else {
      return isSelected ? [date.date] : [];
    }
  }

  closestParent(element: HTMLElement | null, selector: string): HTMLElement | null {
    if (!element) {
      return null;
    }
    const match = <HTMLElement>element.querySelector(selector);
    return match || this.closestParent(element.parentElement, selector);
  }

  onlyTime(m: Moment): Moment {
    return m && moment.isMoment(m) ? moment(m.format('HH:mm:ss'), 'HH:mm:ss') : m;
  }

  granularityFromType(calendarType: CalendarMode): unitOfTime.Base {
    switch (calendarType) {
      case 'time':
        return 'second';
      case 'daytime':
        return 'second';
      default:
        return calendarType;
    }
  }

  createValidator({minDate, maxDate, minTime, maxTime}: DateLimits,
                  format: string = 'YYYY-MM-DD',
                  calendarType: CalendarMode = 'day',
                  locale: string = 'fa'): DateValidator {
    let isValid: boolean;
    let value: Moment[];
    const validators: Array<{key: string; isValid: () => boolean}> = [];
    const granularity = this.granularityFromType(calendarType);

    if (minDate) {
      const md = this.convertToMoment(minDate, format, locale);
      validators.push({
        key: 'minDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrAfter(md, granularity));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    if (maxDate) {
      const md = this.convertToMoment(maxDate, format, locale);
      validators.push({
        key: 'maxDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrBefore(md, granularity));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    if (minTime) {
      const md = this.onlyTime(this.convertToMoment(minTime, format, locale));
      validators.push({
        key: 'minTime',
        isValid: () => {
          const _isValid = value.every(val => this.onlyTime(val).isSameOrAfter(md));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    if (maxTime) {
      const md = this.onlyTime(this.convertToMoment(maxTime, format, locale));
      validators.push({
        key: 'maxTime',
        isValid: () => {
          const _isValid = value.every(val => this.onlyTime(val).isSameOrBefore(md));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    return (inputVal: CalendarValue) => {
      isValid = true;

      value = this.convertToMomentArray(inputVal, format, true, locale).filter(Boolean);

      if (!value.every(val => val.isValid())) {
        return {
          format: {
            given: inputVal
          }
        };
      }

      const errors = validators.reduce((map: Record<string, any>, err) => {
        if (!err.isValid()) {
          map[err.key] = {
            given: value
          };
        }

        return map;
      }, {});

      return !isValid ? errors : null;
    };
  }

  datesStringToStringArray(value: string): string[] {
    return (value || '').split('|').map(m => m.trim()).filter(Boolean);
  }

  getValidMomentArray(value: string, format: string = 'YYYY-MM-DD', locale: string = 'fa'): Moment[] {
    return this.datesStringToStringArray(value)
      .filter(d => this.isDateValid(d, format, locale))
      .map(d => moment(d, format));
  }

  shouldShowCurrent(showGoToCurrent?: boolean,
                    mode?: CalendarMode,
                    min?: Moment,
                    max?: Moment): boolean {
    return !!showGoToCurrent &&
      mode !== 'time' &&
      this.isDateInRange(moment(), min, max);
  }

  isDateInRange(date: Moment, from?: Moment, to?: Moment): boolean {
    if (!from && !to) {
      return true;
    }
    if (!from && to) return date.isBefore(to, 'day');
    if (from && !to) return date.isAfter(from, 'day');
    return date.isBetween(from!, to!, 'day', '[]');
  }

  convertPropsToMoment(obj: { [key: string]: any }, format?: string, props: string[] = [], locale?: string) {
    props.forEach((prop) => {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        obj[prop] = this.convertToMoment(obj[prop], format, locale);
      }
    });
  }

  shouldResetCurrentView<T extends ICalendarInternal>(prevConf: T, currentConf: T): boolean {
    if (prevConf && currentConf) {
      if (!prevConf.min && currentConf.min) {
        return true;
      } else if (prevConf.min && currentConf.min && !prevConf.min.isSame(currentConf.min, 'd')) {
        return true;
      } else if (!prevConf.max && currentConf.max) {
        return true;
      } else if (prevConf.max && currentConf.max && !prevConf.max.isSame(currentConf.max, 'd')) {
        return true;
      }

      return false;
    }

    return false;
  }

  getNativeElement(elem: HTMLElement | string): HTMLElement | null {
    if (!elem) {
      return null;
    } else if (typeof elem === 'string') {
      return <HTMLElement>document.querySelector(elem);
    } else {
      return elem;
    }
  }
}
