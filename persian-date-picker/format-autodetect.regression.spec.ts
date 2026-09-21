import {ChangeDetectorRef, ElementRef, Injector, runInInjectionContext} from '@angular/core';
import {PersianDatePickerComponent} from './index.component';

/**
 * writeValue() needs an ElementRef for the keydown listener it wires up in
 * ngOnInit — a bare object with an inert nativeElement is enough since these
 * tests never call ngOnInit itself.
 */
function createPicker(injector: Injector, overrides: Partial<PersianDatePickerComponent> = {}): PersianDatePickerComponent {
  const fakeElement = {addEventListener() {}} as unknown as HTMLElement;
  const picker = runInInjectionContext(injector, () => new PersianDatePickerComponent(new ElementRef(fakeElement)));
  Object.assign(picker, overrides);
  return picker;
}

/** formatValue() is private — it's the exact method behind both onChange and
 * inputModelChange, so reading it directly here tests the real output logic
 * without needing the full ControlValueAccessor emit plumbing. */
function outputOf(picker: PersianDatePickerComponent): string | string[] {
  return (picker as any).formatValue();
}

describe('Gregorian input auto-detection with a Jalali-default model format', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  it('detects a slash-separated Gregorian date and converts it to the default Jalali model format', () => {
    const picker = createPicker(injector);
    picker.writeValue('2026/06/12');

    expect(outputOf(picker)).toBe('1405/03/22');
  });

  it('detects a dash-separated Gregorian date', () => {
    const picker = createPicker(injector);
    picker.writeValue('2026-06-12');

    expect(outputOf(picker)).toBe('1405/03/22');
  });

  it('detects a full ISO 8601 datetime string', () => {
    const picker = createPicker(injector);
    picker.writeValue('2026-06-12T00:00:00.000Z');

    expect(outputOf(picker)).toBe('1405/03/22');
  });

  it('detects a .NET-style datetime string without milliseconds/zone', () => {
    const picker = createPicker(injector);
    picker.writeValue('2026-06-12T08:30:00');

    expect(outputOf(picker)).toBe('1405/03/22');
  });

  it('still accepts a Jalali-formatted string directly', () => {
    const picker = createPicker(injector);
    picker.writeValue('1405/03/22');

    expect(outputOf(picker)).toBe('1405/03/22');
  });
});

describe('Explicit `format` input opts out of auto-detection', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  it('keeps Gregorian output end-to-end when the consumer declares a Gregorian format', () => {
    const picker = createPicker(injector, {format: 'YYYY-MM-DD'});
    picker.writeValue('2026-06-12');

    expect(outputOf(picker)).toBe('2026-06-12');
  });

  it('parses strictly against an explicit Jalali format', () => {
    const picker = createPicker(injector, {format: 'jYYYY-jMM-jDD'});
    picker.writeValue('1405-03-22');

    expect(outputOf(picker)).toBe('1405-03-22');
  });

  it('applies to range values too', () => {
    const picker = createPicker(injector, {format: 'YYYY-MM-DD', selectionMode: 'range'});
    picker.writeValue(['2026-06-12', '2026-06-20']);

    expect(outputOf(picker)).toEqual(['2026-06-12', '2026-06-20']);
  });

  /**
   * The doc comment on parseToMoment's explicit-format branch says "ISO is
   * allowed alongside a Gregorian format ... the shape is looser" — but the
   * fallback only fired for a string containing a literal "T", so a plain
   * ISO date (no time part, exactly what a server sends for a date-only
   * field) or a .NET DateTimeOffset's numeric zone ("+03:30") fell through
   * to null and got silently dropped instead of bound, contradicting that
   * comment.
   */
  it('accepts a plain ISO date against a differently-shaped declared format', () => {
    const picker = createPicker(injector, {format: 'DD-MM-YYYY'});
    picker.writeValue('2026-06-12');

    expect(picker.hasValue).toBe(true);
    expect(outputOf(picker)).toBe('12-06-2026');
  });

  it('accepts an ISO datetime with a numeric UTC offset against a declared format', () => {
    const picker = createPicker(injector, {format: 'DD-MM-YYYY'});
    picker.writeValue('2026-06-12T08:30:00+03:30');

    expect(picker.hasValue).toBe(true);
    expect(outputOf(picker)).toBe('12-06-2026');
  });
});

describe('Writing a value in normalizes the model itself, not just the display', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  /** writeValue() defers its write-back to a microtask, so tests have to let
   * the queue drain before reading what the host would have received. */
  const flush = () => new Promise<void>(resolve => queueMicrotask(() => resolve()));

  it('pushes the converted Jalali value back through the change callback', async () => {
    const picker = createPicker(injector);
    let modelValue: unknown = null;
    picker.registerOnChange((v: unknown) => modelValue = v);

    picker.writeValue('2026-06-12T08:30:00');
    await flush();

    expect(modelValue).toBe('1405/03/22');
  });

  it('normalizes each entry of a bound range', async () => {
    const picker = createPicker(injector, {selectionMode: 'range'});
    let modelValue: unknown = null;
    picker.registerOnChange((v: unknown) => modelValue = v);

    picker.writeValue(['2026-06-12', '2026-06-20']);
    await flush();

    expect(modelValue).toEqual(['1405/03/22', '1405/03/30']);
  });

  it('stays quiet when the bound value already matches the model format', async () => {
    const picker = createPicker(injector);
    let emitted = false;
    picker.registerOnChange(() => emitted = true);

    picker.writeValue('1405/03/22');
    await flush();

    expect(emitted).toBeFalsy();
  });

  it('leaves an unparseable value alone rather than clobbering it', async () => {
    const picker = createPicker(injector);
    let emitted = false;
    picker.registerOnChange(() => emitted = true);

    picker.writeValue('not a date');
    await flush();

    expect(emitted).toBeFalsy();
  });

  it('does not rewrite the model when the consumer declared the format themselves', async () => {
    const picker = createPicker(injector, {format: 'YYYY-MM-DD'});
    let emitted = false;
    picker.registerOnChange(() => emitted = true);

    picker.writeValue('2026-06-12');
    await flush();

    expect(emitted).toBeFalsy();
  });
});

