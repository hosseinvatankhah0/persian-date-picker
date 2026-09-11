/* eslint-disable */
// @ts-nocheck
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UtilsService} from '../common/services/utils/utils.service';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import momentNs, {Moment} from 'jalali-moment';
import {DayCalendarComponent} from './day-calendar.component';
import {DayCalendarService} from './day-calendar.service';
import {MonthCalendarComponent} from '../month-calendar/month-calendar.component';
import {IDay} from './day.model';

const moment = momentNs;

describe('Component: DayCalendarComponent', () => {
  let component: DayCalendarComponent;
  let fixture: ComponentFixture<DayCalendarComponent>;

  /* Plain async rather than waitForAsync: the latter needs zone.js, which this
     package does not ship — the library is zoneless, and pulling zone.js in
     just for tests would run them under a change-detection model the app never
     uses. compileComponents() already returns a promise. */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayCalendarComponent, CalendarNavComponent, MonthCalendarComponent],
      providers: [DayCalendarService, UtilsService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', component.dayCalendarService.getConfig({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check getMonthBtnText default value', () => {
    expect(component.getDayBtnText({
      date: moment('05-04-2017', 'DD-MM-YYYY')
    } as IDay)).toEqual('5');
  });

  describe('should have the right CSS classes for', () => {
    const defaultDay: IDay = {
      date: undefined,
      selected: false,
      currentMonth: false,
      prevMonth: false,
      nextMonth: false,
      currentDay: false
    };
    const defaultCssClasses: { [klass: string]: boolean } = {
      'dp-selected': false,
      'dp-current-month': false,
      'dp-prev-month': false,
      'dp-next-month': false,
      'dp-current-day': false
    };

    it('the selected day', () => {
      expect(component.getDayBtnCssClass({
        ...defaultDay,
        selected: true
      } as IDay)).toEqual({
        ...defaultCssClasses,
        'dp-selected': true
      });
    });

    it('the current month', () => {
      expect(component.getDayBtnCssClass({
        ...defaultDay,
        currentMonth: true
      } as IDay)).toEqual({
        ...defaultCssClasses,
        'dp-current-month': true
      });
    });

    it('the previous month', () => {
      expect(component.getDayBtnCssClass({
        ...defaultDay,
        prevMonth: true
      } as IDay)).toEqual({
        ...defaultCssClasses,
        'dp-prev-month': true
      });
    });

    it('the next month', () => {
      expect(component.getDayBtnCssClass({
        ...defaultDay,
        nextMonth: true
      } as IDay)).toEqual({
        ...defaultCssClasses,
        'dp-next-month': true
      });
    });

    it('the current day', () => {
      expect(component.getDayBtnCssClass({
        ...defaultDay,
        currentDay: true
      } as IDay)).toEqual({
        ...defaultCssClasses,
        'dp-current-day': true
      });
    });

    it('custom days', () => {
      fixture.componentRef.setInput('config', {dayBtnCssClassCallback: (day: Moment) => 'custom-class'});
      fixture.detectChanges();

      expect(component.getDayBtnCssClass({
        ...defaultDay
      } as IDay)).toEqual({
        ...defaultCssClasses,
        'custom-class': true
      });
    });
  });

  describe('should have the correct weekday format', () => {
    it('weekdayFormat', () => {
      fixture.componentRef.setInput('config', {weekDayFormat: 'd'});
      fixture.detectChanges();

      expect(component.getWeekdayName(moment())).toBe(moment().format('d'));
    });

    it('weekdayFormatter', () => {
      fixture.componentRef.setInput('config', {weekDayFormatter: (x: number) => x.toString()});
      fixture.detectChanges();

      expect(component.getWeekdayName(moment())).toBe(moment().day().toString());
    });
  });

  it('should emit event goToCurrent function called', () => {
    vi.spyOn(component.onGoToCurrent, 'emit');
    component.goToCurrent();
    expect(component.onGoToCurrent.emit).toHaveBeenCalled();
  });
});
