import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DatePickerModalComponent} from '../date-picker/date-picker.component';
import {PersianDatePickerComponent} from './index.component';

describe.each(['modal', 'inline'] as const)('Clear button in the %s picker', pickerType => {
  it.each(['1404/12/29', '1405/10/09'])('keeps the button in the input row when %s fails validation', async invalidDate => {
    const fixture = TestBed.createComponent(PersianDatePickerComponent);
    const picker = fixture.componentInstance;
    picker.pickerType = pickerType;
    picker.minDate = '1405/01/01';
    picker.maxDate = '1405/10/08';
    picker.showCalendarIcon = true;
    fixture.detectChanges();
    picker.writeValue('1405/08/17');
    fixture.detectChanges();
    await fixture.whenStable();

    const child = fixture.debugElement.query(By.directive(DatePickerModalComponent)).componentInstance as DatePickerModalComponent;
    child.onViewDateChange(invalidDate);
    fixture.detectChanges();
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    const row = host.querySelector('.dp-input-row');
    const error = host.querySelector('.date-error');
    const clear = host.querySelector<HTMLButtonElement>('.remove-icon');
    expect(error).toBe(row?.nextElementSibling);
    expect(error).not.toBeNull();
    expect(clear?.parentElement).toBe(row);

    clear?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.querySelector('.remove-icon')).toBeNull();
    expect(host.querySelector('.date-error')).toBeNull();
  });
});
