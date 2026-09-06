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
  // Inputs
  config = input<IDatePickerModalConfig>();
  mode = input<CalendarMode>('day');
  placeholder = input<string>('');
  fontSize = input<number>(23);
  disabled = input<boolean>(false);
  displayDate = input<any>();
  theme = input<string>('');
  minDate = input<any>();
  maxDate = input<any>();
  minTime = input<SingleCalendarValue>();
  maxTime = input<SingleCalendarValue>();

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

  // Signals for state
  isInitialized = signal(false);
  isModalOpen = signal(false);
  inputElementValue = signal<string>('');
  selected = signal<Moment[]>([]);
  currentDateView = signal<Moment>(moment());

  showMinDateIsNotValid = signal(false);
  showMaxDateIsNotValid = signal(false);

  // Computeds
  componentConfig = computed(() => this.dayPickerService.getConfig(this.config() || {}, this.mode()));
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
    this.onChangeCallback(this.processOnChangeCallback(this.selected()), false);
  }

  writeValue(value: CalendarValue): void {
    this.inputValue = value;
    const config = this.componentConfig();

    if (value || value === '') {
      const selectedMoments = this.utilsService.convertToMomentArray(
        value,
        config.format || 'YYYY-MM-DD',
        !!config.allowMultiSelect,
        config.locale || 'fa'
      );
      this.selected.set(selectedMoments);

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
      this.inputElementValue.set('');
    }

    this.cd.markForCheck();
  }

  updateInputElementValue(selected: Moment[]) {
    const config = this.componentConfig();
    const val = (<string[]> this.utilsService.convertFromMomentArray(
      config.format || 'YYYY-MM-DD',
      selected,
      ECalendarValue.StringArr,
      config.locale || 'fa'
    )).join(' | ');
    this.inputElementValue.set(val);
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  onChangeCallback(_: any, _changedByInput: boolean) { }

  registerOnTouched(_fn: any): void { }

  validate(formControl: FormControl): ValidationErrors | null {
    return this.validateFn ? this.validateFn(formControl.value) : null;
  }

  processOnChangeCallback(selected: Moment[] | string): CalendarValue {
    const config = this.componentConfig();
    if (typeof selected === 'string') {
      return selected;
    } else {
      return this.utilsService.convertFromMomentArray(
        config.format || 'YYYY-MM-DD',
        selected,
        config.returnedValueType || this.inputValueType,
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

      const isInputOrLabel = label?.nativeElement?.contains(target);
      const isDialogContainer = container?.nativeElement?.contains(target);
      const isButton = target.tagName === 'BUTTON';

      if (!isDialogContainer && !isInputOrLabel && !isButton) {
        this.closeModal();
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
    if (!this.componentConfig().openOnFocus) {
      return;
    }
    this.isModalOpen.set(true);
    this.isFocusedTrigger = true;
    setTimeout(() => {
      this.hideStateHelper = false;
      this.isFocusedTrigger = false;
    }, this.componentConfig().onOpenDelay || 0);
  }

  showCalendars() {
    this.hideStateHelper = true;
    this.isModalOpen.set(true);
    const timeRef = this.timeSelectRef();
    if (timeRef) {
      timeRef.api.triggerChange();
    }
    this.onOpen.emit();
    this.cd.markForCheck();
  }

  hideCalendar() {
    this.isModalOpen.set(false);
    const dayRef = this.dayCalendarRef();
    if (dayRef) {
      dayRef.api.toggleCalendarMode(ECalendarMode.Day);
    }
    this.onClose.emit();
    this.cd.markForCheck();
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

  dateSelected(date: IDate, granularity: unitOfTime.Base, _ignoreClose?: boolean) {
    const nextSelected = this.utilsService.updateSelected(
      !!this.componentConfig().allowMultiSelect,
      this.selected(),
      date,
      granularity
    );
    this.selected.set(nextSelected);
    this.updateInputElementValue(nextSelected);

    const val = this.processOnChangeCallback(nextSelected);
    this.onChangeCallback(val, false);
    this.onChange.emit(val);

    this.onDateClick();
    this.closeModal();
  }

  async onDateClick() {
    if (this.componentConfig().closeOnSelect) {
      const cond = await this.checkClass();
      if (cond) {
        setTimeout(this.hideCalendar.bind(this), this.componentConfig().closeOnSelectDelay || 0);
      }
    }
  }

  checkClass(): Promise<boolean> {
    return new Promise((resolve) => {
      const listener = (evt: MouseEvent) => {
        const target = evt.target as HTMLElement;
        document.removeEventListener('click', listener);
        resolve(target.className ? target.className.includes('dp-calendar-day') : false);
      };
      document.addEventListener('click', listener);
    });
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
    this.isModalOpen.set(false);
    this.hideCalendar();
    this.cd.markForCheck();
  }

  transformToJalali(value: any, toFormat = 'jYYYY/jMM/jDD'): string {
    if (!value) return '';
    return momentNs(value).format(toFormat);
  }

  ngOnDestroy() {
    this.handleInnerElementClickUnlisteners.forEach(ul => ul());
    this.stopGlobalListeners();
  }

  private stopGlobalListeners() {
    this.globalListnersUnlisteners.forEach(ul => ul());
    this.globalListnersUnlisteners = [];
  }
}
