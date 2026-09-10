import {ECalendarValue} from '../common/types/calendar-value-enum';
import {SingleCalendarValue} from '../common/types/single-calendar-value';
import {ECalendarMode} from '../common/types/calendar-mode-enum';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostBinding,
  inject,
  input,
  OnChanges,
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
export class DayCalendarComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {
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

  // Internal state
  CalendarMode = ECalendarMode;
  isInited = signal(false);
  currentCalendarMode = signal<ECalendarMode>(ECalendarMode.Day);
  selected = signal<Moment[]>([]);
  currentDateView = signal<Moment>(moment());
  hoveredDate = signal<Moment | null>(null);
  /** Where the arrow keys have moved to, once the user starts using them. */
  focusedDate = signal<Moment | null>(null);

  private readonly elementRef = inject(ElementRef);

  // Computed values
  componentConfig = computed(() => this.dayCalendarService.getConfig({
    ...this.config(),
    min: this.minDate() || this.config()?.min,
    max: this.maxDate() || this.config()?.max
  }));
  monthCalendarConfig = computed(() => this.dayCalendarService.getMonthCalendarConfig(this.componentConfig()));
  isRangeMode = computed(() => this.componentConfig().selectionMode === 'range');
  /** Shown between the two range clicks so the user knows what step they're on. */
  rangeHint = computed(() => {
    if (!this.isRangeMode() || this.selected().length !== 1) return null;
    return this.componentConfig().locale === 'fa' ? 'تاریخ پایان بازه را انتخاب کنید' : 'Pick the end date';
  });

  weeks = computed(() => this.dayCalendarService.generateMonthArray(this.componentConfig(), this.currentDateView(), this.selected()));

  /**
   * The single day button that Tab can reach. A calendar that leaves all 42
   * buttons in the tab order makes a keyboard user press Tab dozens of times
   * to get past it; the ARIA grid pattern is one stop for the whole grid,
   * with the arrow keys moving within it. The anchor falls back through
   * selection, then today, then the first day of the month on show, so Tab
   * always lands somewhere meaningful.
   */
  tabbableDate = computed<Moment | null>(() => {
    const days = this.weeks().flat().filter(day => !day.disabled);
    const focused = this.focusedDate();

    const anchor = (focused && days.find(day => day.date.isSame(focused, 'day')))
      || days.find(day => day.selected)
      || days.find(day => day.currentDay && day.currentMonth)
      || days.find(day => day.currentMonth)
      || days[0];

    return anchor ? anchor.date : null;
  });
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

  ngOnChanges() {
    if (this.isInited()) this.init();
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

  }

  /** `null` is in the signature because a form reset really does hand one
   * over — the branch below already relied on it. */
  writeValue(value: CalendarValue | null): void {
    // A click changes selected(), not inputValue. Always apply model writes:
    // resetting to the original null must also clear a user's selection.
    this.inputValue = value ?? '';
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
    if (day.disabled) return;

    let nextSelected: Moment[];
    if (this.isRangeMode()) {
      nextSelected = this.utilsService.updateSelectedRange(this.selected(), day, 'day');
      this.hoveredDate.set(null);
    } else {
      if (day.selected && !this.componentConfig().unSelectOnClick) {
        return;
      }
      nextSelected = this.utilsService.updateSelected(!!this.componentConfig().allowMultiSelect, this.selected(), day);
    }

    this.selected.set(nextSelected);
    this.onChangeCallback(this.processOnChangeCallback(nextSelected));
    this.onSelect.emit(day);
  }

  isTabbable(day: IDay): boolean {
    const anchor = this.tabbableDate();
    return !!anchor && day.date.isSame(anchor, 'day');
  }

  /**
   * Arrow keys move by a day, Up/Down by a week, PageUp/PageDown by a month
   * and Home/End to the ends of the week — the keyboard contract every
   * calendar widget is expected to honour. Selection stays on Enter/Space,
   * which the day buttons already handle natively.
   */
  onDayKeydown(event: KeyboardEvent, day: IDay) {
    const target = event.key === 'Home' || event.key === 'End'
      ? this.weekEdgeDate(day, event.key)
      : this.steppedDate(day, event.key);

    if (!target) {
      return;
    }

    event.preventDefault();

    if (!target.isSame(this.currentDateView(), 'month')) {
      this.currentDateView.set(target.clone());
    }
    this.focusedDate.set(target);
    this.focusDayAfterRender(target);
  }

