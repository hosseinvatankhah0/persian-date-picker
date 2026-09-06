import { AbstractControl, ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import moment, { Moment } from 'jalali-moment';
import { DatePickerModalComponent } from '../date-picker/date-picker.component';
import { DayCalendarComponent } from '../day-calendar/day-calendar.component';
import { MonthCalendarComponent } from '../month-calendar/month-calendar.component';
import { TimeSelectComponent } from '../time-select/time-select.component';
import { DayTimeCalendarComponent } from '../day-time-calendar/day-time-calendar.component';
import { CommonModule } from '@angular/common';

export const PERSIAN_DATE_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PersianDatePickerComponent),
  multi: true
};

@Component({
  selector: 'app-persian-date-picker',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.less'],
  standalone: true,
  imports: [
    CommonModule,
    DatePickerModalComponent,
    DayCalendarComponent,
    MonthCalendarComponent,
    TimeSelectComponent,
    DayTimeCalendarComponent,
    FormsModule
  ],
  providers: [PERSIAN_DATE_PICKER_VALUE_ACCESSOR]
})
export class PersianDatePickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);

  dateObject: Moment | null = null;
  config: any = {};
  isKeRemoving = false;

  @Input() minDate: Moment | string = moment().locale('en').add(-100, 'years');
  @Input() maxDate: Moment | string = moment().locale('en').add(20, 'years');

  normalizedMinDate?: Moment;
  normalizedMaxDate?: Moment;

  @Input() minTime: any;
  @Input() maxTime: any;
  @Input('form-control') formControl!: AbstractControl;
  @Input() mode: 'day' | 'month' | 'time' | 'daytime' = 'day';
  @Input() locale: 'fa' | 'en' = 'fa';
  @Input() required = false;
  @Input() placeholder = 'تاریخ';
  @Output() inputModelChange = new EventEmitter<string>();
  @Input() pickerType: 'modal' | 'inline' = 'modal';
  @Input() fontSize = 23;

  constructor(private elementRef: ElementRef) {
  }

  _disabled = false;

  @HostBinding('class.disabled')
  @Input('disabled')
  get disabled(): boolean {
    return this._disabled || this.formControl?.disabled;
  }

  set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value;
      if (this.formControl) {
        if (value) {
          this.formControl.disable();
        } else {
          this.formControl.enable();
        }
      }
      this.cdr.markForCheck();
    }
  }

  onChange = (_: any) => {
  };

  onTouched = () => {
  };

  emitChanges(): void {
    if (this.dateObject) {
      if (typeof this.dateObject === 'string') {
        this.onChange('');
      } else {
        const value = this.dateObject.locale(this.locale).format(this.config.format);
        this.onChange(value);
      }
    } else {
      this.onChange('');
    }
    this.inputModelChange.emit(this.dateObject ? this.dateObject.locale(this.locale).format(this.config.format) : '');
  }

  writeValue(obj: any): void {
    if (!this.config?.format) {
      this.configure();
    }
    this.dateObject = this.normalizeToMoment(obj);
    this.cdr.markForCheck();
  }

  private normalizeToMoment(obj: any): Moment | null {
    if (!obj) {
      return null;
    }

    if (moment.isMoment(obj)) {
      return obj.isValid() ? obj : null;
    }

    if (obj instanceof Date) {
      const m = moment(obj);
      return m.isValid() ? m : null;
    }

    if (typeof obj !== 'string') {
      return null;
    }

    const value = obj.trim();
    if (!value) {
      return null;
    }

    const isoMatch = /^(\d{4})[-/]\d{2}[-/]\d{2}/.exec(value);
    if (isoMatch && Number(isoMatch[1]) > 1500) {
      const gIso = moment(value, [moment.ISO_8601, 'YYYY/MM/DD', 'YYYY-MM-DD']);
      if (gIso.isValid()) {
        return gIso;
      }
    }

    const jalaliFormats = [
      this.config?.format,
      'jYYYY/jMM/jDD',
      'jYYYY-jMM-jDD',
    ].filter(Boolean);

    for (const fmt of jalaliFormats) {
      const m = moment.from(value, 'fa', fmt);
      if (m.isValid()) {
        return m;
      }
    }

    const g = moment(value);
    return g.isValid() && g.year() > 1500 ? g : null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    this.elementRef.nativeElement.addEventListener('keydown', (e: KeyboardEvent) => {
      this.isKeRemoving = e.key === 'Backspace' || e.key === 'Delete';
    });

    this.configure();
    this.updateNormalizedDates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.configure();
    if (changes['minDate'] || changes['maxDate']) {
      this.updateNormalizedDates();
    }
  }

  updateNormalizedDates(): void {
    this.normalizedMinDate = this.normalizeToMoment(this.minDate) || undefined;
    this.normalizedMaxDate = this.normalizeToMoment(this.maxDate) || undefined;
  }

  configure(): void {
    let format = 'YYYY/MM/DD';
    switch (this.mode) {
      case 'day':
        format = 'YYYY/MM/DD';
        break;
      case 'daytime':
        format = 'YYYY/MM/DD HH:mm:ss';
        break;
      case 'month':
        format = 'jYYYY/jMM';
        break;
      case 'time':
        format = 'HH:mm:ss';
        break;
    }

    this.config = {
      showMultipleYearsNavigation: true,
      format,
    };
    this.cdr.markForCheck();
  }

  clearDate(event: MouseEvent): void {
    if (this.disabled) {
      event.stopPropagation();
      return;
    }

    event.stopPropagation();
    this.dateObject = null;
    this.onChange('');
    this.onTouched();
    this.cdr.markForCheck();
  }

  onModelChange(e: any): void {
    if (typeof e === 'string') {
      if (!this.isKeRemoving) {
        const split = e.replace(/\D/g, '').replace(/\//g, '-');
        if (split.length > 8) {
          this.dateObject = null;
        }
        if (split.length === 8) {
          const m = moment();
          const str = split.toString();
          const month = +str.substring(4, 6) - 1;
          const day = +str.substring(6, 8);
          m.jYear(+str.substring(0, 4));
          m.jMonth(month);
          m.jDate(day);
          if (month < 0 || month > 11 || day < 1 || day > 31) {
            this.dateObject = null;
          } else {
            this.dateObject = m;
          }
        }
      }
    } else if (e?._isAMomentObject) {
      this.dateObject = e;
    } else if (e && e.date && e.date._isAMomentObject) {
      this.dateObject = e.date;
    } else if (typeof e !== 'undefined') {
      this.dateObject = null;
    }
    this.emitChanges();
  }
}
