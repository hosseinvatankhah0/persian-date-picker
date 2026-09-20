/* eslint-disable */
// @ts-nocheck
import {FormsModule} from '@angular/forms';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {DatePickerModalComponent} from './date-picker.component';
import {DayTimeCalendarComponent} from '../day-time-calendar/day-time-calendar.component';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';
import {DomHelper} from '../common/services/dom-appender/dom-appender.service';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {TimeSelectComponent} from '../time-select/time-select.component';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import {MonthCalendarComponent} from '../month-calendar/month-calendar.component';
import {DayCalendarService} from '../day-calendar/day-calendar.service';
import {TimeSelectService} from '../time-select/time-select.service';
import {UtilsService} from '../common/services/utils/utils.service';

function createFixture(config: object): {component: DatePickerModalComponent; fixture: ComponentFixture<DatePickerModalComponent>} {
  TestBed.configureTestingModule({
    imports: [
      CommonModule,
      FormsModule,
      DatePickerModalComponent,
      DayTimeCalendarComponent,
      DayCalendarComponent,
      TimeSelectComponent,
      CalendarNavComponent,
      MonthCalendarComponent
    ],
    providers: [
      DayTimeCalendarService,
      DayCalendarService,
      TimeSelectService,
      UtilsService,
      DomHelper
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(DatePickerModalComponent);
  const component = fixture.componentInstance;
  fixture.componentRef.setInput('config', config);
  fixture.detectChanges();
  return {component, fixture};
}

/**
 * onViewDateChange's Gregorian-detection fallback used to try Jalali formats
 * against a hardcoded 'fa' locale no matter what the picker was configured
 * for. On an 'en'-locale picker, typed text that isn't Gregorian-shaped
 * enough for the strict check above it (a year at or below 1500, which
 * parseGregorianDate deliberately leaves to the caller) fell into that
 * fallback and got silently re-read as a Jalali date instead — centuries off
 * from what was typed, with no error and no rejection.
 */
describe('typed input on an en-locale picker stays Gregorian', () => {
  it('reads "1405/06/05" as Gregorian year 1405, not Jalali year 1405 (~2026)', () => {
    const {component, fixture} = createFixture({locale: 'en', format: 'YYYY/MM/DD'});

    component.onViewDateChange('1405/06/05');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
    expect(component.selected()[0].clone().locale('en').format('YYYY-MM-DD')).toBe('1405-06-05');
  });

  it('still reads an ordinary post-1500 date as Gregorian', () => {
    const {component, fixture} = createFixture({locale: 'en', format: 'YYYY/MM/DD'});

    component.onViewDateChange('2026/09/05');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
    expect(component.selected()[0].clone().locale('en').format('YYYY-MM-DD')).toBe('2026-09-05');
  });
});

/**
 * writeValue()/PersianDatePickerComponent already accepts an unpadded typed
 * Jalali date ("1405/6/5") for a *bound* value. The visible text box's own
 * parser only tried zero-padded formats, so typing that same ordinary shape
 * directly into the field was silently rejected instead of accepted.
 */
describe('typed input on the default fa-locale picker accepts unpadded Jalali dates', () => {
  it('accepts "1405/6/5" the same as "1405/06/05"', () => {
    const {component, fixture} = createFixture({});

    component.onViewDateChange('1405/6/5');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
    expect(component.selected()[0].clone().locale('fa').format('jYYYY/jMM/jDD')).toBe('1405/06/05');
  });

  it('accepts an unpadded date+time typed for daytime mode, e.g. "1405/6/5 8:30:5"', () => {
    const {component, fixture} = createFixture({format: 'jYYYY/jMM/jDD HH:mm:ss'});

    component.onViewDateChange('1405/6/5 8:30:5');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
    expect(component.selected()[0].clone().locale('fa').format('jYYYY/jMM/jDD HH:mm:ss')).toBe('1405/06/05 08:30:05');
  });
});
