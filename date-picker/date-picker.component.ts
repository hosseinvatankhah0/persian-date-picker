import momentNs, {Moment, unitOfTime} from 'jalali-moment';
import {DomHelper} from '../common/services/dom-appender/dom-appender.service';
import {UtilsService} from '../common/services/utils/utils.service';
import {CalendarMode} from '../common/types/calendar-mode';
import {ECalendarMode} from '../common/types/calendar-mode-enum';
import {CalendarValue} from '../common/types/calendar-value';
import {ECalendarValue} from '../common/types/calendar-value-enum';
import {SingleCalendarValue} from '../common/types/single-calendar-value';
import {IDate} from '../common/models/date.model';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {DayCalendarService} from '../day-calendar/day-calendar.service';
import {DayTimeCalendarComponent} from '../day-time-calendar/day-time-calendar.component';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';
import {TimeSelectComponent} from '../time-select/time-select.component';
import {TimeSelectService} from '../time-select/time-select.service';
import {IDatePickerModalConfig} from './date-picker-config.model';
import {IDpDayPickerApi} from './date-picker.api';
import {DatePickerModalService} from './date-picker.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  input,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {DateValidator} from '../common/types/validator.type';
import {MonthCalendarComponent} from '../month-calendar/month-calendar.component';
import {INavEvent} from '../common/models/navigation-event.model';
import {CommonModule} from '@angular/common';
import {TSelectionMode} from '../common/types/selection-mode.type';

const moment = momentNs;

