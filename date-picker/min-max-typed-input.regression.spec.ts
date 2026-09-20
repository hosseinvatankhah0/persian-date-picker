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

/**
 * onViewDateChange's `typeof value === 'string'` branch (added for free
 * typing/pasting) returns unconditionally once a date parses, before ever
 * reaching the minDate/maxDate check further down — the only caller that
 * still reaches that check is a non-string value, which the real `.dp-picker-
 * input` never sends (its ngModel is always a string). So minDate/maxDate
 * were silently unenforced for anything typed or pasted into the field.
 */
describe('typed input respects minDate/maxDate', () => {
  let component: DatePickerModalComponent;
  let fixture: ComponentFixture<DatePickerModalComponent>;

  beforeEach(() => {
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

    fixture = TestBed.createComponent(DatePickerModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('minDate', '1405/01/01');
    fixture.componentRef.setInput('maxDate', '1405/12/29');
    fixture.detectChanges();
  });

  it('rejects a typed date before minDate', () => {
    component.onViewDateChange('1300/01/01');
    fixture.detectChanges();

    expect(component.selected().length).toBe(0);
    expect(component.showMinDateIsNotValid()).toBe(true);
  });

  it('rejects a typed date after maxDate', () => {
    component.onViewDateChange('1420/01/01');
    fixture.detectChanges();

    expect(component.selected().length).toBe(0);
    expect(component.showMaxDateIsNotValid()).toBe(true);
  });

  it('still accepts a typed date inside the bounds', () => {
    component.onViewDateChange('1405/06/15');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
    expect(component.showMinDateIsNotValid()).toBe(false);
    expect(component.showMaxDateIsNotValid()).toBe(false);
  });
});
