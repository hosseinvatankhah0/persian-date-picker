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
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import moment, { Moment } from 'jalali-moment';
import { DatePickerModalComponent } from '../date-picker/date-picker.component';
import { CommonModule } from '@angular/common';
import { TSelectionMode } from '../common/types/selection-mode.type';

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
    FormsModule
  ],
  providers: [PERSIAN_DATE_PICKER_VALUE_ACCESSOR],
  /* Every other component in this library uses ViewEncapsulation.None — this
   * was the one exception, and it matters: this file's own stylesheet reaches
   * into elements rendered by the child <dp-date-picker-modal>'s template
   * (.dp-picker-input, .dp-popup, .dp-picker-dialog). With emulated
   * encapsulation (the default this had been using), Angular stamps an
   * _ngcontent attribute onto every simple selector in a compiled rule,
   * including ones for elements the child renders — but those elements never
   * carry this component's _ngcontent attribute, only their own component's
   * (or none, since the child is also None). The compiled selectors could
   * never match anything. None makes every rule here plain, unscoped CSS,
   * consistent with how the rest of the library already styles itself.
   */
  encapsulation: ViewEncapsulation.None
})
export class PersianDatePickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);

  dateObject: Moment | null = null;
  /** Populated instead of `dateObject` while `selectionMode === 'range'`. */
  rangeObject: Moment[] = [];
  config: any = {};
  inlineConfig: any = {};
  standaloneNgModelOptions = { standalone: true };
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
  /** Shown by default as a visible affordance that the input opens a picker;
   * set to false to rely purely on focusing/clicking the input itself. */
  @Input() showCalendarIcon = true;
  /** 'range' turns the day/month calendar into a from-to picker. */
  @Input() selectionMode: TSelectionMode = 'single';
  /** Overrides the automatic confirm/close bar decision. */
  @Input() showActionButtons?: boolean;
  @Input() rangeSeparator = ' - ';

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

  get isRange(): boolean {
    return this.selectionMode === 'range';
  }

  get hasValue(): boolean {
    return this.isRange ? this.rangeObject.length > 0 : !!this.dateObject;
  }

  get pickerValue(): Moment | Moment[] | null {
    return this.isRange ? this.rangeObject : this.dateObject;
  }

  emitChanges(): void {
    const value = this.formatValue();
    this.onChange(value);
    this.inputModelChange.emit(typeof value === 'string' ? value : value.join(this.rangeSeparator));
  }

  private formatValue(): string | string[] {
    if (this.isRange) {
      return this.rangeObject
        .filter(Boolean)
        .map(m => m.locale(this.locale).format(this.config.format));
    }

    if (!this.dateObject || typeof this.dateObject === 'string') {
      return '';
    }

    return this.dateObject.locale(this.locale).format(this.config.format);
  }

  writeValue(obj: any): void {
    if (!this.config?.format) {
      this.configure();
    }

    if (this.isRange) {
      const raw: any[] = Array.isArray(obj)
        ? obj
        : (typeof obj === 'string' && obj ? obj.split(this.rangeSeparator) : []);
      this.rangeObject = raw
        .map(v => this.normalizeToMoment(v))
        .filter((v): v is Moment => !!v);
      this.dateObject = this.rangeObject[0] || null;
    } else {
      this.dateObject = this.normalizeToMoment(obj);
    }

    this.cdr.markForCheck();
  }

  /**
   * The moment's own calendar system (Jalali vs. Gregorian) is decided here,
   * once, from `this.locale` — never left to whichever locale happened to be
   * active at parse time. Without this, a value written in through
   * writeValue()/ngModel in the "other" calendar (e.g. a Gregorian date from
   * a server, while this picker runs in `locale="fa"`) would carry a
   * mismatched locale, and only stayed correct downstream because both the
   * emit path and the child component happen to re-apply .locale() of their
   * own — accidental correctness, not guaranteed. Centralizing it here
   * removes that footgun for any other current or future reader of
   * `dateObject`.
   */
  private normalizeToMoment(obj: any): Moment | null {
    if (!obj) {
      return null;
    }

    const parsed = this.parseToMoment(obj);
    return parsed && parsed.isValid() ? parsed.locale(this.locale) : null;
  }

  private parseToMoment(obj: any): Moment | null {
    if (moment.isMoment(obj)) {
      return obj.clone();
    }

    if (obj instanceof Date) {
      return moment(obj);
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
      const m = moment.from(value, this.locale, fmt);
      if (m.isValid()) {
        return m;
      }
    }

    const g = moment(value);
    return g.year() > 1500 ? g : null;
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
        /* Uppercase tokens, same as every other mode: jalali-moment reads
           these against whichever calendar `.locale()` is set to, so one
           format string covers both locales instead of special-casing 'fa'
           with an explicit j-prefix that meant the exact same thing here. */
        format = 'YYYY/MM';
        break;
      case 'time':
        format = 'HH:mm:ss';
        break;
    }

    this.config = {
      locale: this.locale,
      unSelectOnClick: false,
      selectionMode: this.selectionMode,
      rangeSeparator: this.rangeSeparator,
      format,
    };

    if (this.showActionButtons !== undefined) {
      this.config.showActionButtons = this.showActionButtons;
    }
    /* "inline" means a small popup anchored under the input — same input,
       same as "modal" otherwise, just without the full-viewport backdrop.
       It is not a permanently-visible, input-less calendar widget: the
       input stays, and the calendar toggles open/closed exactly like the
       modal variant does. */
    this.inlineConfig = {
      ...this.config,
      dropdown: true,
      openOnClick: true,
      openOnFocus: true,
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
    this.rangeObject = [];
    this.onChange(this.isRange ? [] : '');
    this.inputModelChange.emit('');
    this.onTouched();
    this.cdr.markForCheck();
  }

  onModelChange(e: any): void {
    if (this.isRange) {
      const values: any[] = Array.isArray(e) ? e : (e ? [e] : []);
      this.rangeObject = values
        .map(v => (moment.isMoment(v) ? v : this.normalizeToMoment(v)))
        .filter((v): v is Moment => !!v && v.isValid());
      this.dateObject = this.rangeObject[0] || null;
      this.emitChanges();
      return;
    }

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
