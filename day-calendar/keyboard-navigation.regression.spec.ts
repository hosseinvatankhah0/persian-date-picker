import {ChangeDetectorRef, ElementRef, Injector, runInInjectionContext} from '@angular/core';
import moment, {Moment} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {DayCalendarService} from './day-calendar.service';
import {DayCalendarComponent} from './day-calendar.component';
import {IDay} from './day.model';

const utils = new UtilsService();
const service = new DayCalendarService(utils);

/** The component reaches for an ElementRef to move focus after a month
 * change; these tests only assert the date arithmetic, so an inert host that
 * finds no buttons is enough. */
const injector = Injector.create({
  providers: [
    {provide: ElementRef, useValue: new ElementRef({querySelector: () => null})},
    {provide: ChangeDetectorRef, useValue: {markForCheck() {}}}
  ]
});

function createCalendar(view: string): DayCalendarComponent {
  const component = runInInjectionContext(
    injector,
    () => new DayCalendarComponent(service, utils, {markForCheck() {}} as any)
  );
  component.currentDateView.set(moment.from(view, 'fa', 'jYYYY/jMM/jDD'));
  return component;
}

function dayOf(component: DayCalendarComponent, jalaliDate: string): IDay {
  const date = moment.from(jalaliDate, 'fa', 'jYYYY/jMM/jDD');
  const day = component.weeks().flat().find(d => d.date.isSame(date, 'day'));
  if (!day) {
    throw new Error(`${jalaliDate} is not on the rendered grid`);
  }
  return day;
}

function press(component: DayCalendarComponent, day: IDay, key: string): string | null {
  component.onDayKeydown(new KeyboardEvent('keydown', {key}), day);
  const focused = component.focusedDate();
  return focused ? focused.locale('fa').format('jYYYY/jMM/jDD') : null;
}

describe('Day grid keyboard navigation', () => {
  it('walks a day at a time, with the arrows following the right-to-left grid', () => {
    const calendar = createCalendar('1405/06/19');
    const day = dayOf(calendar, '1405/06/19');

    expect(press(calendar, day, 'ArrowLeft')).toBe('1405/06/20');
    expect(press(calendar, day, 'ArrowRight')).toBe('1405/06/18');
  });

  it('walks a week at a time with the vertical arrows', () => {
    const calendar = createCalendar('1405/06/19');
    const day = dayOf(calendar, '1405/06/19');

    expect(press(calendar, day, 'ArrowDown')).toBe('1405/06/26');
    expect(press(calendar, day, 'ArrowUp')).toBe('1405/06/12');
  });

  it('pages by month and brings the shown month along with it', () => {
    const calendar = createCalendar('1405/06/19');
    const day = dayOf(calendar, '1405/06/19');

    expect(press(calendar, day, 'PageDown')).toBe('1405/07/19');
    expect(calendar.currentDateView().locale('fa').format('jYYYY/jMM')).toBe('1405/07');
  });

  it('jumps to the ends of the week on Home and End', () => {
    const calendar = createCalendar('1405/06/19');
    const day = dayOf(calendar, '1405/06/19');

    expect(press(calendar, day, 'Home')).toBe('1405/06/14');
    expect(press(calendar, day, 'End')).toBe('1405/06/20');
  });

  it('ignores keys it does not own, leaving Enter and Space to the button', () => {
    const calendar = createCalendar('1405/06/19');
    const day = dayOf(calendar, '1405/06/19');

    expect(press(calendar, day, 'Enter')).toBeNull();
    expect(press(calendar, day, 'a')).toBeNull();
  });

  it('steps over a disabled date instead of stranding the cursor on it', () => {
    const calendar = createCalendar('1405/06/19');
    // A disabled button cannot hold focus, so landing on one would be a dead
    // end: the 20th is blocked here, so moving forward has to reach the 21st.
    (calendar as any).config = () => ({
      locale: 'fa',
      isDayDisabledCallback: (date: Moment) => date.locale('fa').format('jYYYY/jMM/jDD') === '1405/06/20'
    });

    expect(press(calendar, dayOf(calendar, '1405/06/19'), 'ArrowLeft')).toBe('1405/06/21');
  });

  it('keeps exactly one day in the tab order', () => {
    const calendar = createCalendar('1405/06/19');
    const days = calendar.weeks().flat();

    expect(days.filter(day => calendar.isTabbable(day)).length).toBe(1);
  });

  it('anchors the tab stop on today when nothing is selected yet', () => {
    const calendar = createCalendar(moment().locale('fa').format('jYYYY/jMM/jDD'));
    const anchor = calendar.tabbableDate();

    expect(anchor!.isSame(moment(), 'day')).toBe(true);
  });

  it('moves the tab stop to the selected day once there is one', () => {
    const calendar = createCalendar('1405/06/19');
    calendar.selected.set([moment.from('1405/06/23', 'fa', 'jYYYY/jMM/jDD')]);

    expect(calendar.tabbableDate()!.locale('fa').format('jYYYY/jMM/jDD')).toBe('1405/06/23');
  });
});