@Component({
  standalone: true,
  selector: 'dp-date-picker-modal',
  templateUrl: 'date-picker.component.html',
  styleUrls: ['date-picker.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DayCalendarComponent,
    MonthCalendarComponent,
    TimeSelectComponent,
    DayTimeCalendarComponent,
  ],
  providers: [
    DomHelper,
    UtilsService,
    DatePickerModalService,
    DayTimeCalendarService,
    DayCalendarService,
    TimeSelectService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerModalComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatePickerModalComponent),
      multi: true
    }
  ]
})
export class DatePickerModalComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
  private static nextInputId = 0;
  readonly inputId = `dp-${DatePickerModalComponent.nextInputId++}`;
  // Inputs
  config = input<IDatePickerModalConfig>();
  mode = input<CalendarMode>('day');
  placeholder = input<string>('');
  fontSize = input<number>(23);
  /** The default pointer trigger; field click/focus triggers are optional. */
  showCalendarIcon = input<boolean>(true);
  disabled = input<boolean>(false);
  displayDate = input<any>();
  theme = input<string>('');
  minDate = input<any>();
  maxDate = input<any>();
  minTime = input<SingleCalendarValue>();
  maxTime = input<SingleCalendarValue>();
  required = input<boolean>(false);
  selectionMode = input<TSelectionMode>();
  /** Undefined (the default) leaves DatePickerModalService's own default
   * (false) in effect — set explicitly to override it, independent of
   * `config`. The calendar icon (see showCalendarIcon) always opens the
   * picker regardless of either flag; these only gate the input itself. */
  openOnClick = input<boolean>();
  openOnFocus = input<boolean>();

  @HostBinding('class') get themeClass() {
    return this.theme() || '';
  }

  // Outputs
  onOpen = output<void>({alias: 'open'});
  onClose = output<void>({alias: 'close'});
  onChange = output<CalendarValue>();
  onGoToCurrent = output<void>();
  onLeftNav = output<INavEvent>();
  onRightNav = output<INavEvent>();

  // ViewChilds
  calendarContainer = viewChild<ElementRef>('container');
  dayCalendarRef = viewChild<DayCalendarComponent>('dayCalendar');
  monthCalendarRef = viewChild<MonthCalendarComponent>('monthCalendar');
  dayTimeCalendarRef = viewChild<DayTimeCalendarComponent>('daytimeCalendar');
  timeSelectRef = viewChild<TimeSelectComponent>('timeSelect');
  inputElementLabel = viewChild<ElementRef>('inputElementLabel');
  dialogElement = viewChild<ElementRef>('dialog');

  // Signals for state
  isInitialized = signal(false);
  isModalOpen = signal(false);
  inputElementValue = signal<string>('');
  selected = signal<Moment[]>([]);
  currentDateView = signal<Moment>(moment());

  showMinDateIsNotValid = signal(false);
  showMaxDateIsNotValid = signal(false);

  /** Last value handed to the form; restored when the user closes without confirming. */
  private committedSelection: Moment[] = [];
  /** Element focused before the dialog opened, so closing can hand focus back. */
  private lastFocusedElement: HTMLElement | null = null;
  private restoringFocus = false;
  /* `:not([tabindex="-1"])` on every branch, not just the last: the day grid
     uses a roving tabindex, so most of its buttons are deliberately out of
     the tab order. Counting them here would put the trap's "last" element on
     a button Tab never reaches, and focus would escape the dialog. */
  private static readonly FOCUSABLE_SELECTOR =
    'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]):not([disabled])';

  // Computeds
  componentConfig = computed(() => this.dayPickerService.getConfig({
    ...this.config(),
    min: this.minDate() || this.config()?.min,
    max: this.maxDate() || this.config()?.max,
    selectionMode: this.selectionMode() || this.config()?.selectionMode,
    // ?? not || : an explicit false input must win over a truthy config
    // value, and a truthy 0/'' would never occur here but false must not be
    // read as "unset".
    openOnClick: this.openOnClick() ?? this.config()?.openOnClick,
    openOnFocus: this.openOnFocus() ?? this.config()?.openOnFocus
  }, this.mode()));
  isRangeMode = computed(() => this.componentConfig().selectionMode === 'range');
  /** When true, selection stays pending until the user hits confirm. */
  showActionButtons = computed(() => !!this.componentConfig().showActionButtons);
  dialogLabel = computed(() => {
    const isFa = this.componentConfig().locale === 'fa';
    const labels: Record<CalendarMode, string> = isFa
      ? {day: 'انتخاب تاریخ', month: 'انتخاب ماه', time: 'انتخاب ساعت', daytime: 'انتخاب تاریخ و ساعت'}
      : {day: 'Choose date', month: 'Choose month', time: 'Choose time', daytime: 'Choose date and time'};
    return labels[this.mode()];
  });
  rangeGuidance = computed(() => {
    const isFa = this.componentConfig().locale === 'fa';
    const count = this.selected().length;
    if (!count) return isFa ? 'ابتدا تاریخ شروع را انتخاب کنید' : 'Choose a start date';
    if (count === 1) return isFa ? 'حالا تاریخ پایان را انتخاب کنید' : 'Now choose an end date';
    return isFa ? 'بازه آماده است؛ برای ثبت، تایید کنید' : 'Your range is ready to confirm';
  });
  dayCalendarConfig = computed(() => this.dayPickerService.getDayConfigService(this.componentConfig()));
  dayTimeCalendarConfig = computed(() => this.dayPickerService.getDayTimeConfigService(this.componentConfig()));
  timeSelectConfig = computed(() => this.dayPickerService.getTimeConfigService(this.componentConfig()));

  inputValue: CalendarValue = '';
  inputValueType: ECalendarValue = ECalendarValue.String;
  isFocusedTrigger = false;
  hideStateHelper = false;

  calendarWrapper?: HTMLElement;
  appendToElement?: HTMLElement;
  inputElementContainer?: HTMLElement;
  popupElem?: HTMLElement;
  handleInnerElementClickUnlisteners: Function[] = [];
  globalListnersUnlisteners: Function[] = [];
  validateFn?: DateValidator;

  api: IDpDayPickerApi = {
    open: this.showCalendars.bind(this),
    close: this.hideCalendar.bind(this),
    moveCalendarTo: this.moveCalendarTo.bind(this)
  };

  constructor(private readonly dayPickerService: DatePickerModalService,
              private readonly domHelper: DomHelper,
              private readonly elemRef: ElementRef,
              private readonly renderer: Renderer2,
              private readonly utilsService: UtilsService,
              public readonly cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.isInitialized.set(true);
    this.init();
    this.initValidators();
  }

  init() {
    const config = this.componentConfig();
    const currentView = this.currentDateView();
    const selected = this.selected();

    const nextView = this.displayDate()
      ? this.utilsService.convertToMoment(this.displayDate(), config.format || 'YYYY-MM-DD', config.locale || 'fa').clone()
      : this.utilsService.getDefaultDisplayDate(
          currentView,
          selected,
          !!config.allowMultiSelect,
          config.min,
          config.locale || 'fa'
        );

    this.currentDateView.set(nextView);
    this.inputValueType = this.utilsService.getInputType(this.inputValue, !!config.allowMultiSelect);
  }

  initValidators() {
    const config = this.componentConfig();
    this.validateFn = this.utilsService.createValidator(
      {
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        minTime: this.minTime(),
        maxTime: this.maxTime()
      },
      config.format || 'YYYY-MM-DD',
      this.mode(),
      config.locale || 'fa'
    );
  }

  /**
   * A stale min/max error from a previous typed keystroke (handleInvalidDate)
   * must not survive a value written in through either writeValue() or
   * onViewDateChange() — the clear ("X") button and any host-driven
   * formControl.setValue() land in writeValue(), while a corrected keystroke
   * lands in onViewDateChange(), so both call this before doing anything else.
   */
  private resetDateBoundsError(): void {
    this.showMinDateIsNotValid.set(false);
    this.showMaxDateIsNotValid.set(false);
  }

  writeValue(value: CalendarValue): void {
    this.inputValue = value;
    this.resetDateBoundsError();
    const config = this.componentConfig();
    this.inputValueType = this.utilsService.getInputType(value, !!config.allowMultiSelect);

    if (value || value === '') {
      const selectedMoments = this.utilsService.convertToMomentArray(
        value,
        config.format || 'YYYY-MM-DD',
        !!config.allowMultiSelect,
        config.locale || 'fa'
      );
      this.selected.set(selectedMoments);
      this.committedSelection = selectedMoments.map(m => m.clone());

      if (selectedMoments.length) {
        const nextView = this.utilsService.getDefaultDisplayDate(
          this.currentDateView(),
          selectedMoments,
          !!config.allowMultiSelect,
          config.min,
          config.locale || 'fa'
        );
        this.currentDateView.set(nextView);
      }
      this.updateInputElementValue(selectedMoments);
    } else {
      this.selected.set([]);
      this.committedSelection = [];
      this.inputElementValue.set('');
    }

    this.cd.markForCheck();
  }

  updateInputElementValue(selected: Moment[]) {
    const config = this.componentConfig();
    const parts = <string[]> this.utilsService.convertFromMomentArray(
      config.format || 'YYYY-MM-DD',
      selected,
      ECalendarValue.StringArr,
      config.locale || 'fa'
    );
    const separator = this.isRangeMode() ? (config.rangeSeparator || ' - ') : ' | ';
    this.inputElementValue.set(parts.join(separator));
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  onChangeCallback(_: any, _changedByInput: boolean) { }

  registerOnTouched(fn: () => void): void { this.onTouchedCallback = fn; }

  onTouchedCallback = () => {};

  validate(formControl: FormControl): ValidationErrors | null {
    return this.validateFn ? this.validateFn(formControl.value) : null;
  }

  processOnChangeCallback(selected: Moment[] | string): CalendarValue {
    const config = this.componentConfig();
    if (typeof selected === 'string') {
      return selected;
    } else {
      const returnedValueType = config.returnedValueType
        || (this.isRangeMode() ? ECalendarValue.StringArr : this.inputValueType);

      return this.utilsService.convertFromMomentArray(
        config.format || 'YYYY-MM-DD',
        selected,
        returnedValueType,
        config.locale || 'fa'
      );
    }
  }

  @HostListener('click', ['$event'])
  onClick(event?: Event) {
    if (event) {
      const target = event.target as HTMLElement;
      const label = this.inputElementLabel();
      const container = this.calendarContainer();
      const dialog = this.dialogElement();

      const isInputOrLabel = label?.nativeElement?.contains(target);
      const isDialogContainer = container?.nativeElement?.contains(target);
      const isButton = target.tagName === 'BUTTON';

      if (isDialogContainer) return;

      // Click on the backdrop itself closes the modal
      if (dialog?.nativeElement && target === dialog.nativeElement) {
        if (this.componentConfig().hideOnOutsideClick) this.closeModal();
        return;
      }

      if (!isDialogContainer && !isInputOrLabel && !isButton) {
        if (target.tagName === 'INPUT') {
          if (this.componentConfig().openOnClick) this.showCalendars();
          return;
        }
        this.closeModal();
        return;
      }
    }

    if (!this.componentConfig().openOnClick) {
      return;
    }

    if (!this.isFocusedTrigger && !this.disabled()) {
      this.hideStateHelper = true;
      if (!this.isModalOpen()) {
        this.showCalendars();
      }
    }
  }

  inputFocused() {
    if (this.restoringFocus || !this.componentConfig().openOnFocus) return;
    this.showCalendars();
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'Enter'
        || (event.key === ' ' && this.componentConfig().disableKeypress)) {
      event.preventDefault();
      this.showCalendars();
    } else if (event.key === 'Escape' && this.isModalOpen()) {
      event.preventDefault();
      this.closeModal();
    }
  }

  showCalendars() {
    if (this.disabled() || this.isModalOpen()) return;
    this.committedSelection = this.selected().map(m => m.clone());
    const host = this.elemRef.nativeElement as HTMLElement;
    this.lastFocusedElement = host.contains(document.activeElement)
      ? document.activeElement as HTMLElement
      : host.querySelector<HTMLElement>('.dp-picker-input');
    this.hideStateHelper = true;
    this.isModalOpen.set(true);
    this.onOpen.emit();
    this.cd.markForCheck();
    this.showDialogInTopLayerAfterRender();
    this.focusDialogAfterRender();
    this.listenForOutsideClick();
  }

  hideCalendar(restoreFocus = true) {
    if (!this.isModalOpen()) return;
    this.hideDialogFromTopLayer();
    this.isModalOpen.set(false);
    this.onTouchedCallback();
    const dayRef = this.dayCalendarRef();
    if (dayRef) {
      dayRef.api.toggleCalendarMode(ECalendarMode.Day);
    }
    this.onClose.emit();
    this.cd.markForCheck();
    this.stopGlobalListeners();
    // Hand keyboard focus back to whatever opened the dialog rather than
    // dropping it on <body>, which is what closing a modal usually does wrong.
    if (restoreFocus && this.lastFocusedElement?.isConnected) {
      this.restoringFocus = true;
      this.lastFocusedElement.focus({preventScroll: true});
      this.restoringFocus = false;
    }
    this.lastFocusedElement = null;
  }

  /**
   * A full-viewport backdrop already intercepts every click outside the
   * popup content, so the existing (click) host listener closing on a
   * backdrop click is enough for the true-modal case. A dropdown has no
   * backdrop — the rest of the page stays clickable — so closing on an
   * actually-outside click needs a real document-level listener. Registered
   * only while open, and only once (a listener added mid-dispatch of the
   * very click that opened the picker does not receive that same event per
   * the DOM event dispatch algorithm, so this needs no extra debouncing).
   */
  private listenForOutsideClick() {
    if (!this.componentConfig().hideOnOutsideClick) return;
    const host = this.elemRef.nativeElement as HTMLElement;
    const unlisten = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (!host.contains(event.target as Node)) {
        this.closeModal(!this.componentConfig().dropdown);
      }
    });
    this.globalListnersUnlisteners.push(unlisten);
  }

  /**
   * The dialog's content is behind an @if, so it does not exist in the DOM
   * yet on the same tick isModalOpen() flips. A macrotask is enough to run
   * after Angular has rendered it.
   */
  private focusDialogAfterRender() {
    setTimeout(() => {
      const container = this.calendarContainer()?.nativeElement as HTMLElement | undefined;
      if (!container) return;

      const preferred = container.querySelector<HTMLElement>(
        'button.dp-selected:not([disabled]), button[aria-current="date"]:not([disabled]), button[role="gridcell"][tabindex="0"]:not([disabled])'
      );
      const focusable = container.querySelectorAll<HTMLElement>(DatePickerModalComponent.FOCUSABLE_SELECTOR);
      (preferred || focusable[0] || container).focus();
    }, 0);
  }

  /**
   * A very large z-index still cannot escape an ancestor stacking context
   * (for example a transformed layout next to an aside). The Popover API puts
   * the true modal in the browser's top layer, above every normal stacking
   * context. Browsers without the API keep the existing fixed/z-index layout.
   */
  private showDialogInTopLayerAfterRender() {
    if (this.componentConfig().dropdown) return;

    setTimeout(() => {
      const dialog = this.dialogElement()?.nativeElement as HTMLElement | undefined;
      if (!dialog || !this.isModalOpen() || typeof dialog.showPopover !== 'function') return;

      if (!dialog.matches(':popover-open')) {
        dialog.showPopover();
      }
    }, 0);
  }

  private hideDialogFromTopLayer() {
    const dialog = this.dialogElement()?.nativeElement as HTMLElement | undefined;
    if (!dialog || typeof dialog.hidePopover !== 'function') return;

    if (dialog.matches(':popover-open')) {
      dialog.hidePopover();
    }
  }

  /**
   * Minimal modal focus trap (WAI-ARIA APG dialog pattern): Tab/Shift+Tab
   * cycle within the dialog instead of escaping to the page behind it.
   */
  onContainerKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      event.stopPropagation();
      return;
    }

    if (event.key !== 'Tab' || this.componentConfig().dropdown || this.componentConfig().hideInputContainer) return;

    const container = this.calendarContainer()?.nativeElement as HTMLElement | undefined;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(DatePickerModalComponent.FOCUSABLE_SELECTOR)
    ).filter(el => el.offsetParent !== null);
    if (!focusable.length) {
      event.preventDefault();
      container.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onContainerFocusOut(event: FocusEvent) {
    if (!this.componentConfig().dropdown || !event.relatedTarget) return;
    const host = this.elemRef.nativeElement as HTMLElement;
    if (!host.contains(event.relatedTarget as Node)) this.closeModal(false);
  }

  rangeEndpoint(index: number): string {
    const value = this.selected()[index];
    if (!value) return this.componentConfig().locale === 'fa' ? 'انتخاب نشده' : 'Not selected';
    const locale = this.componentConfig().locale || 'fa';
    const formatted = value.clone().locale(locale).format(this.mode() === 'month' ? 'MMMM YYYY' : 'D MMMM YYYY');
    return locale === 'fa'
      ? formatted.replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
      : formatted;
  }

  onViewDateChange(value: CalendarValue) {
    const config = this.componentConfig();
    // handleInvalidDate() below sets the right flag back to true if the new
    // value is still out of range.
    this.resetDateBoundsError();
    if (typeof value === 'string') {
      const raw = value.trim();
      this.inputElementValue.set(value);
      if (!raw) {
        this.selected.set([]);
        this.onChangeCallback('', true);
        return;
      }

      let parsed = UtilsService.parseGregorianDate(raw);
      if (!parsed) {
        // Jalali digits are only a sensible guess on a Jalali-locale picker.
        // This used to try them against a hardcoded 'fa' unconditionally, so
        // e.g. an 'en'-locale picker (min/max well below year 1500, or just
        // an old date typed by hand) that read "1405/06/05" — meant as
        // Gregorian year 1405 — silently became 2026-08-27 instead: the
        // equality check below passed because it re-formatted with the same
        // wrong locale it parsed with, so nothing caught the mismatch.
        //
        // The loose 'jM'/'jD' (and Gregorian 'M'/'D') variants matter too:
        // without them an ordinary unpadded "1405/6/5" matched none of the
        // zero-padded formats and was silently rejected here, even though
        // writeValue()/PersianDatePickerComponent already accepted that same
        // shape for a bound value — typing it directly into the field was a
        // dead end the model path wasn't. The same gap applies with a time
        // part attached (daytime mode's format) — jalali-moment round-trips
        // 'jM'/'jD'/'H'/'m'/'s' exactly as reliably as their padded 'jMM' /
        // 'HH' counterparts, so an unpadded "1405/6/5 8:30:5" deserves the
        // same acceptance as "1405/06/05 08:30:05".
        const locale: 'en' | 'fa' = config.locale === 'en' ? 'en' : 'fa';
        const dateFormats = locale === 'fa' ? UtilsService.JALALI_DATE_FORMATS : UtilsService.GREGORIAN_DATE_FORMATS;
        const fallbackFormats = [
          config.format || dateFormats[0],
          ...UtilsService.withTimeOfDay(dateFormats),
          ...(locale === 'fa' ? ['jYYYYMMDD'] : []),
        ];
        // Reuses the exact matching rule parseGregorianDate/parseJalaliDate
        // use (round-trip equality, not just isValid()) so this fallback list
        // can't silently drift out of parity with theirs the way it already
        // had (it used to only try matched date/time paddings together,
        // rejecting a legitimate "1405/01/01 8:30:5").
        parsed = UtilsService.tryFormats(raw, locale, fallbackFormats);
      }
      if (parsed?.isValid()) {
        // This branch is the only one the real input ever reaches (its
        // ngModel is always a string), so it is also the only place left to
        // enforce minDate/maxDate on typed or pasted text — the legacy
        // check further below now only runs for a non-string value, which
        // nothing in the template ever sends.
        if (this.mode() === 'day' && config.min && parsed.isBefore(config.min, 'day')) {
          this.handleInvalidDate(true);
          return;
        }
        if (this.mode() === 'day' && config.max && parsed.isAfter(config.max, 'day')) {
          this.handleInvalidDate(false);
          return;
        }
        const selected = [parsed.locale(config.locale || 'fa')];
        this.selected.set(selected);
        this.updateInputElementValue(selected);
        this.currentDateView.set(selected[0].clone());
        this.onChangeCallback(selected[0], true);
      }
      return;
    }
    let strVal = value ? this.utilsService.convertToString(value, config.format || 'YYYY-MM-DD', config.locale || 'fa') : '';
    strVal = strVal.replace(/[^0-9.]/g, '');

    if (strVal.length > 7 && this.dayPickerService.isValidInputDateValue(strVal, config)) {
      if (strVal && config.locale === 'fa') {
        strVal = moment.from(strVal, 'fa', config.format || 'YYYY-MM-DD').format(config.format || 'YYYY-MM-DD');
      }
      const selectedArr = this.dayPickerService.convertInputValueToMomentArray(strVal, config);
      this.selected.set(selectedArr);
      this.updateInputElementValue(selectedArr);

      const nextView = this.utilsService.getDefaultDisplayDate(
        this.currentDateView(),
        selectedArr,
        !!config.allowMultiSelect,
        config.min,
        config.locale || 'fa'
      );
      this.currentDateView.set(nextView);
    } else {
      if (this.inputElementValue() && this.minDate() && !this.minDateIsValid) {
        this.handleInvalidDate(true);
      } else if (this.inputElementValue() && this.maxDate() && !this.maxDateIsValid) {
        this.handleInvalidDate(false);
      } else {
        const validArr = this.utilsService.getValidMomentArray(strVal, config.format || 'YYYY-MM-DD', config.locale || 'fa');
        this.selected.set(validArr);
        this.onChangeCallback(this.processOnChangeCallback(strVal), true);
        this.hideCalendar();
      }
    }
  }

  handleInvalidDate(isMin: boolean) {
    this.onChangeCallback('', false);
    this.hideCalendar();
    this.onChange.emit('');
    this.inputElementValue.set('');
    if (isMin) this.showMinDateIsNotValid.set(true);
    else this.showMaxDateIsNotValid.set(true);
  }

  /**
   * jalali-moment's own docs are explicit that the bare `moment(value)`
   * constructor reads a string against whatever the library's *global*
   * ambient locale currently is (see `moment.locale('fa', ...)` in its
   * README) — `moment.from(value, locale, format)` is the documented way to
   * parse against an explicit locale regardless of that ambient state. Both
   * getters used the bare form on the input's own text, which could silently
   * misparse on a page where something set the global locale to 'fa'.
   *
   * The bound itself goes through normalizeBound() directly rather than
   * round-tripping through transformToJalali()'s *formatted string* and
   * re-parsing that — `moment.from` is lenient enough that even the literal
   * text "Invalid date" (transformToJalali's own output for an unparseable
   * bound) parses back into a fabricated "valid" moment instead of staying
   * invalid, which silently disabled minDateIsValid (permanently true) and
   * bricked maxDateIsValid (permanently false) for every value typed against
   * a malformed bound. Checking normalizeBound's own isValid() catches that
   * directly, the same way `!min` already does for an *absent* bound.
   */
  get minDateIsValid(): boolean {
    const inputVal = this.inputElementValue();
    const min = this.minDate();
    if (!inputVal || !min) return true;

    const config = this.componentConfig();
    const currentDate = moment.from(inputVal, config.locale || 'fa', config.format || 'YYYY-MM-DD').locale('en');
    const minMoment = this.normalizeBound(min).locale('en');
    if (!minMoment.isValid()) return true;
    return this.mode() !== 'day' || minMoment.isBefore(currentDate);
  }

  get maxDateIsValid(): boolean {
    const inputVal = this.inputElementValue();
    const max = this.maxDate();
    if (!inputVal || !max) return true;

    const config = this.componentConfig();
    const currentDate = moment.from(inputVal, config.locale || 'fa', config.format || 'YYYY-MM-DD').locale('en');
    const maxMoment = this.normalizeBound(max).locale('en');
    if (!maxMoment.isValid()) return true;
    return this.mode() !== 'day' || maxMoment.isAfter(currentDate);
  }

  dateSelected(date: IDate, granularity: unitOfTime.Base, forceClose?: boolean) {
    if (this.disabled() || !date.date?.isValid()) return;

    const nextSelected = this.isRangeMode()
      ? this.utilsService.updateSelectedRange(this.selected(), date, granularity)
      : this.utilsService.updateSelected(
          !!this.componentConfig().allowMultiSelect,
          this.selected(),
          date,
          granularity
        );

    this.applySelection(nextSelected, forceClose);
  }

  /**
   * Replaces the whole selection (used by modes whose child component owns the
   * value, e.g. time and daytime) rather than toggling a single date.
   */
  pendingValueChanged(date: IDate) {
    if (this.disabled() || !date?.date?.isValid()) return;
    this.applySelection([date.date.clone()]);
  }

  private applySelection(nextSelected: Moment[], forceClose?: boolean) {
    this.selected.set(nextSelected);
    this.updateInputElementValue(nextSelected);

    // With an action bar the value stays pending until the user confirms, so
    // hosts do not receive a stream of half-finished values.
    const selectionIsComplete = !this.isRangeMode() || nextSelected.length === 2;
    if (!this.showActionButtons() && selectionIsComplete) {
      this.commitSelection(nextSelected);
    }

    if (forceClose || (!this.showActionButtons() && selectionIsComplete && this.componentConfig().closeOnSelect)) {
      this.closeModal();
    }
    this.cd.markForCheck();
  }

  private commitSelection(selection: Moment[]) {
    this.committedSelection = selection.map(m => m.clone());
    const val = this.processOnChangeCallback(selection);
    this.onChangeCallback(val, false);
    this.onChange.emit(val);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.keyCode === 9 || event.keyCode === 27) {
      this.hideCalendar();
    }
  }

  moveCalendarTo(date: SingleCalendarValue) {
    const config = this.componentConfig();
    this.currentDateView.set(this.utilsService.convertToMoment(date, config.format || 'YYYY-MM-DD', config.locale || 'fa'));
  }

  onLeftNavClick(change: INavEvent) {
    this.onLeftNav.emit(change);
  }

  onRightNavClick(change: INavEvent) {
    this.onRightNav.emit(change);
  }

  closeModal(restoreFocus = true): void {
    if (!this.isModalOpen()) return;
    // Discard anything the user did not confirm.
    if (this.showActionButtons() || this.isRangeMode()) {
      const restored = this.committedSelection.map(m => m.clone());
      this.selected.set(restored);
      this.updateInputElementValue(restored);
    }
    this.hideCalendar(restoreFocus);
    this.cd.markForCheck();
  }

  confirmModal(): void {
    if (this.disabled() || !this.canConfirm) return;
    let selection = this.selected();

    if (!selection.length) {
      // Time panels start on "now" without emitting, so confirming straight
      // away should still commit what the user is looking at.
      const fallback = this.timeSelectRef()?.selected || this.dayTimeCalendarRef()?.selected;
      if (fallback) {
        selection = [fallback.clone()];
        this.selected.set(selection);
        this.updateInputElementValue(selection);
      }
    }

    this.commitSelection(selection);
    this.hideCalendar();
    this.cd.markForCheck();
  }

  get canConfirm(): boolean {
    // A range is only usable once both ends are picked.
    if (this.isRangeMode()) {
      return this.selected().length === 2;
    }
    // Time panels always hold a value, even before the user touches them.
    if (this.mode() === 'time' || this.mode() === 'daytime') {
      return true;
    }
    return this.selected().length > 0;
  }

  /**
   * `value` is normally already a Moment (both current callers get it from
   * minDate()/maxDate(), and PersianDatePickerComponent only ever hands this
   * component an already-normalized Moment) — cloning one doesn't touch
   * jalali-moment's ambient global locale, so that case is unaffected. A raw
   * string is possible from a bare `<dp-date-picker-modal>` or the
   * `dp-date-picker` directive used directly with `[minDate]`/`[maxDate]`
   * bound to a plain string (both publicly exported) — parseGregorianDate
   * keeps a Gregorian-shaped one Gregorian, parseJalaliDate keeps a
   * Jalali-shaped one Jalali, both regardless of the ambient locale. This is
   * the exact text the min/max error message renders through
   * `{{ transformToJalali(minDate()) }}` (date-picker.component.html), so a
   * misread here isn't just a comparison bug — it's a wrong date shown
   * directly to the user in the error itself.
   *
   * Neither dedicated parser matching means `value` isn't Gregorian- or
   * Jalali-date-shaped at all (a typo'd binding, a malformed API field) — an
   * earlier version of this fallback still attempted a lenient `moment.from`
   * parse at that point, but that call is lenient to the point of
   * uselessness as a validator (it turned "not a date" into a "valid"
   * moment on some fabricated real-looking date) and jalali-moment's own
   * `moment.from`/`moment()` can throw outright for some malformed/
   * implausible input instead of returning an invalid moment at all.
   * `moment.invalid()` renders as "Invalid date" rather than crashing the
   * template or fabricating a wrong-but-plausible date out of unrelated text.
   *
   * Delegates to normalizeBound() rather than inlining this itself, so
   * minDateIsValid/maxDateIsValid can reuse the *actual Moment* (valid or
   * not) instead of re-parsing this method's already-lossy formatted string
   * output — see normalizeBound's own doc comment for why that round trip is
   * unsafe.
   */
  transformToJalali(value: any, toFormat = 'jYYYY/jMM/jDD'): string {
    if (!value) return '';
    return this.normalizeBound(value).format(toFormat);
  }

  /**
   * `value` is normally already a Moment (both current callers get it from
   * minDate()/maxDate(), and PersianDatePickerComponent only ever hands this
   * component an already-normalized Moment) — cloning one doesn't touch
   * jalali-moment's ambient global locale, so that case is unaffected. A raw
   * string is possible from a bare `<dp-date-picker-modal>` or the
   * `dp-date-picker` directive used directly with `[minDate]`/`[maxDate]`
   * bound to a plain string (both publicly exported).
   *
   * Returns the real Moment (or `moment.invalid()`) rather than a formatted
   * string specifically so callers can check `.isValid()` themselves —
   * `moment.from(formattedString, ...)` cannot be trusted to do that: it's
   * lenient enough to parse even the literal text "Invalid date" into a
   * fabricated "valid" moment instead of staying invalid (verified against
   * this package's own jalali-moment version).
   *
   * A leading year at or below 1500 is genuinely ambiguous on its own — both
   * calendars have real dates shaped that way — so parseGregorianDate gates
   * on it and falls through to parseJalaliDate by default. But this picker's
   * own configured locale already answers that question when it isn't the
   * Jalali default: an 'en'-locale picker has no legitimate reason to accept
   * a Jalali-calendar bound at all, so a historical Gregorian bound like
   * "1499-06-15" must not be misread as Jalali just because it is old.
   */
  private normalizeBound(value: any): Moment {
    if (typeof value !== 'string') {
      return momentNs(value);
    }
    if ((this.componentConfig().locale || 'fa') !== 'fa') {
      return UtilsService.parseGregorianDate(value, false) || moment.invalid();
    }
    return UtilsService.parseGregorianDate(value) || UtilsService.parseJalaliDate(value) || moment.invalid();
  }

  ngOnDestroy() {
    this.hideDialogFromTopLayer();
    this.handleInnerElementClickUnlisteners.forEach(ul => ul());
    this.stopGlobalListeners();
  }

  private stopGlobalListeners() {
    this.globalListnersUnlisteners.forEach(ul => ul());
    this.globalListnersUnlisteners = [];
  }
}
