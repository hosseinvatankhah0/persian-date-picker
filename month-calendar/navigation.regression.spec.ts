import {vi} from 'vitest';
import {Injector, runInInjectionContext} from '@angular/core';
import moment from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {MonthCalendarService} from './month-calendar.service';
import {MonthCalendarComponent} from './month-calendar.component';

describe('Calendar navigation regressions', () => {
  const utils = new UtilsService();
  const service = new MonthCalendarService(utils);

  it('generates twelve Jalali months even when the display date has an English locale', () => {
    const display = moment.from('1405/06/16', 'fa', 'YYYY/MM/DD').locale('en');
    const months = service.generateYear({locale: 'fa'}, display).flat();
    expect(months.length).toBe(12);
    expect(months.map(month => month.date.jMonth())).toEqual(Array.from({length: 12}, (_, index) => index));
    expect(months.every(month => month.date.jYear() === 1405)).toBe(true);
    expect(display.locale()).toBe('en');
  });

  it('keeps Gregorian months in a four by three grid', () => {
    const months = service.generateYear({locale: 'en'}, moment('2026-09-07'));
    expect(months.length).toBe(4);
    expect(months.every(row => row.length === 3)).toBe(true);
    expect(months.flat().map(month => month.date.month())).toEqual(Array.from({length: 12}, (_, index) => index));
  });

  it('parses Persian month strings using the requested calendar', () => {
    expect(utils.convertToMoment('1405/06', 'YYYY/MM', 'fa').format('YYYY/MM')).toBe('1405/06');
    expect(utils.convertToMoment('2026/09', 'YYYY/MM', 'en').format('YYYY/MM')).toBe('2026/09');
  });

  it('opens on the selected date rather than today', () => {
    const selected = moment('2020-02-12');
    const display = utils.getDefaultDisplayDate(moment(), [selected], false, undefined, 'en');
    expect(display.format('YYYY-MM-DD')).toBe('2020-02-12');
    expect(display).not.toBe(selected);
  });

  it('pages through twenty-one years around the visible year', () => {
    const years = service.generateYearRange({locale: 'fa'}, moment.from('1405/06/16', 'fa', 'YYYY/MM/DD'));
    expect(years.length).toBe(21);
    expect(years).toContain(1405);
    expect(years[20] - years[0]).toBe(20);
  });

  it('includes boundary months and disables months outside the limits', () => {
    const config = service.getConfig({locale: 'fa', format: 'YYYY/MM/DD', min: '1405/03/15', max: '1405/05/10'});
    const months = service.generateYear(config, moment.from('1405/01/01', 'fa', 'YYYY/MM/DD')).flat();
    expect(months.filter(month => !month.disabled).map(month => month.date.jMonth())).toEqual([2, 3, 4]);
  });

  it('emits form changes for month selection and ignores disabled months', () => {
    const injector = Injector.create({providers: []});
    const component = runInInjectionContext(injector, () => new MonthCalendarComponent(service, utils, {markForCheck() {}} as any));
    const changed = vi.fn();
    component.registerOnChange(changed);
    const months = service.generateYear(service.getConfig({}), moment().locale('fa')).flat();
    component.monthClicked({...months[0], selected: false, disabled: false});
    expect(changed).toHaveBeenCalledTimes(1);
    component.monthClicked({...months[1], disabled: true});
    expect(changed).toHaveBeenCalledTimes(1);
    injector.destroy();
  });
});
