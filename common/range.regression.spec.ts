import {ElementRef, Injector, runInInjectionContext, signal} from '@angular/core';
import moment from 'jalali-moment';
import {UtilsService} from './services/utils/utils.service';
import {DayCalendarService} from '../day-calendar/day-calendar.service';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {DatePickerModalService} from '../date-picker/date-picker.service';
import {TimeSelectService} from '../time-select/time-select.service';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';

const noopCd = {markForCheck() {}} as any;
const day = (iso: string) => ({date: moment(iso).locale('en'), selected: false});

describe('Range selection', () => {
  const utils = new UtilsService();

  it('opens a range on the first click and closes it on the second', () => {
    let selected = utils.updateSelectedRange([], day('2026-09-10'));
    expect(selected.length).toBe(1);

    selected = utils.updateSelectedRange(selected, day('2026-09-14'));
    expect(selected.map(m => m.format('YYYY-MM-DD'))).toEqual(['2026-09-10', '2026-09-14']);
  });

  it('swaps the ends when the user picks backwards', () => {
    const opened = utils.updateSelectedRange([], day('2026-09-14'));
    const closed = utils.updateSelectedRange(opened, day('2026-09-10'));
    expect(closed.map(m => m.format('YYYY-MM-DD'))).toEqual(['2026-09-10', '2026-09-14']);
  });

  it('starts a fresh range on the third click', () => {
    const closed = [moment('2026-09-10'), moment('2026-09-14')];
    const restarted = utils.updateSelectedRange(closed, day('2026-09-20'));
    expect(restarted.map(m => m.format('YYYY-MM-DD'))).toEqual(['2026-09-20']);
  });

  it('marks the band between both ends inclusively', () => {
    const selected = [moment('2026-09-10'), moment('2026-09-14')];
    expect(utils.getRangeState(moment('2026-09-10'), selected).isStart).toBe(true);
    expect(utils.getRangeState(moment('2026-09-14'), selected).isEnd).toBe(true);
    expect(utils.getRangeState(moment('2026-09-12'), selected).isInRange).toBe(true);
    expect(utils.getRangeState(moment('2026-09-15'), selected).isInRange).toBe(false);
  });

  it('previews the band up to the hovered day while the range is half open', () => {
    const open = [moment('2026-09-10')];
    const preview = utils.getRangeState(moment('2026-09-12'), open, moment('2026-09-14'));
    expect(preview.isInRange).toBe(true);
    expect(preview.isPreview).toBe(true);

    // A closed range never previews.
    const closed = utils.getRangeState(moment('2026-09-12'), [moment('2026-09-10'), moment('2026-09-14')], moment('2026-09-20'));
    expect(closed.isPreview).toBe(false);
  });

  it('previews backwards when hovering before the open start', () => {
    const state = utils.getRangeState(moment('2026-09-08'), [moment('2026-09-10')], moment('2026-09-06'));
    expect(state.isInRange).toBe(true);
    expect(state.isStart).toBe(false);
  });

  it('builds a two-ended range through the day calendar component', () => {
    const injector = Injector.create({providers: [{provide: ElementRef, useValue: new ElementRef({})}]});
    const service = new DayCalendarService(utils);
    const component = runInInjectionContext(injector, () => new DayCalendarComponent(service, utils, noopCd));
    let changeCount = 0;
    component.registerOnChange(() => changeCount++);
    component.config = signal({selectionMode: 'range', locale: 'en', format: 'YYYY-MM-DD'}) as any;

    component.dayClicked(day('2026-09-10'));
    expect(component.selected().length).toBe(1);

    component.dayClicked(day('2026-09-04'));
    expect(component.selected().map(m => m.format('YYYY-MM-DD'))).toEqual(['2026-09-04', '2026-09-10']);
    expect(changeCount).toBe(2);
    injector.destroy();
  });

  it('re-clicking the open start closes a single-day range even when unSelectOnClick is off', () => {
    const injector = Injector.create({providers: [{provide: ElementRef, useValue: new ElementRef({})}]});
    const service = new DayCalendarService(utils);
    const component = runInInjectionContext(injector, () => new DayCalendarComponent(service, utils, noopCd));
    component.config = signal({selectionMode: 'range', unSelectOnClick: false, locale: 'en'}) as any;

    component.dayClicked(day('2026-09-10'));
    component.dayClicked({date: moment('2026-09-10').locale('en'), selected: true});
    expect(component.selected().length).toBe(2);
    injector.destroy();
  });

  it('clears a clicked selection when the form resets to its original null value', () => {
    const injector = Injector.create({providers: [{provide: ElementRef, useValue: new ElementRef({})}]});
    const component = runInInjectionContext(injector, () => new DayCalendarComponent(new DayCalendarService(utils), utils, noopCd));
    component.config = signal({selectionMode: 'range', locale: 'en', format: 'YYYY-MM-DD'}) as any;
    component.writeValue(null);
    component.dayClicked(day('2026-09-10'));
    expect(component.selected().length).toBe(1);
    component.writeValue(null);
    expect(component.selected()).toEqual([]);
    component.dayClicked(day('2026-09-14'));
    expect(component.selected().map(m => m.format('YYYY-MM-DD'))).toEqual(['2026-09-14']);
    injector.destroy();
  });
});

describe('Action bar defaults', () => {
  const utils = new UtilsService();
  const timeSelectService = new TimeSelectService(utils);
  const dayCalendarService = new DayCalendarService(utils);
  const service = new DatePickerModalService(
    utils,
    timeSelectService,
    new DayTimeCalendarService(utils, dayCalendarService, timeSelectService)
  );

  it('keeps single day selection auto-committing with no confirm button', () => {
    const config = service.getConfig({}, 'day');
    expect(config.showActionButtons).toBe(false);
    expect(config.closeOnSelect).toBe(true);
  });

  it('shows the bar and stops auto-closing for range, time and daytime', () => {
    expect(service.getConfig({selectionMode: 'range'}, 'day').showActionButtons).toBe(true);
    expect(service.getConfig({selectionMode: 'range'}, 'day').closeOnSelect).toBe(false);
    expect(service.getConfig({}, 'time').showActionButtons).toBe(true);
    expect(service.getConfig({}, 'daytime').showActionButtons).toBe(true);
  });

  it('lets the host override the automatic decision', () => {
    expect(service.getConfig({showActionButtons: false}, 'daytime').showActionButtons).toBe(false);
    expect(service.getConfig({showActionButtons: true}, 'day').showActionButtons).toBe(true);
    expect(service.getConfig({showActionButtons: true}, 'day').closeOnSelect).toBe(false);
  });
});
