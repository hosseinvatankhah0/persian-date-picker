import {ECalendarValue} from '../common/types/calendar-value-enum';
import {SingleCalendarValue} from '../common/types/single-calendar-value';
import {ECalendarMode} from '../common/types/calendar-mode-enum';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  HostBinding,
  input,
  OnInit,
  output,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {DayCalendarService} from './day-calendar.service';
import momentNs, {Moment, MomentInput, unitOfTime} from 'jalali-moment';
import {IDayCalendarConfig} from './day-calendar-config.model';
import {IDay} from './day.model';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormControl,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {CalendarValue} from '../common/types/calendar-value';
import {UtilsService} from '../common/services/utils/utils.service';
import {IMonth} from '../month-calendar/month.model';
import {DateValidator} from '../common/types/validator.type';
import {INavEvent} from '../common/models/navigation-event.model';
import {CommonModule, NgClass} from '@angular/common';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import {MonthCalendarComponent} from '../month-calendar/month-calendar.component';

const moment = momentNs;

@Component({
  standalone: true,
  selector: 'dp-day-calendar',
  templateUrl: 'day-calendar.component.html',
  styleUrls: ['day-calendar.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgClass,
    CalendarNavComponent,
    MonthCalendarComponent
  ],
  providers: [
    DayCalendarService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DayCalendarComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DayCalendarComponent),
      multi: true
    }
  ]
})
export class DayCalendarComponent implements OnInit, ControlValueAccessor, Validator {
  // Inputs (Signals)
  config = input<IDayCalendarConfig>();
  displayDate = input<SingleCalendarValue>();
  minDate = input<Moment>();
  maxDate = input<Moment>();
  theme = input<string>();

  @HostBinding('class') get themeClass() {
    return this.theme() || '';
  }

  // Outputs
  onSelect = output<IDay>();
  onMonthSelect = output<IMonth>();
  onNavHeaderBtnClick = output<ECalendarMode>();
  onGoToCurrent = output<void>();
  onLeftNav = output<INavEvent>();
  onRightNav = output<INavEvent>();
  onLeftSecondaryNav = output<INavEvent>();
  onRightSecondaryNav = output<INavEvent>();

  // Internal state
  CalendarMode = ECalendarMode;
  isInited = signal(false);
  currentCalendarMode = signal<ECalendarMode>(ECalendarMode.Day);
  selected = signal<Moment[]>([]);
  currentDateView = signal<Moment>(moment());

  // Computed values
  componentConfig = computed(() => this.dayCalendarService.getConfig(this.config() || {}));
  monthCalendarConfig = computed(() => this.dayCalendarService.getMonthCalendarConfig(this.componentConfig()));

  weeks = computed(() => this.dayCalendarService.generateMonthArray(this.componentConfig(), this.currentDateView(), this.selected()));
  weekdays = computed(() => this.dayCalendarService.generateWeekdays(this.componentConfig().firstDayOfWeek || 'sa', this.componentConfig().locale || 'fa'));

  navLabel = computed(() => this.dayCalendarService.getHeaderLabel(this.componentConfig(), this.currentDateView()));
  showLeftNav = computed(() => this.dayCalendarService.shouldShowLeft(this.componentConfig().min, this.currentDateView()));
  showRightNav = computed(() => this.dayCalendarService.shouldShowRight(this.componentConfig().max, this.currentDateView()));
  shouldShowCurrent = computed(() => this.utilsService.shouldShowCurrent(
    this.componentConfig().showGoToCurrent,
    'day',
    this.componentConfig().min,
    this.componentConfig().max
  ));

  inputValue: CalendarValue = '';
  inputValueType: ECalendarValue = ECalendarValue.String;
  validateFn?: DateValidator;

  api = {
    moveCalendarsBy: this.moveCalendarsBy.bind(this),
    moveCalendarTo: this.moveCalendarTo.bind(this),
    toggleCalendarMode: this.toggleCalendarMode.bind(this)
  };

  constructor(public readonly dayCalendarService: DayCalendarService,
              public readonly utilsService: UtilsService,
              public readonly cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.isInited.set(true);
    this.init();
    this.initValidators();
  }

  init() {
    const config = this.componentConfig();
    const currentView = this.currentDateView();
    const selected = this.selected();

    const nextView = this.displayDate()
      ? this.utilsService.convertToMoment(this.displayDate(), config.format || 'YYYY/M/D', config.locale || 'fa').clone()
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
      {minDate: this.minDate(), maxDate: this.maxDate()},
      config.format || 'YYYY/M/D',
      'day',
      config.locale || 'fa'
    );