describe('Compact 8-digit Jalali input, and malformed-year safety', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  it('keeps both modal and inline field triggers off by default', () => {
    const picker = createPicker(injector);
    picker.configure();
    expect(picker.config.openOnClick).toBe(false);
    expect(picker.config.openOnFocus).toBe(false);
    expect(picker.inlineConfig.openOnClick).toBe(false);
    expect(picker.inlineConfig.openOnFocus).toBe(false);
  });

  it('parses a compact separator-less Jalali date (jYYYYMMDD)', () => {
    const picker = createPicker(injector);
    picker.writeValue('14050202');

    expect(outputOf(picker)).toBe('1405/02/02');
  });

  for (const value of ['1405-02-02', '1405/02/02',
    '2026-04-22T00:00:00.000Z', '2026-04-22T00:00:00', '2026-04-22 00:00:00',
    '2026-04-22T00:00:00Z', '2026-04-22 00:00:00Z', '2026-04-22 00:00:00.000']) {
    it(`accepts ${value} as a bound value`, () => {
      const picker = createPicker(injector);
      picker.writeValue(value);
      expect(outputOf(picker)).toBe('1405/02/02');
    });
  }

  it('does not throw on a compact value with a year outside the Jalali calendar\'s range', () => {
    // jalali-moment's own conversion throws for a year like this rather than
    // returning an invalid moment - the exact failure mode that made a
    // stray 8-digit paste able to crash the host app.
    const picker = createPicker(injector);

    expect(() => picker.writeValue('99999999')).not.toThrow();
    expect(picker.hasValue).toBeFalsy();
  });

  it('rejects a compact value of the wrong length rather than misreading it', () => {
    const picker = createPicker(injector);
    picker.writeValue('140502');

    expect(picker.hasValue).toBeFalsy();
  });

  it('does not cross-match a slash-separated value against the compact format', () => {
    const picker = createPicker(injector);
    picker.writeValue('1405/02/02');

    expect(outputOf(picker)).toBe('1405/02/02');
  });

  it('does not throw when the interactive-typing path (onModelChange) gets 8 digits with an implausible year', () => {
    // onModelChange's own digit-splitting path builds the moment with
    // jYear()/jMonth()/jDate() directly rather than going through
    // parseJalali - the same underlying jalali-moment throw applies there
    // too, so it needs the same guard.
    const picker = createPicker(injector);

    expect(() => picker.onModelChange('99999999')).not.toThrow();
    expect(picker.hasValue).toBeFalsy();
  });
});

describe('A Jalali value carrying a time-of-day on a date-only mode', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  /**
   * A host's own "N days from now" helper (built on jalali-moment the same
   * way this library is) commonly formats with a trailing 'HH:mm:ss'
   * regardless of what the bound picker actually needs — e.g.
   * `JDate.now.addDays(6).format('YYYY-MM-DD HH:mm:ss')`. Before this fix,
   * parseToMoment's Jalali fallback only tried date-only formats, so the
   * strict round-trip check in parseJalali() never matched a string with a
   * trailing time and the whole value was silently dropped instead of bound.
   */
  it('still binds when mode is day and the value has a trailing time', () => {
    const picker = createPicker(injector);
    picker.writeValue('1405-07-05 11:53:28');

    expect(picker.hasValue).toBe(true);
    expect(outputOf(picker)).toBe('1405/07/05');
  });

  it('also accepts the slash-separated form', () => {
    const picker = createPicker(injector);
    picker.writeValue('1405/07/05 11:53:28');

    expect(picker.hasValue).toBe(true);
    expect(outputOf(picker)).toBe('1405/07/05');
  });
});

describe('`displayFormat` governs only the text box, independent of `format`', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  it('defaults the text box to the mode format interpreted against `locale`, separate from the Jalali-default model format', () => {
    const picker = createPicker(injector, {locale: 'en'});
    picker.writeValue('2026-06-12');

    expect(picker.config.format).toBe('YYYY/MM/DD');
    expect(outputOf(picker)).toBe('1405/03/22');
  });

  it('honors an explicit display-format independent of the model format', () => {
    const picker = createPicker(injector, {displayFormat: 'jYYYY-jMM-jDD', format: 'YYYY-MM-DD'});
    picker.writeValue('2026-06-12');

    expect(picker.config.format).toBe('jYYYY-jMM-jDD');
    expect(outputOf(picker)).toBe('2026-06-12');
  });
});
