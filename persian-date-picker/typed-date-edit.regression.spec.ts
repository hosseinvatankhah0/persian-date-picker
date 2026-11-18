import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {DatePickerModalComponent} from '../date-picker/date-picker.component';
import {PersianDatePickerComponent} from './index.component';

@Component({
  imports: [PersianDatePickerComponent, ReactiveFormsModule],
  template: `
    <app-persian-date-picker
      [formControl]="control"
      [display-format]="displayFormat"
      [locale]="locale"
      [format]="format"
      [mode]="mode"
      [showActionButtons]="showActionButtons"
      [minDate]="minDate"
      [maxDate]="maxDate" />
  `,
})
class DatePickerHost {
  control = new FormControl('1405/09/22');
  displayFormat?: string;
  locale: 'fa' | 'en' = 'fa';
  format?: string;
  mode: 'day' | 'daytime' | 'time' = 'day';
  showActionButtons?: boolean;
  minDate = '1926/01/01';
  maxDate = '2046/12/31';
}

describe('editing a typed date in the form', () => {
  const segmentEdits = [
    {segment: 'year', start: 0, end: 4, digits: '1406', expected: '1406/09/22'},
    {segment: 'month', start: 5, end: 7, digits: '10', expected: '1405/10/22'},
    {segment: 'day', start: 8, end: 10, digits: '17', expected: '1405/09/17'},
  ];

  async function setup(
    start: number,
    end: number,
    initial = '1405/09/22',
    options: Partial<Omit<DatePickerHost, 'control'>> = {}
  ) {
    const fixture = TestBed.createComponent(DatePickerHost);
    const host = Object.assign(fixture.componentInstance, options);
    const control = host.control;
    control.setValue(initial);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await settle();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.dp-picker-input');
    const picker: DatePickerModalComponent =
      fixture.debugElement.query(By.directive(DatePickerModalComponent)).componentInstance;
    input.focus();
    input.setSelectionRange(start, end);

    const replace = async (text: string, inputType: 'insertText' | 'insertFromPaste' | 'deleteContentBackward') => {
      const event = {bubbles: true, data: text, inputType};
      input.dispatchEvent(new InputEvent('beforeinput', event));
      input.setRangeText(text, input.selectionStart!, input.selectionEnd!, 'end');
      input.dispatchEvent(new InputEvent('input', event));
      await settle();
    };
    const selected = () => picker.selected()[0].clone().locale('fa').format('jYYYY/jMM/jDD');
    return {control, input, picker, selected, settle, replace};
  }

  it.each([
    ...segmentEdits.map(edit => ({...edit, initial: '1405/09/22'})),
    {segment: 'day', start: 8, end: 10, digits: '17', initial: '1405/10/22', expected: '1405/10/17'},
  ])('keeps the caret in place when typing the $segment to select $expected', async ({start, end, digits, initial, expected}) => {
    const {control, input, selected, replace} = await setup(start, end, initial);
    const changes: (string | null)[] = [];
    control.valueChanges.subscribe(value => changes.push(value));

    for (let index = 0; index < digits.length - 1; index++) {
      await replace(digits[index], 'insertText');
      expect(input.value).toBe(initial.slice(0, start) + digits.slice(0, index + 1) + initial.slice(end));
      expect(input.selectionStart).toBe(start + index + 1);
      expect(control.value).toBe(initial);
    }

    await replace(digits[digits.length - 1], 'insertText');
    expect(input.value).toBe(expected);
    expect(input.selectionStart).toBe(end);
    expect(selected()).toBe(expected);
    expect(control.value).toBe(expected);
    expect(changes).toEqual([expected]);
  });

  it.each([
    ...segmentEdits,
    {segment: 'one-digit month', start: 5, end: 7, digits: '1', expected: '1405/01/22'},
    {segment: 'whole date with a one-digit day', start: 0, end: 10, digits: '1405/10/1', expected: '1405/10/01'},
  ])('selects $expected as soon as the user pastes the $segment', async ({start, end, digits, expected}) => {
    const {control, input, selected, replace} = await setup(start, end);

    await replace(digits, 'insertFromPaste');

    expect(document.activeElement).toBe(input);
    expect(input.value).toBe(expected);
    expect(selected()).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it.each([4, 6, 7, 10])('drops an extra typed digit at position %i', async caret => {
    const {control, input, selected, replace} = await setup(caret, caret);
    const changes: (string | null)[] = [];
    control.valueChanges.subscribe(value => changes.push(value));

    await replace('8', 'insertText');

    expect(input.value).toBe('1405/09/22');
    expect(input.selectionStart).toBe(caret);
    expect(selected()).toBe('1405/09/22');
    expect(changes).toEqual([]);
  });

  it.each([
    {pasted: '14059/109/227', expected: '1405/10/22'},
    {pasted: '140510171234', expected: '1405/10/17'},
    {pasted: '2026-04-22T00:00:00.000Z', expected: '1405/02/02'},
  ])('registers the date after pasting $pasted', async ({pasted, expected}) => {
    const {control, input, selected, replace} = await setup(0, 10);

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(expected);
    expect(selected()).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it('limits a pasted date using a year-last display format', async () => {
    const {control, input, replace} = await setup(0, 10, '1405/09/22', {displayFormat: 'jDD-jMM-jYYYY'});

    await replace('179-102-14059', 'insertFromPaste');

    expect(input.value).toBe('17-10-1405');
    expect(control.value).toBe('1405/10/17');
  });

  it('keeps the year and time when replacing the day digit by digit in a year-last datetime', async () => {
    const initial = '1405/07/17 08:19:05';
    const {control, input, replace} = await setup(0, 2, initial, {
      mode: 'daytime',
      displayFormat: 'jDD-jMM-jYYYY[T]HH:mm:ss',
    });
    const changes: (string | null)[] = [];
    control.valueChanges.subscribe(value => changes.push(value));
    expect(input.value).toBe('17-07-1405T08:19:05');

    await replace('2', 'insertText');
    expect(input.value).toBe('2-07-1405T08:19:05');
    expect(input.selectionStart).toBe(1);
    expect(changes).toEqual([]);

    await replace('5', 'insertText');
    expect(input.value).toBe('25-07-1405T08:19:05');
    expect(input.selectionStart).toBe(2);
    expect(control.value).toBe('1405/07/25 08:19:05');
    expect(changes).toEqual(['1405/07/25 08:19:05']);
  });

  it.each([
    {displayFormat: 'jDD-jMM-jYYYY', pasted: '1405-09-227', display: '22-09-1405', expected: '1405/09/22'},
    {displayFormat: 'jMM/jYYYY/jDD', pasted: '1406/1405/22', display: '12/1405/22', expected: '1405/12/22'},
  ])('identifies the year before trimming $pasted', async ({displayFormat, pasted, display, expected}) => {
    const {control, input, replace} = await setup(0, 10, '1405/09/17', {displayFormat});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(display);
    expect(control.value).toBe(expected);
  });

  it('clamps Gregorian February before trying a Jalali fallback in a reordered display', async () => {
    const {control, input, replace} = await setup(0, 10, '1405/09/22', {displayFormat: 'jYYYY-jDD-jMM'});

    await replace('2026-02-31', 'insertFromPaste');

    expect(input.value).toBe('1404-09-12');
    expect(control.value).toBe('1404/12/09');
  });

  it('synchronizes the field when a corrected paste resolves to the already selected date', async () => {
    const {control, input, replace} = await setup(0, 10, '1404/12/09', {displayFormat: 'jYYYY/jMM/jDD'});

    await replace('2026/02/34', 'insertFromPaste');

    expect(input.value).toBe('1404/12/09');
    expect(control.value).toBe('1404/12/09');
  });

  it.each([
    {displayFormat: 'jYYYY-jDD-jMM', pasted: '1405-20-09', expected: '1405/09/20'},
    {displayFormat: 'jDDjMMjYYYY', pasted: '17051405', expected: '1405/05/17'},
  ])('preserves the date when pasting into $displayFormat', async ({displayFormat, pasted, expected}) => {
    const {control, input, replace} = await setup(0, pasted.length, '1405/09/22', {displayFormat});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(pasted);
    expect(control.value).toBe(expected);
  });

  it.each([
    {displayFormat: 'jYYYY-jDD-jMM', pasted: '1405-09-20', display: '1405-20-09', expected: '1405/09/20'},
    {displayFormat: 'jMMjDDjYYYY', pasted: '14050922', display: '09221405', expected: '1405/09/22'},
  ])('preserves a valid canonical fallback when displaying $displayFormat', async ({displayFormat, pasted, display, expected}) => {
    const {control, input, replace} = await setup(0, pasted.length, '1405/09/17', {displayFormat});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(display);
    expect(control.value).toBe(expected);
  });

  it.each([
    {displayFormat: 'jYYYY[/]jDD[/]jMM', pasted: '1405/20/09', display: '1405/20/09', expected: '1405/09/20'},
    {displayFormat: 'jYYYY[/]jDD[/]jMM', pasted: '1405/34/07', display: '1405/30/07', expected: '1405/07/30'},
    {displayFormat: 'jDD[.]jMM[.]jYYYY', pasted: '17.05.1405', display: '17.05.1405', expected: '1405/05/17'},
  ])('uses the date order of escaped separators in $displayFormat', async ({displayFormat, pasted, display, expected}) => {
    const {control, input, replace} = await setup(0, pasted.length, '1405/09/22', {displayFormat});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(display);
    expect(control.value).toBe(expected);
  });

  it.each([
    {pasted: '04/22/2026', display: '04/22/2026', expected: '1405/02/02'},
    {pasted: '04/34/2026', display: '04/30/2026', expected: '1405/02/10'},
  ])('uses the English localized numeric order when pasting $pasted', async ({pasted, display, expected}) => {
    const {control, input, replace} = await setup(0, 10, '1405/09/22', {locale: 'en', displayFormat: 'L'});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(display);
    expect(control.value).toBe(expected);
  });

  it.each([
    {pasted: '2026/02/34', expected: '1404/12/09'},
    {pasted: '2026-02-34', expected: '1404/12/09'},
    {pasted: '2026/02/31', expected: '1404/12/09'},
    {pasted: '2026-02-30', expected: '1404/12/09'},
    {pasted: '2024/02/34', expected: '1402/12/10'},
  ])('uses Gregorian February when pasting $pasted into an explicit Jalali display', async ({pasted, expected}) => {
    const {control, input, replace} = await setup(0, 10, '1405/09/22', {displayFormat: 'jYYYY/jMM/jDD'});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it('uses Jalali month lengths for explicit Jalali tokens in an English picker', async () => {
    const {control, input, replace} = await setup(0, 10, '1405/09/22', {
      locale: 'en',
      displayFormat: 'jYYYY/jMM/jDD',
    });

    await replace('1405/02/31', 'insertFromPaste');
    expect(input.value).toBe('1405/02/31');
    expect(control.value).toBe('1405/02/31');

    input.select();
    await replace('1405/07/34', 'insertFromPaste');
    expect(input.value).toBe('1405/07/30');
    expect(control.value).toBe('1405/07/30');
  });

  it.each(['Enter', 'ArrowDown'])('keeps the typed date when opening with %s and cancelling', async key => {
    const {control, input, picker, selected, settle, replace} = await setup(5, 7, '1405/09/22', {
      showActionButtons: true,
    });
    await replace('1', 'insertText');
    expect(control.value).toBe('1405/09/22');

    input.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
    expect(picker.isModalOpen()).toBe(true);
    input.blur();
    await settle();
    expect(control.value).toBe('1405/01/22');

    picker.closeModal();
    await settle();
    expect(picker.isModalOpen()).toBe(false);
    expect(input.value).toBe('1405/01/22');
    expect(selected()).toBe('1405/01/22');
    expect(control.value).toBe('1405/01/22');
  });

  it.each([
    {initial: '1405/06/22', digits: '34', expected: '1405/06/31'},
    {initial: '1405/07/22', digits: '۳۴', expected: '1405/07/30'},
    {initial: '1405/12/22', digits: '34', expected: '1405/12/29'},
    {initial: '1403/12/22', digits: '34', expected: '1403/12/30'},
  ])('limits the typed day of $initial to $expected', async ({initial, digits, expected}) => {
    const {control, input, selected, replace} = await setup(8, 10, initial);

    await replace(digits[0], 'insertText');
    expect(control.value).toBe(initial);
    await replace(digits[1], 'insertText');

    expect(input.value).toBe(expected);
    expect(input.selectionStart).toBe(10);
    expect(selected()).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it('limits the typed month and adjusts the day to fit the new month', async () => {
    const {control, input, selected, replace} = await setup(5, 7, '1405/06/31');

    await replace('1', 'insertText');
    expect(control.value).toBe('1405/06/31');
    await replace('4', 'insertText');

    expect(input.value).toBe('1405/12/29');
    expect(input.selectionStart).toBe(7);
    expect(selected()).toBe('1405/12/29');
    expect(control.value).toBe('1405/12/29');
  });

  it('adjusts Esfand 30 when typing a non-leap year', async () => {
    const {control, input, replace} = await setup(0, 4, '1403/12/30');

    for (const digit of '1405') {
      await replace(digit, 'insertText');
    }

    expect(input.value).toBe('1405/12/29');
    expect(input.selectionStart).toBe(4);
    expect(control.value).toBe('1405/12/29');
  });

  it.each([
    {pasted: '1405/15/34', expected: '1405/12/29', display: '1405/12/29', displayFormat: undefined},
    {pasted: '۱۴۰۳۱۲۳۴', expected: '1403/12/30', display: '1403/12/30', displayFormat: undefined},
    {pasted: '34-15-1405', expected: '1405/12/29', display: '29-12-1405', displayFormat: 'jDD-jMM-jYYYY'},
    {pasted: '2026-02-34T08:30:05Z', expected: '1404/12/09', display: '1404/12/09', displayFormat: undefined},
    {pasted: '2024-02-34T08:30:05Z', expected: '1402/12/10', display: '1402/12/10', displayFormat: undefined},
  ])('clamps out-of-range parts when pasting $pasted', async ({pasted, expected, display, displayFormat}) => {
    const {control, input, selected, replace} = await setup(0, 10, '1405/09/22', {displayFormat});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(display);
    expect(selected()).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it.each([
    {finish: true, expected: '2026/12/31'},
    {finish: false, expected: '2026/02/28'},
  ])('preserves the original day while February could still be a partial month: $expected', async ({finish, expected}) => {
    const {control, input, settle, replace} = await setup(5, 7, '2026/01/31', {
      locale: 'en',
      format: 'YYYY/MM/DD',
    });

    await replace('2', 'insertText');
    expect(input.value).toBe('2026/2/31');
    expect(input.selectionStart).toBe(6);
    expect(control.value).toBe('2026/01/31');

    if (finish) {
      await replace('0', 'insertText');
    } else {
      input.blur();
      await settle();
    }

    expect(input.value).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it.each([
    {caret: 4, withoutSeparator: '140509/22'},
    {caret: 7, withoutSeparator: '1405/0922'},
  ])('keeps the date digits when deleting and retyping the separator at $caret', async ({caret, withoutSeparator}) => {
    const {control, input, replace} = await setup(caret, caret + 1);

    await replace('', 'deleteContentBackward');
    expect(input.value).toBe(withoutSeparator);
    expect(input.selectionStart).toBe(caret);
    expect(control.value).toBe('1405/09/22');

    await replace('/', 'insertText');
    expect(input.value).toBe('1405/09/22');
    expect(control.value).toBe('1405/09/22');
  });

  it.each([
    {limits: {minDate: '1405/08/01'}, initial: '1405/08/22', rejected: '1405/07/30'},
    {limits: {maxDate: '1405/07/29'}, initial: '1405/07/22', rejected: '1405/07/30'},
  ])('checks form bounds after normalizing the date with $limits', async ({limits, initial, rejected}) => {
    const {control, input, replace} = await setup(0, 10, initial, limits);
    const changes: (string | null)[] = [];
    control.valueChanges.subscribe(value => changes.push(value));

    await replace('1405/07/34', 'insertFromPaste');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(changes).not.toContain(rejected);

    input.select();
    await replace(initial, 'insertFromPaste');
    expect(input.getAttribute('aria-invalid')).toBe(null);
    expect(control.value).toBe(initial);
  });

  it('keeps the time when correcting the day in a date-time input', async () => {
    const {control, input, replace} = await setup(0, 19, '1405/09/22 08:10:15', {mode: 'daytime'});

    await replace('1405/07/34 23:59:58', 'insertFromPaste');

    expect(input.value).toBe('1405/07/30 23:59:58');
    expect(control.value).toBe('1405/07/30 23:59:58');
  });

  it.each([
    {pasted: '2026/02/34 08:19:05', expected: '1404/12/09 08:19:05'},
    {pasted: '2026-02-34 08:19:05', expected: '1404/12/09 08:19:05'},
    {pasted: '2026/02/28 08:19:05', expected: '1404/12/09 08:19:05'},
    {pasted: '2024/2/34 8:19:5', expected: '1402/12/10 08:19:05'},
    {pasted: '2026/2/08 08:19:05', expected: '1404/11/19 08:19:05'},
    {pasted: '2026/02/8 08:19:05', expected: '1404/11/19 08:19:05'},
    {pasted: '2026-2-08 08:19:05', expected: '1404/11/19 08:19:05'},
    {pasted: '2026-02-8 08:19:05', expected: '1404/11/19 08:19:05'},
  ])('preserves the Gregorian calendar when pasting $pasted', async ({pasted, expected}) => {
    const {control, input, replace} = await setup(0, 19, '1405/09/22 08:10:15', {mode: 'daytime'});

    await replace(pasted, 'insertFromPaste');

    expect(input.value).toBe(expected);
    expect(control.value).toBe(expected);
  });

  it('recognizes a mixed-padding Gregorian paste before the matching Jalali display format', async () => {
    const {control, input, replace} = await setup(0, 19, '1405/09/22 08:10:15', {
      mode: 'daytime',
      displayFormat: 'jYYYY/jM/jDD HH:mm:ss',
    });

    await replace('2026/2/08 08:19:05', 'insertFromPaste');

    expect(input.value).toBe('1404/11/19 08:19:05');
    expect(control.value).toBe('1404/11/19 08:19:05');
  });

  it.each([
    {mode: 'daytime' as const, displayFormat: 'jYYYY/jMM/jDD[T]HH:mm:ss', modelPrefix: '1405/09/22 ', prefix: '1405/09/22T', suffix: ''},
    {mode: 'time' as const, displayFormat: 'HH:mm:ss [UTC]', modelPrefix: '', prefix: '', suffix: ' UTC'},
  ])('finishes the edited clock segment on blur with $displayFormat', async ({mode, displayFormat, modelPrefix, prefix, suffix}) => {
    const start = prefix.length;
    const initial = modelPrefix + '18:19:25';
    const {control, input, settle, replace} = await setup(start, start + 1, initial, {mode, displayFormat});
    const changes: (string | null)[] = [];
    control.valueChanges.subscribe(value => changes.push(value));

    await replace('', 'deleteContentBackward');
    expect(input.value).toBe(prefix + '8:19:25' + suffix);
    expect(input.selectionStart).toBe(start);
    expect(changes).toEqual([]);

    input.blur();
    await settle();

    expect(input.value).toBe(prefix + '08:19:25' + suffix);
    expect(control.value).toBe(modelPrefix + '08:19:25');
    expect(changes).toEqual([modelPrefix + '08:19:25']);
  });

  describe.each([
    {mode: 'time' as const, prefix: ''},
    {mode: 'daytime' as const, prefix: '1405/09/22 '},
  ])('editing hours, minutes and seconds in $mode mode', ({mode, prefix}) => {
    const initial = prefix + '08:09:05';

    it.each([
      {offset: 0, digit: '0', expected: '08:19:25'},
      {offset: 3, digit: '4', expected: '18:49:25'},
      {offset: 7, digit: '8', expected: '18:19:28'},
    ])('keeps the draft and caret when deleting and retyping the digit at $offset', async ({offset, digit, expected}) => {
      const original = prefix + '18:19:25';
      const start = prefix.length + offset;
      const {control, input, replace} = await setup(start, start + 1, original, {mode});
      const changes: (string | null)[] = [];
      control.valueChanges.subscribe(value => changes.push(value));

      await replace('', 'deleteContentBackward');
      expect(input.value).toBe(original.slice(0, start) + original.slice(start + 1));
      expect(input.selectionStart).toBe(start);
      expect(control.value).toBe(original);
      expect(changes).toEqual([]);

      await replace(digit, 'insertText');
      expect(input.value).toBe(prefix + expected);
      expect(input.selectionStart).toBe(start + 1);
      expect(changes).toEqual([prefix + expected]);
    });

    it('restores the leading zero on blur if the user leaves its clock segment unfinished', async () => {
      const start = prefix.length + 3;
      const {control, input, settle, replace} = await setup(start, start + 1, initial, {mode});

      await replace('', 'deleteContentBackward');
      expect(input.value).toBe(prefix + '08:9:05');
      expect(control.value).toBe(initial);

      input.blur();
      await settle();
      expect(input.value).toBe(initial);
      expect(control.value).toBe(initial);
    });

    it.each([
      {part: 'hours', offset: 0, digits: '17', shortPaste: '7'},
      {part: 'minutes', offset: 3, digits: '42', shortPaste: '2'},
      {part: 'seconds', offset: 6, digits: '58', shortPaste: '8'},
    ])('types and pastes the $part independently', async ({offset, digits, shortPaste}) => {
      const start = prefix.length + offset;
      const end = start + 2;
      const {control, input, replace} = await setup(start, end, initial, {mode});
      const withPart = (part: string) => initial.slice(0, start) + part + initial.slice(end);

      await replace(digits[0], 'insertText');
      expect(input.value).toBe(withPart(digits[0]));
      expect(input.selectionStart).toBe(start + 1);
      expect(control.value).toBe(initial);

      await replace(digits[1], 'insertText');
      expect(input.value).toBe(withPart(digits));
      expect(input.selectionStart).toBe(end);
      expect(control.value).toBe(withPart(digits));

      input.setSelectionRange(start, end);
      await replace(shortPaste, 'insertFromPaste');
      expect(input.value).toBe(withPart('0' + shortPaste));
      expect(control.value).toBe(withPart('0' + shortPaste));

      input.setSelectionRange(start, end);
      await replace(digits, 'insertFromPaste');
      expect(input.value).toBe(withPart(digits));
      expect(control.value).toBe(withPart(digits));
    });

    it('pastes a complete time and rejects values outside the clock ranges', async () => {
      const {control, input, replace} = await setup(prefix.length, initial.length, initial, {mode});

      await replace('23:59:58', 'insertFromPaste');
      expect(input.value).toBe(prefix + '23:59:58');
      expect(control.value).toBe(prefix + '23:59:58');

      for (const invalid of ['24:01:02', '23:60:02', '23:59:60']) {
        input.setSelectionRange(prefix.length, input.value.length);
        await replace(invalid, 'insertFromPaste');
        expect(control.value).toBe(prefix + '23:59:58');
      }
    });
  });

  it('accepts and formats a single-digit month when the user leaves the field', async () => {
    const {control, input, selected, settle, replace} = await setup(5, 7);

    await replace('1', 'insertText');
    input.blur();
    await settle();

    expect(input.value).toBe('1405/01/22');
    expect(selected()).toBe('1405/01/22');
    expect(control.value).toBe('1405/01/22');
  });
});
