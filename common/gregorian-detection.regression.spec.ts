import {vi} from 'vitest';
import moment from 'jalali-moment';
import {UtilsService} from './services/utils/utils.service';
import {DatePickerModalService} from '../date-picker/date-picker.service';
import {DayCalendarService} from '../day-calendar/day-calendar.service';
import {MonthCalendarService} from '../month-calendar/month-calendar.service';
import {TimeSelectService} from '../time-select/time-select.service';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';

/**
 * A Gregorian string used to mean two different dates depending on which public
 * entry point received it: PersianDatePickerComponent read `2016-10-25` as
 * Gregorian, while the exported services underneath read it against their
 * default 'fa' locale and landed on a Jalali year 2016 — the same input, ~621
 * years apart. These pin the single rule both now share.
 */
describe('Gregorian detection is the same rule at every entry point', () => {
  const utils = new UtilsService();

  describe('UtilsService.parseGregorianDate', () => {
    it('reads a four-digit year above 1500 as Gregorian', () => {
      const parsed = UtilsService.parseGregorianDate('2016-10-25')!;
      expect(parsed).not.toBeNull();
      expect(parsed.isSame(moment('2016-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);
    });

    it('accepts slashes, ISO and a .NET datetime alike', () => {
      for (const value of ['2026/06/12', '2026-06-12', '2026-06-12T00:00:00.000Z', '2026-06-12T08:30:00']) {
        const parsed = UtilsService.parseGregorianDate(value)!;
        expect(parsed).not.toBeNull();
        expect(parsed.format('YYYY-MM-DD')).toBe('2026-06-12');
      }
    });

    it('leaves a Jalali-range year to the caller', () => {
      expect(UtilsService.parseGregorianDate('1405/03/22')).toBeNull();
    });

    it('leaves anything not date-shaped to the caller', () => {
      expect(UtilsService.parseGregorianDate('not a date')).toBeNull();
      expect(UtilsService.parseGregorianDate('2016')).toBeNull();
    });
  });

  describe('min/max bounds on the exported services', () => {
    /* The bug this covers: every one of these defaults to locale 'fa', so
       before the shared rule a plain Gregorian bound silently became a Jalali
       one. */
    const expectBoundsAreGregorian = (config: any) => {
      expect(config.min.isSame(moment('2016-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);
      expect(config.max.isSame(moment('2017-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);
    };

    it('DatePickerModalService, at its default fa locale', () => {
      const timeSelect = new TimeSelectService(utils);
      const service = new DatePickerModalService(
        utils,
        timeSelect,
        new DayTimeCalendarService(utils, new DayCalendarService(utils), timeSelect)
      );
      expectBoundsAreGregorian(service.getConfig({min: '2016-10-25', max: '2017-10-25'} as any));
    });

    it('DayCalendarService, at its default fa locale', () => {
      const service = new DayCalendarService(utils);
      expectBoundsAreGregorian(service.getConfig({min: '2016-10-25', max: '2017-10-25'} as any));
    });

    it('MonthCalendarService, at its default fa locale', () => {
      const service = new MonthCalendarService(utils);
      expectBoundsAreGregorian(service.getConfig({min: '2016-10-25', max: '2017-10-25'} as any));
    });
  });

  describe('convertToMoment', () => {
    it('puts a detected Gregorian date back on the configured calendar', () => {
      const m = utils.convertToMoment('2026-06-12', 'YYYY-MM-DD', 'fa');
      expect(m.locale()).toBe('fa');
      // Same instant, now readable as the Jalali date the picker will render.
      expect(m.format('jYYYY/jMM/jDD')).toBe('1405/03/22');
    });

    it('still parses a Jalali string against the given locale', () => {
      const m = utils.convertToMoment('1405/03/22', 'jYYYY/jMM/jDD', 'fa');
      /* Read back through 'en' on purpose: plain YYYY-MM-DD tokens follow
         whatever calendar the moment's locale is on, so asking a fa-localed
         moment for them returns the Jalali parts, not the Gregorian instant
         this is checking. */
      expect(m.clone().locale('en').format('YYYY-MM-DD')).toBe('2026-06-12');
    });
  });

  /**
   * convertToMomentArray is the writeValue() path for every standalone
   * calendar export (DayCalendarComponent, MonthCalendarComponent, etc. —
   * see date-picker.component.ts:263, day-calendar.component.ts:214). It used
   * to parse a string through the bare `moment(value, format, true)`
   * constructor, which reads `format` against jalali-moment's *global*
   * ambient locale rather than the `locale` argument actually passed in — the
   * exact bug this file's other cases pin for convertToMoment, just missed
   * in this twin function.
   *
   * These check that the fix (moment.from(value, locale, format)) is what
   * actually runs, rather than reproducing the bug by mutating jalali-
   * moment's real global locale: that global state is one shared module
   * instance across every spec file in the suite, so a test that flips it
   * (even with an afterEach reset) is a race against whatever else the
   * runner executes concurrently — confirmed by this exact scenario
   * corrupting an unrelated, unchanged test in persian-date-picker/locale-
   * output.regression.spec.ts the first time it was tried.
   */
  describe('convertToMomentArray', () => {
    it('parses a Gregorian string against the given locale, not moment\'s ambient one', () => {
      const spy = vi.spyOn(moment, 'from');
      const [m] = utils.convertToMomentArray('2016-10-25', 'YYYY-MM-DD', false, 'en');
      expect(spy).toHaveBeenCalledWith('2016-10-25', 'en', 'YYYY-MM-DD');
      expect(m.clone().locale('en').format('YYYY-MM-DD')).toBe('2016-10-25');
      spy.mockRestore();
    });

    it('parses a Gregorian string array the same way', () => {
      const spy = vi.spyOn(moment, 'from');
      const [m] = utils.convertToMomentArray(['2016-10-25'], 'YYYY-MM-DD', true, 'en');
      expect(spy).toHaveBeenCalledWith('2016-10-25', 'en', 'YYYY-MM-DD');
      expect(m.clone().locale('en').format('YYYY-MM-DD')).toBe('2016-10-25');
      spy.mockRestore();
    });
  });
});
