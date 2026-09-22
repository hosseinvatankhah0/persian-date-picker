/* eslint-disable */
// @ts-nocheck
import {FormsModule} from '@angular/forms';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import moment from 'jalali-moment';
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
 * transformToJalali() used a bare `momentNs(value)` fallback for a raw
 * Jalali-shaped minDate/maxDate string — reachable directly through
 * <dp-date-picker-modal> or the `dp-date-picker` directive, both publicly
 * exported, without PersianDatePickerComponent's own pre-normalization to a
 * Moment. That bare constructor reads against jalali-moment's *global*
 * locale, which defaults to 'en' — so `minDate="'1405/01/01'"` on a page
 * that never called `moment.locale('fa')` got silently misread as a
 * Gregorian-calendar date instead of Jalali year 1405, in both the
 * minDateIsValid/maxDateIsValid comparison and the min/max error message
 * text itself (`{{ transformToJalali(minDate()) }}` in the template).
 */
describe('transformToJalali reads a Jalali-shaped min/max string correctly regardless of the ambient locale', () => {
  let component: DatePickerModalComponent;
  let fixture: ComponentFixture<DatePickerModalComponent>;

  beforeEach(() => {
    // The default jalali-moment global locale, and what it is on a page that
    // never touched a 'fa'-locale picker before this one — the exact
    // condition under which the old bare `momentNs(value)` fallback broke.
    moment.locale('en');
  });

  afterEach(() => {
    // jalali-moment's locale is a module-level global, not scoped to this
    // test file's own import — leaving it mutated here would leak into
    // whichever other spec runs next in the same process.
    moment.locale('fa');
  });

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

  it('renders a raw Jalali-shaped minDate string as itself, not a misread Gregorian date', () => {
    fixture.componentRef.setInput('minDate', '1405/01/01');
    fixture.detectChanges();

    expect(component.transformToJalali(component.minDate())).toBe('1405/01/01');
  });

  it('renders a raw Jalali-shaped maxDate string as itself', () => {
    fixture.componentRef.setInput('maxDate', '1405/12/29');
    fixture.detectChanges();

    expect(component.transformToJalali(component.maxDate())).toBe('1405/12/29');
  });

  it('still reads a Gregorian-shaped minDate string as Gregorian', () => {
    fixture.componentRef.setInput('minDate', '2016-10-25');
    fixture.detectChanges();

    const result = component.transformToJalali(component.minDate());
    expect(moment(result, 'jYYYY/jMM/jDD').locale('en').isSame(moment('2016-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);
  });

  /**
   * jalali-moment's `moment.from`/`moment()` throw outright for an
   * implausible-but-numeric year (its internal 33-year Jalali cycle table
   * has a hard bound) rather than returning an invalid moment — the same
   * throw risk parseGregorianDate/parseJalaliDate already guard against with
   * try/catch. transformToJalali must never reach for either directly once
   * both of those return null for a shape like this (a Jalali-looking date
   * with a year outside the supported range) — moment.invalid() instead.
   */
  it('does not throw for a numeric-but-implausible bound year', () => {
    fixture.detectChanges();

    // Called directly with the string, not through [minDate] — binding an
    // implausible year there trips a separate, pre-existing throw of its own
    // inside componentConfig()/getConfig() (UtilsService.convertToMoment),
    // unrelated to transformToJalali; that one is out of scope here.
    expect(() => component.transformToJalali('99999/01/01')).not.toThrow();
  });

  it('renders "Invalid date" rather than a fabricated real-looking date for unparseable text', () => {
    fixture.detectChanges();

    expect(component.transformToJalali('not a date')).toBe('Invalid date');
  });
});

/**
 * A leading year at or below 1500 is ambiguous on its own (both calendars
 * have real dates shaped that way), so parseGregorianDate alone falls
 * through to a Jalali reading below that threshold. But an 'en'-locale
 * picker has no legitimate reason to accept a Jalali bound at all — its own
 * configured locale should settle the ambiguity instead of the bare year
 * value, so a genuinely historical Gregorian bound isn't misread as Jalali
 * just because it's old.
 */
describe('transformToJalali uses the picker\'s own locale to resolve an ambiguous low-year bound', () => {
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

  it('reads a historical low-year Gregorian bound as Gregorian on an en-locale picker', () => {
    fixture.componentRef.setInput('config', {locale: 'en'});
    fixture.detectChanges();

    // toFormat defaults to 'jYYYY/jMM/jDD' — the 'j' tokens always read the
    // moment's real underlying instant through the Jalali calendar regardless
    // of locale, so re-parsing that output the same way and comparing gives
    // an unambiguous check of which Gregorian instant was actually stored.
    const result = component.transformToJalali('1499-06-15');
    const expected = moment.from('1499-06-15', 'en', 'YYYY-MM-DD');
    expect(moment(result, 'jYYYY/jMM/jDD').isSame(expected, 'day')).toBe(true);
  });

  it('still reads the same low-year string as Jalali on the default fa-locale picker', () => {
    fixture.detectChanges();

    expect(component.transformToJalali('1499/06/15')).toBe('1499/06/15');
  });
});

describe('UtilsService.parseJalaliDate', () => {
  afterEach(() => {
    moment.locale('fa');
  });

  it('reads a slash-separated Jalali date explicitly, ignoring the ambient locale', () => {
    moment.locale('en');
    const parsed = UtilsService.parseJalaliDate('1405/01/01')!;
    expect(parsed).not.toBeNull();
    expect(parsed.jYear()).toBe(1405);
    expect(parsed.jMonth()).toBe(0);
    expect(parsed.jDate()).toBe(1);
  });

  it('reads a dash-separated Jalali date', () => {
    const parsed = UtilsService.parseJalaliDate('1405-06-15')!;
    expect(parsed).not.toBeNull();
    expect(parsed.jYear()).toBe(1405);
    expect(parsed.jMonth()).toBe(5);
    expect(parsed.jDate()).toBe(15);
  });

  /**
   * Both index.component.ts's own jalaliFormats and onViewDateChange's
   * typed-input fallback already accept this compact, no-separator shape for
   * the same picker's own value — a minDate/maxDate bound deserves the same
   * tolerance instead of rendering "Invalid date" for a shape the rest of
   * the library already treats as valid.
   */
  it('reads a compact, no-separator Jalali date', () => {
    const parsed = UtilsService.parseJalaliDate('14050605')!;
    expect(parsed).not.toBeNull();
    expect(parsed.jYear()).toBe(1405);
    expect(parsed.jMonth()).toBe(5);
    expect(parsed.jDate()).toBe(5);
  });

  /**
   * A shared host helper that always appends a time-of-day regardless of
   * what the target picker actually needs (e.g. `JDate.now.format('YYYY-MM-DD
   * HH:mm:ss')`) is exactly the shape index.component.ts's own jalaliFormats
   * already accommodates for a *bound value* — a minDate/maxDate string
   * deserves the same tolerance, padded or not.
   */
  it('reads a Jalali date carrying a padded time', () => {
    const parsed = UtilsService.parseJalaliDate('1405/01/01 00:00:00')!;
    expect(parsed).not.toBeNull();
    expect(parsed.jYear()).toBe(1405);
    expect(parsed.jMonth()).toBe(0);
    expect(parsed.jDate()).toBe(1);
  });

  it('reads a Jalali date carrying an unpadded time', () => {
    const parsed = UtilsService.parseJalaliDate('1405/6/5 8:30:5')!;
    expect(parsed).not.toBeNull();
    expect(parsed.jYear()).toBe(1405);
    expect(parsed.jMonth()).toBe(5);
    expect(parsed.jDate()).toBe(5);
  });

  it('leaves anything not date-shaped to the caller', () => {
    expect(UtilsService.parseJalaliDate('not a date')).toBeNull();
  });
});
