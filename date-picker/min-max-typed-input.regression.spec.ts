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

/**
 * minDateIsValid/maxDateIsValid used to re-parse transformToJalali()'s
 * *formatted string* output with another `moment.from(...)` call — but
 * `moment.from` is lenient enough that even the literal text "Invalid date"
 * (transformToJalali's own output for an unparseable bound) parsed back into
 * a fabricated "valid" moment in the year 621, instead of staying invalid.
 * That silently made minDateIsValid permanently true (the min bound
 * effectively disabled) and maxDateIsValid permanently false (every value
 * rejected as "after max"), for as long as the bound itself was malformed.
 */
describe('minDateIsValid/maxDateIsValid fail open on a malformed bound rather than lying', () => {
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
  });

  // The fabricated year-621 moment the old bug produced for min happens to
  // land "before" any real date anyway, so this assertion is `true` whether
  // the bug is present or fixed — it documents the intended behavior, but
  // the maxDateIsValid test below is the one that actually distinguishes
  // the fix from the bug (year 621 is never "after" a real date either way,
  // which used to make maxDateIsValid permanently false instead).
  it('minDateIsValid stays true (no constraint enforced) rather than always false for a malformed minDate', () => {
    fixture.componentRef.setInput('minDate', 'not a date');
    (component as any).inputElementValue.set('1405/06/15');
    fixture.detectChanges();

    expect(component.minDateIsValid).toBe(true);
  });

  it('maxDateIsValid stays true (no constraint enforced) rather than always false for a malformed maxDate', () => {
    fixture.componentRef.setInput('maxDate', 'not a date');
    (component as any).inputElementValue.set('1405/06/15');
    fixture.detectChanges();

    expect(component.maxDateIsValid).toBe(true);
  });
});

/**
 * onViewDateChange's typed-input fallback used to only try matched date/time
 * paddings together (padded date + padded time, or unpadded date + unpadded
 * time) — a mixed-padding shape like a padded date with an unpadded time was
 * silently rejected, even though the exact same shape was already accepted
 * for a *bound* minDate/maxDate value via UtilsService.parseJalaliDate. Both
 * now build their candidate list the same way (UtilsService.withTimeOfDay),
 * so typing and binding accept the same shapes.
 */
describe('onViewDateChange accepts every date/time padding combination, not just matched pairs', () => {
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
    fixture.detectChanges();
  });

  it('accepts a padded date typed with an unpadded time', () => {
    component.onViewDateChange('1405/06/15 8:30:5');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
  });

  it('accepts an unpadded date typed with a padded time', () => {
    component.onViewDateChange('1405/6/15 08:30:05');
    fixture.detectChanges();

    expect(component.selected().length).toBe(1);
  });
});
