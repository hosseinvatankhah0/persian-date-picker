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
  input,
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
import { UtilsService } from '../common/services/utils/utils.service';

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

  /** Digits and date punctuation only. Anything else never reaches the
   * parser, which is lenient enough to invent a date out of arbitrary text
   * — harmless while it only affected the display, but not now that the
   * parsed value is written back to the host's model. */
  private static readonly DATE_SHAPE = /^[\d/\-.:\s+TZz]+$/;

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
  /**
   * Format used to parse/serialize the value bound through ngModel/form
   * control (not the text shown in the input box - see `displayFormat`).
   * Left unset, the model value defaults to Jalali (via an explicit
   * `j`-prefixed default format) regardless of `locale`, and any Gregorian
   * string handed in (ISO, `YYYY/MM/DD`, `YYYY-MM-DD`, a .NET-style
   * datetime) is auto-detected and converted. Setting this explicitly opts
   * out of that auto-detection entirely: the incoming value is parsed
   * strictly against this format, and the emitted value keeps this format's
   * own calendar system (Jalali if it contains `j`-prefixed tokens,
   * Gregorian otherwise).
   */
  @Input() format?: string;
  /** Format shown/typed in the input's own text box. Left unset, it is
   * derived from `mode` and interpreted against `locale` (Jalali digits for
   * `fa`, Gregorian for `en`) - unrelated to the model's own `format`. */
  @Input('display-format') displayFormat?: string;
  @Input() required = false;
  @Input() placeholder = 'تاریخ';
  @Output() inputModelChange = new EventEmitter<string>();
  @Input() pickerType: 'modal' | 'inline' = 'modal';
  @Input() fontSize = 23;
  /** The default pointer trigger. If hidden, enable a field trigger explicitly. */
  @Input() showCalendarIcon = true;
  /** Field triggers are off by default; the calendar icon remains available. */
  readonly openOnClick = input(false);
  readonly openOnFocus = input(false);
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
    const fmt = this.effectiveModelFormat();
    const calLocale = this.isJalaliFormat(fmt) ? 'fa' : 'en';

    if (this.isRange) {
      return this.rangeObject
        .filter(Boolean)
        .map(m => m.clone().locale(calLocale).format(fmt));
    }

    if (!this.dateObject || typeof this.dateObject === 'string') {
      return '';
    }

    return this.dateObject.clone().locale(calLocale).format(fmt);
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

    this.normalizeModelValue(obj);
    this.cdr.markForCheck();
  }

  /**
   * Writing a foreign-calendar value in is only half of what a host asking
   * for auto-detection wants: the server handed us a Gregorian string, and
   * the model itself - not just the text box - is expected to end up holding
   * the picker's own format. So the normalized value is written back through
   * the change callback.
   *
   * Deferred to a microtask because writeValue() normally runs inside a
   * change-detection pass, where emitting synchronously would trip
   * ExpressionChangedAfterItHasBeenCheckedError. It cannot loop: the
   * re-entrant writeValue this triggers serializes to the identical string,
   * which returns early below.
   */
  private normalizeModelValue(raw: any): void {
    if (!this.hasValue) {
      return;
    }

    const normalized = this.formatValue();
    if (this.isSameModelValue(raw, normalized)) {
      return;
    }

    queueMicrotask(() => {
      this.onChange(normalized);
      this.cdr.markForCheck();
    });
  }

  private sameMomentArray(a: Moment[], b: Moment[]): boolean {
    return a.length === b.length && a.every((m, i) => m.isSame(b[i]));
  }

  private isSameModelValue(raw: any, normalized: string | string[]): boolean {
    if (Array.isArray(normalized)) {
      const rawParts: any[] = Array.isArray(raw)
        ? raw
        : (typeof raw === 'string' && raw ? raw.split(this.rangeSeparator) : []);
      return rawParts.length === normalized.length
        && rawParts.every((part, i) => part === normalized[i]);
    }

    return raw === normalized;
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
    if (!value || !PersianDatePickerComponent.DATE_SHAPE.test(value)) {
      return null;
    }

    /* An explicit `format` input opts out of auto-detection entirely: the
       consumer has told us exactly what shape to expect, so parse strictly
       against it instead of guessing the calendar system. ISO is allowed
       alongside a Gregorian format because that is what a server hands back
       for the same field (a .NET DateTime serializes to it) - the calendar
       is still the declared one, only the shape is looser. */
    if (this.format) {
      if (this.isJalaliFormat(this.format)) {
        return this.parseJalali(value, this.format);
      }
      try {
        const declared = moment.from(value, 'en', this.format);
        if (declared.isValid() && declared.clone().locale('en').format(this.format) === value) {
          return declared;
        }
      } catch {
        // Invalid years can throw inside jalali-moment.
      }
      /* The declared format didn't match, but a server still hands this field
         back in whatever shape .NET/ISO serialization produces regardless of
         the display format the consumer declared — a bare date, a datetime,
         or one with a numeric offset. parseGregorianDate already gates this
         narrowly enough (a real leading year, an exact round-trip match) to
         try unconditionally rather than pre-filtering on a "has a T" regex
         that excluded the plain date-only shape. */
      return UtilsService.parseGregorianDate(value);
    }

    /* Shared with UtilsService.convertToMoment, which applies the same rule to
       min/max and displayDate: the two public entry points into this package
       must not read the same string as two different dates. */
    const gregorian = UtilsService.parseGregorianDate(value);
    if (gregorian) {
      return gregorian;
    }

    const jalaliDateFormats = [
      'jYYYY/jMM/jDD',
      'jYYYY-jMM-jDD',
      'jYYYY/jM/jD',
      'jYYYY-jM-jD',
    ];

    const jalaliFormats = [
      this.defaultModelFormatByMode(),
      ...jalaliDateFormats,
      // A caller bound to a date-only mode (day/month) can still receive a
      // value carrying a time-of-day - e.g. a host's own "now, N days from
      // here" helper that always formats with 'HH:mm:ss' regardless of what
      // the picker itself needs. The trailing time is accepted and simply
      // ignored by this mode's own format() calls rather than the whole
      // value being silently dropped for not round-tripping exactly.
      ...jalaliDateFormats.map(fmt => `${fmt} HH:mm:ss`),
      // Compact, no separator - what an 8-digit typed-and-erased-separators
      // value or a legacy integer-coded date column looks like.
      'jYYYYMMDD',
    ];

    for (const fmt of jalaliFormats) {
      const parsed = this.parseJalali(value, fmt);
      if (parsed) {
        return parsed;
      }
    }

    // Same throw risk as parseJalali, reached from a different angle:
    // jalali-moment's moment() constructor routes strict-ISO parsing through
    // its own Jalali conversion internals whenever the library's *global*
    // locale is currently 'fa' (set by any moment().locale('fa') call
    // anywhere - this library's own or a host app's), regardless of the
    // input's shape. An implausible-but-numeric string reaching this last
    // fallback can trip the same "Invalid Jalali year" throw.
    return null;
  }

  /**
   * `moment.from` is lenient to the point of uselessness as a validator -
   * it turns "not a date" into a valid moment in year 621 - so a parse only
   * counts if formatting it back produces exactly what came in.
   *
   * Also genuinely throws, rather than returning an invalid moment, for a
   * numeric year far outside the Jalali calendar's supported range (its
   * internal 33-year cycle table has a hard bound) - an 8-digit compact
   * value with an implausible leading year is exactly the shape that can
   * trigger this, so every caller here needs the try/catch, not just the
   * new format.
   */
  private parseJalali(value: string, fmt: string): Moment | null {
    try {
      const parsed = moment.from(value, 'fa', fmt);
      return parsed.isValid() && parsed.locale('fa').format(fmt) === value ? parsed : null;
    } catch {
      return null;
    }
  }

  /** The model's (ngModel/form) own format - independent of `locale`,
   * which only governs the calendar UI and text-box display. */
  private effectiveModelFormat(): string {
    return this.format || this.defaultModelFormatByMode();
  }

  private isJalaliFormat(fmt: string): boolean {
    return /j[YMD]/.test(fmt);
  }

  private defaultModelFormatByMode(): string {
    switch (this.mode) {
      case 'daytime':
        return 'jYYYY/jMM/jDD HH:mm:ss';
      case 'month':
        return 'jYYYY/jMM';
      case 'time':
        return 'HH:mm:ss';
      default:
        return 'jYYYY/jMM/jDD';
    }
  }

  private defaultDisplayFormatByMode(): string {
    switch (this.mode) {
      case 'daytime':
        return 'YYYY/MM/DD HH:mm:ss';
      case 'month':
        return 'YYYY/MM';
      case 'time':
        return 'HH:mm:ss';
      default:
        return 'YYYY/MM/DD';
    }
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
    /* This is the text box's own display format, interpreted against
       `locale` (Jalali digits for 'fa', Gregorian for 'en') - it is
       unrelated to `format`, which governs the ngModel/form value's own
       calendar system independently of `locale`. */
    const format = this.displayFormat || this.defaultDisplayFormatByMode();

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
    this.config.openOnClick = this.openOnClick();
    this.config.openOnFocus = this.openOnFocus();
    /* "inline" means a small popup anchored under the input — same input,
       same as "modal" otherwise, just without the full-viewport backdrop.
       It is not a permanently-visible, input-less calendar widget: the
       input stays, and the calendar toggles open/closed exactly like the
       modal variant does. It inherits openOnClick/openOnFocus from
       `config` above (including the same false default) rather than forcing
       them - the calendar icon is still always there as a way in even if a
       host turns both off. */
    this.inlineConfig = {
      ...this.config,
      dropdown: true,
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
      const next = values
        .map(v => (moment.isMoment(v) ? v : this.normalizeToMoment(v)))
        .filter((v): v is Moment => !!v && v.isValid());
      // Only reassigned when the content actually differs, not on every call
      // (an empty-string emit from the child, e.g. handleInvalidDate()
      // clearing an out-of-range typed value, would otherwise still produce
      // a brand-new `[]` reference here every time). `pickerValue` is bound
      // through `[ngModel]="pickerValue"` on the child, which diffs by
      // identity — a new reference on every call re-invokes the child's
      // writeValue() right after it just showed a min/max error, and
      // writeValue() resets that error's visibility as any genuinely new
      // written-in value should. A stable reference here keeps that reset
      // scoped to writes that actually change something.
      if (!this.sameMomentArray(this.rangeObject, next)) {
        this.rangeObject = next;
        this.dateObject = this.rangeObject[0] || null;
      }
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
          const str = split.toString();
          const month = +str.substring(4, 6) - 1;
          const day = +str.substring(6, 8);
          // jYear() throws outright for a year outside the calendar's
          // supported range (its internal cycle table has a hard bound),
          // rather than producing an invalid moment - a plausible outcome
          // for 8 stray digits, so this cannot be allowed to propagate.
          try {
            const m = moment();
            m.jYear(+str.substring(0, 4));
            m.jMonth(month);
            m.jDate(day);
            this.dateObject = (month < 0 || month > 11 || day < 1 || day > 31) ? null : m;
          } catch {
            this.dateObject = null;
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
