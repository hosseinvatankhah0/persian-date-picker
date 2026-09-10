import {ChangeDetectorRef, ElementRef, Injector, runInInjectionContext} from '@angular/core';
import moment from 'jalali-moment';
import {PersianDatePickerComponent} from './index.component';

/**
 * writeValue() needs an ElementRef for the keydown listener it wires up in
 * ngOnInit — a bare object with an inert nativeElement is enough since these
 * tests never call ngOnInit itself.
 */
function createPicker(injector: Injector, locale: 'fa' | 'en', mode: 'day' | 'month' | 'time' | 'daytime' = 'day'): PersianDatePickerComponent {
  const fakeElement = {addEventListener() {}} as unknown as HTMLElement;
  const picker = runInInjectionContext(injector, () => new PersianDatePickerComponent(new ElementRef(fakeElement)));
  picker.locale = locale;
  picker.mode = mode;
  return picker;
}

/** formatValue() is private — it's the exact method behind both onChange and
 * inputModelChange, so reading it directly here tests the real output logic
 * without needing the full ControlValueAccessor emit plumbing. */
function outputOf(picker: PersianDatePickerComponent): string | string[] {
  return (picker as any).formatValue();
}

describe('Locale-aware picker output', () => {
  const injector = Injector.create({
    providers: [{provide: ChangeDetectorRef, useValue: {markForCheck() {}}}]
  });

  it('normalizes a bound value to the picker\'s own locale, not the value\'s origin', () => {
    // Simulates a server response bound in via [(ngModel)]: a Gregorian ISO
    // date on a picker configured for locale="fa".
    const picker = createPicker(injector, 'fa');
    picker.writeValue('2026-09-09');

    expect(picker.dateObject!.locale()).toBe('fa');
    expect(outputOf(picker)).toBe('1405/06/18');
  });

  it('still emits Jalali model output when locale is en, since `locale` only drives the UI/display, not the model format', () => {
    const picker = createPicker(injector, 'en');
    picker.writeValue('2026-09-09');

    expect(picker.dateObject!.locale()).toBe('en');
    expect(outputOf(picker)).toBe('1405/06/18');
  });

  it('emits Jalali month output for locale fa without needing an explicit j-prefixed format', () => {
    const picker = createPicker(injector, 'fa', 'month');
    picker.writeValue('2026-09-09');

    expect(outputOf(picker)).toBe('1405/06');
  });

  it('normalizes every entry of a bound range to the configured locale', () => {
    const picker = createPicker(injector, 'fa');
    picker.selectionMode = 'range';
    picker.writeValue(['2026-09-09', '2026-09-14']);

    expect(picker.rangeObject.every(m => m.locale() === 'fa')).toBeTruthy();
    expect(outputOf(picker)).toEqual(['1405/06/18', '1405/06/23']);
  });

  it('re-locales a bound moment to the picker\'s locale rather than trusting the moment\'s own', () => {
    const picker = createPicker(injector, 'fa');
    // A moment instance handed in from elsewhere in the app, already
    // carrying a different locale of its own.
    picker.writeValue(moment('2026-09-09').locale('en'));

    expect(picker.dateObject!.locale()).toBe('fa');
    expect(outputOf(picker)).toBe('1405/06/18');
  });
});
