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
  /** Shown by default as a visible affordance that the input opens a picker;
   * set to false to rely purely on focusing/clicking the input itself
   * (openOnFocus/openOnClick already do that regardless of this flag). */
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
  private static readonly FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Computeds
  componentConfig = computed(() => this.dayPickerService.getConfig({
    ...this.config(),
    min: this.minDate() || this.config()?.min,
    max: this.maxDate() || this.config()?.max,
    selectionMode: this.selectionMode() || this.config()?.selectionMode
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

  writeValue(value: CalendarValue): void {
    this.inputValue = value;
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
        this.closeModal();
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
    if (this.disabled()) return;
    if (!this.componentConfig().openOnFocus) {
      return;
    }
    this.isModalOpen.set(true);
    this.showDialogInTopLayerAfterRender();
    this.isFocusedTrigger = true;
    setTimeout(() => {
      this.hideStateHelper = false;
      this.isFocusedTrigger = false;
    }, this.componentConfig().onOpenDelay || 0);
  }

  showCalendars() {
    if (this.disabled() || this.isModalOpen()) return;
    this.committedSelection = this.selected().map(m => m.clone());
    this.lastFocusedElement = document.activeElement as HTMLElement;
    this.hideStateHelper = true;
    this.isModalOpen.set(true);
    this.onOpen.emit();
    this.cd.markForCheck();
    this.showDialogInTopLayerAfterRender();
    this.focusDialogAfterRender();
    this.listenForOutsideClick();
  }

  hideCalendar() {
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
    this.lastFocusedElement?.focus();
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
        this.closeModal();
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
        '.dp-selected, [aria-current="date"]'
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
      this.closeModal();
      event.stopPropagation();
      return;
    }

    if (event.key !== 'Tab') return;

    const container = this.calendarContainer()?.nativeElement as HTMLElement | undefined;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(DatePickerModalComponent.FOCUSABLE_SELECTOR)
    ).filter(el => el.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onViewDateChange(value: CalendarValue) {
    const config = this.componentConfig();
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

  get minDateIsValid(): boolean {
    const inputVal = this.inputElementValue();
    const min = this.minDate();
    if (!inputVal || !min) return true;

    const currentDate = moment(inputVal).locale('en');
    const minMoment = moment(this.transformToJalali(min)).locale('en');
    return this.mode() !== 'day' || minMoment.isBefore(currentDate);
  }

  get maxDateIsValid(): boolean {
    const inputVal = this.inputElementValue();
    const max = this.maxDate();
    if (!inputVal || !max) return true;

    const currentDate = moment(inputVal).locale('en');
    const maxMoment = moment(this.transformToJalali(max)).locale('en');
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
    if (!this.showActionButtons()) {
      this.commitSelection(nextSelected);
    }

    if (forceClose || (!this.showActionButtons() && this.componentConfig().closeOnSelect)) {
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

  closeModal(): void {
    // Discard anything the user did not confirm.
    if (this.showActionButtons()) {
      const restored = this.committedSelection.map(m => m.clone());
      this.selected.set(restored);
      this.updateInputElementValue(restored);
    }
    this.hideCalendar();
    this.cd.markForCheck();
  }

  confirmModal(): void {
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

  transformToJalali(value: any, toFormat = 'jYYYY/jMM/jDD'): string {
    if (!value) return '';
    return momentNs(value).format(toFormat);
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