  private steppedDate(day: IDay, key: string): Moment | null {
    /* The grid runs right-to-left in Farsi, so the arrow that visually moves
       forward through the month is the left one. */
    const forward = this.isFarsi() ? 'ArrowLeft' : 'ArrowRight';
    const back = this.isFarsi() ? 'ArrowRight' : 'ArrowLeft';

    const steps: { [key: string]: [number, unitOfTime.Base] } = {
      [forward]: [1, 'day'],
      [back]: [-1, 'day'],
      ArrowDown: [7, 'day'],
      ArrowUp: [-7, 'day'],
      PageDown: [1, 'month'],
      PageUp: [-1, 'month']
    };

    const step = steps[key];
    if (!step) {
      return null;
    }

    /* Which calendar a "month" belongs to is decided by the moment's own
       locale, so paging has to run on one set to the calendar being shown —
       otherwise PageDown adds a Gregorian month to a Jalali view and lands a
       day or two off. */
    const from = day.date.clone().locale(this.componentConfig().locale || 'fa');
    return this.firstEnabledFrom(from.add(step[0], step[1]), step[0]);
  }

  private weekEdgeDate(day: IDay, key: string): Moment | null {
    const row = this.weeks().find(week => week.some(d => d.date.isSame(day.date, 'day')));
    if (!row) {
      return null;
    }

    const ordered = key === 'Home' ? row : [...row].reverse();
    const edge = ordered.find(d => !d.disabled);
    return edge && !edge.date.isSame(day.date, 'day') ? edge.date.clone() : null;
  }

  /**
   * Steps over disabled dates instead of stopping on one: a host that
   * disables every Friday would otherwise strand the cursor there, since a
   * disabled button cannot take focus.
   */
  private firstEnabledFrom(candidate: Moment, direction: number): Moment | null {
    const config = this.componentConfig();
    const stride = direction > 0 ? 1 : -1;
    let date = candidate;

    for (let i = 0; i < 62 && this.dayCalendarService.isDateDisabled(date, config); i++) {
      date = date.add(stride, 'day');
    }

    return this.dayCalendarService.isDateDisabled(date, config) ? null : date;
  }

  /** After a month change the grid is re-rendered, so the button for the new
   * date only exists once Angular has flushed the view. */
  private focusDayAfterRender(date: Moment) {
    const attr = date.format(this.componentConfig().format);
    setTimeout(() => {
      const host = this.elementRef.nativeElement as HTMLElement;
      host.querySelector<HTMLButtonElement>(`button.dp-calendar-day[data-date="${attr}"]`)?.focus();
    });
  }

  dayHovered(day: IDay) {
    if (!this.isRangeMode() || day.disabled) return;
    // Only meaningful while a range is half-open.
    if (this.selected().length === 1) {
      this.hoveredDate.set(day.date);
    }
  }

  clearHover() {
    if (this.hoveredDate()) {
      this.hoveredDate.set(null);
    }
  }

  getDayBtnText(day: IDay): string {
    return this.dayCalendarService.getDayBtnText(this.componentConfig(), day.date);
  }

  /**
   * The visible button text is a bare number ("۱۲"); a screen reader needs the
   * full date (weekday, day, month, year) to make sense of it out of context.
   */
  getDayAriaLabel(day: IDay): string {
    const config = this.componentConfig();
    const format = config.locale === 'fa' ? 'dddd D MMMM jYYYY' : 'dddd, MMMM D, YYYY';
    return day.date.clone().locale(config.locale || 'fa').format(format);
  }

  getDayBtnCssClass(day: IDay): { [klass: string]: boolean } {
    const cssClasses: { [klass: string]: boolean } = {
      'dp-selected': !!day.selected,
      'dp-current-month': !!day.currentMonth,
      'dp-prev-month': !!day.prevMonth,
      'dp-next-month': !!day.nextMonth,
      'dp-current-day': !!day.currentDay
    };

    if (this.isRangeMode()) {
      const range = this.utilsService.getRangeState(day.date, this.selected(), this.hoveredDate(), 'day');
      cssClasses['dp-range-start'] = range.isStart;
      cssClasses['dp-range-end'] = range.isEnd;
      cssClasses['dp-in-range'] = range.isInRange;
      cssClasses['dp-range-preview'] = range.isPreview && range.isInRange;
      cssClasses['dp-selected'] = range.isStart || range.isEnd;
    }

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

    if (this.isRangeMode()) {
      // Navigating home should not silently close a half-open range.
      this.onGoToCurrent.emit();
      this.cd.markForCheck();
      return;
    }

    // Select today, not just navigate to it
    this.dayClicked({date: today, selected: false});
    this.onGoToCurrent.emit();
  }

  isFarsi(): boolean {
    return this.componentConfig().locale === 'fa';
  }
}