    this.onChangeCallback(this.processOnChangeCallback(this.selected()));
  }

  writeValue(value: CalendarValue): void {
    if (value === this.inputValue || (this.inputValue && moment.isMoment(this.inputValue) && (this.inputValue as Moment).isSame(<MomentInput>value))) {
      return;
    }

    this.inputValue = value;
    const config = this.componentConfig();

    if (value) {
      const selectedArr = this.utilsService.convertToMomentArray(value, config.format || 'YYYY/M/D', !!config.allowMultiSelect, config.locale || 'fa');
      this.selected.set(selectedArr);
      this.inputValueType = this.utilsService.getInputType(this.inputValue, !!config.allowMultiSelect);
    } else {
      this.selected.set([]);
    }

    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  onChangeCallback(_: any) { }

  registerOnTouched(_fn: any): void { }

  validate(formControl: FormControl): ValidationErrors | null {
    if (this.minDate() || this.maxDate()) {
      return this.validateFn ? this.validateFn(formControl.value) : null;
    }
    return null;
  }

  processOnChangeCallback(value: Moment[]): CalendarValue {
    const config = this.componentConfig();
    return this.utilsService.convertFromMomentArray(
      config.format || 'YYYY/M/D',
      value,
      config.returnedValueType || this.inputValueType,
      config.locale || 'fa'
    );
  }

  dayClicked(day: IDay) {
    if (day.selected && !this.componentConfig().unSelectOnClick) {
      return;
    }

    const nextSelected = this.utilsService.updateSelected(!!this.componentConfig().allowMultiSelect, this.selected(), day);
    this.selected.set(nextSelected);
    this.onSelect.emit(day);
  }

  getDayBtnText(day: IDay): string {
    return this.dayCalendarService.getDayBtnText(this.componentConfig(), day.date);
  }

  getDayBtnCssClass(day: IDay): { [klass: string]: boolean } {
    const cssClasses: { [klass: string]: boolean } = {
      'dp-selected': !!day.selected,
      'dp-current-month': !!day.currentMonth,
      'dp-prev-month': !!day.prevMonth,
      'dp-next-month': !!day.nextMonth,
      'dp-current-day': !!day.currentDay
    };
    const customCssClass: string = this.dayCalendarService.getDayBtnCssClass(this.componentConfig(), day.date);
    if (customCssClass) {
      cssClasses[customCssClass] = true;
    }

    return cssClasses;
  }

  onLeftNavClick() {
    const from = this.currentDateView().clone();
    this.moveCalendarsBy(this.currentDateView(), -1, 'month');
    const to = this.currentDateView().clone();
    this.onLeftNav.emit({from, to});
  }

  onRightNavClick() {
    const from = this.currentDateView().clone();
    this.moveCalendarsBy(this.currentDateView(), 1, 'month');
    const to = this.currentDateView().clone();
    this.onRightNav.emit({from, to});
  }

  onMonthCalendarLeftClick(event: INavEvent) {
    this.onLeftNav.emit(event);
  }

  onMonthCalendarRightClick(event: INavEvent) {
    this.onRightNav.emit(event);
  }

  onMonthCalendarSecondaryLeftClick(event: INavEvent) {
    this.onLeftSecondaryNav.emit(event);
  }

  onMonthCalendarSecondaryRightClick(event: INavEvent) {
    this.onRightSecondaryNav.emit(event);
  }

  getWeekdayName(weekday: Moment): string {
    const config = this.componentConfig();
    if (config.weekDayFormatter) {
      return config.weekDayFormatter(weekday.day());
    }

    return weekday.format(config.weekDayFormat);
  }

  toggleCalendarMode(mode: ECalendarMode) {
    if (this.currentCalendarMode() !== mode) {
      this.currentCalendarMode.set(mode);
      this.onNavHeaderBtnClick.emit(mode);
    }
    this.cd.markForCheck();
  }

  monthSelected(month: IMonth) {
    this.currentDateView.set(month.date.clone());
    this.currentCalendarMode.set(ECalendarMode.Day);
    this.onMonthSelect.emit(month);
  }

  moveCalendarsBy(current: Moment, amount: number, granularity: unitOfTime.Base = 'month') {
    this.currentDateView.set(current.clone().add(amount, granularity));
    this.cd.markForCheck();
  }

  moveCalendarTo(to: SingleCalendarValue) {
    if (to) {
      this.currentDateView.set(this.utilsService.convertToMoment(to, this.componentConfig().format || 'YYYY/M/D', this.componentConfig().locale || 'fa'));
    }
    this.cd.markForCheck();
  }

  goToCurrent() {
    const today = moment().locale(this.componentConfig().locale || 'fa');
    this.currentDateView.set(today.clone());
    // Select today, not just navigate to it
    this.dayClicked({date: today, selected: false});
    this.onGoToCurrent.emit();
  }

  isFarsi(): boolean {
    return this.componentConfig().locale === 'fa';
  }
}
