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
