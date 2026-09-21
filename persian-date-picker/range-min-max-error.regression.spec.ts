import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {PersianDatePickerComponent} from './index.component';
import {DatePickerModalComponent} from '../date-picker/date-picker.component';

/**
 * Regression for a range-mode-only bug: PersianDatePickerComponent.onModelChange
 * rebuilt `rangeObject` into a brand-new array on every call, even when the new
 * content was identical to the old (e.g. an empty-string emit from the child
 * still produced a fresh `[]`). Since that array is bound to the child through
 * `[ngModel]="pickerValue"`, a new reference — regardless of content — makes
 * Angular re-invoke the child's writeValue() on the next change-detection pass.
 *
 * handleInvalidDate() (date-picker.component.ts) sets showMinDateIsNotValid/
 * showMaxDateIsNotValid to true and then clears the value via onChangeCallback
 * ('', false) — which, in range mode, round-tripped straight back into this
 * spurious writeValue() call, and writeValue() resets those same flags to false
 * as any genuinely new written-in value should. The result: the "out of range"
 * message flashed and disappeared instead of staying up, only in range mode.
 */
describe('Range mode does not swallow its own min/max error on the write-back', () => {
  let fixture: ComponentFixture<PersianDatePickerComponent>;
  let picker: PersianDatePickerComponent;
  let modal: DatePickerModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PersianDatePickerComponent]
    });

    fixture = TestBed.createComponent(PersianDatePickerComponent);
    picker = fixture.componentInstance;
    picker.selectionMode = 'range';
    picker.mode = 'day';
    picker.minDate = '1405/01/01';
    picker.maxDate = '1405/12/29';
    fixture.detectChanges();

    modal = fixture.debugElement.query(By.directive(DatePickerModalComponent)).componentInstance;
  });

  it('keeps the min-date error visible after the round-trip through the parent', () => {
    modal.onViewDateChange('1300/01/01');
    fixture.detectChanges();
    // Flushes the [ngModel]="pickerValue" binding's own re-check, which is
    // where a spurious new array reference would trigger the extra writeValue().
    fixture.detectChanges();

    expect(modal.showMinDateIsNotValid()).toBe(true);
  });

  it('keeps the max-date error visible after the round-trip through the parent', () => {
    modal.onViewDateChange('1420/01/01');
    fixture.detectChanges();
    fixture.detectChanges();

    expect(modal.showMaxDateIsNotValid()).toBe(true);
  });
});
