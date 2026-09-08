import {ECalendarValue} from '../common/types/calendar-value-enum';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  HostBinding,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {IMonth} from './month.model';
import {MonthCalendarService} from './month-calendar.service';
import momentNs, {Moment} from 'jalali-moment';
import {IMonthCalendarConfig} from './month-calendar-config';
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
import {DateValidator} from '../common/types/validator.type';
import {SingleCalendarValue} from '../common/types/single-calendar-value';
import {INavEvent} from '../common/models/navigation-event.model';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import {CommonModule, NgClass} from '@angular/common';

const moment = momentNs;

@Component({
  standalone: true,
  selector: 'dp-month-calendar',
  templateUrl: 'month-calendar.component.html',
  styleUrls: ['month-calendar.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CalendarNavComponent,
    NgClass
  ],
  providers: [
    MonthCalendarService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonthCalendarComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MonthCalendarComponent),
      multi: true
    }
  ]
})
export class MonthCalendarComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {
  config = input<IMonthCalendarConfig>();
  displayDate = input<Moment>();
  minDate = input<Moment>();
  maxDate = input<Moment>();
  theme = input<string>();

  @HostBinding('class') get themeClass() {
    return this.theme() || '';
  }

  onSelect = output<IMonth>();
  onNavHeaderBtnClick = output<void>();
  onGoToCurrent = output<void>();
  onLeftNav = output<INavEvent>();
  onRightNav = output<INavEvent>();
  onLeftSecondaryNav = output<INavEvent>();
  onRightSecondaryNav = output<INavEvent>();

  isInited = signal(false);
  selected = signal<Moment[]>([]);
  currentDateView = signal<Moment>(moment());
  showYearSelector = signal(false);
  hoveredMonth = signal<Moment | null>(null);

  componentConfig = computed(() => this.monthCalendarService.getConfig({
    ...this.config(),
    min: this.minDate() || this.config()?.min,
    max: this.maxDate() || this.config()?.max
  }));
  yearMonths = computed(() => this.monthCalendarService.generateYear(this.componentConfig(), this.currentDateView(), this.selected()));
  isRangeMode = computed(() => this.componentConfig().selectionMode === 'range');
  /** Shown between the two range clicks so the user knows what step they're on. */
  rangeHint = computed(() => {
    if (!this.isRangeMode() || this.selected().length !== 1) return null;
    return this.componentConfig().locale === 'fa' ? 'ماه پایان بازه را انتخاب کنید' : 'Pick the end month';
  });

  navLabel = computed(() => this.monthCalendarService.getHeaderLabel(this.componentConfig(), this.currentDateView()));
  showLeftNav = computed(() => this.monthCalendarService.shouldShowLeft(this.componentConfig().min, this.currentDateView()));
  showRightNav = computed(() => this.monthCalendarService.shouldShowRight(this.componentConfig().max, this.currentDateView()));
  showSecondaryLeftNav = computed(() => (!!this.componentConfig().showMultipleYearsNavigation && this.showLeftNav()));
  showSecondaryRightNav = computed(() => (!!this.componentConfig().showMultipleYearsNavigation && this.showRightNav()));
  shouldShowCurrent = computed(() => this.utilsService.shouldShowCurrent(
    this.componentConfig().showGoToCurrent,
    'month',
    this.componentConfig().min,
    this.componentConfig().max
  ));
  yearRange = computed(() => this.monthCalendarService.generateYearRange(this.componentConfig(), this.currentDateView()));

  inputValue: CalendarValue = '';
  inputValueType: ECalendarValue = ECalendarValue.String;
  validateFn?: DateValidator;

  api = {
    toggleCalendar: this.toggleCalendarMode.bind(this),
    moveCalendarTo: this.moveCalendarTo.bind(this)
  };

  constructor(public readonly monthCalendarService: MonthCalendarService,
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
      ? this.displayDate()!.clone().locale(config.locale || 'fa')
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

  writeValue(value: CalendarValue): void {
    this.inputValue = value;
    if (value) {
      const config = this.componentConfig();
      const selectedArr = this.utilsService.convertToMomentArray(
        value,
        config.format || 'MMMM-YYYY',
        !!config.allowMultiSelect,
        config.locale || 'fa'
      );
      this.selected.set(selectedArr);
      if (selectedArr.length && !this.displayDate()) {
        this.currentDateView.set(selectedArr[0].clone());
      }
      this.inputValueType = this.utilsService.getInputType(value, !!config.allowMultiSelect);
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

  initValidators() {
    const config = this.componentConfig();
    this.validateFn = this.utilsService.createValidator(
      {minDate: this.minDate(), maxDate: this.maxDate()},
      config.format || 'MMMM-YYYY',
      'month',
      config.locale || 'fa'
    );
  }

  processOnChangeCallback(value: Moment[]): CalendarValue {
    const config = this.componentConfig();
    return this.utilsService.convertFromMomentArray(
      config.format || 'MMMM-YYYY',
      value,
      config.returnedValueType || this.inputValueType,
      config.locale || 'fa'
    );
  }

  monthClicked(month: IMonth) {
    if (month.disabled) return;

    let nextSelected: Moment[];
    if (this.isRangeMode()) {
      nextSelected = this.utilsService.updateSelectedRange(this.selected(), month, 'month');
      this.hoveredMonth.set(null);
    } else {
      if (month.selected && !this.componentConfig().unSelectOnClick) {
        return;
      }
      nextSelected = this.utilsService.updateSelected(!!this.componentConfig().allowMultiSelect, this.selected(), month, 'month');
    }

    this.selected.set(nextSelected);
    this.onChangeCallback(this.processOnChangeCallback(nextSelected));
    this.onSelect.emit(month);
  }

  monthHovered(month: IMonth) {
    if (!this.isRangeMode() || month.disabled) return;
    if (this.selected().length === 1) {
      this.hoveredMonth.set(month.date);
    }
  }

  clearHover() {
    if (this.hoveredMonth()) {
      this.hoveredMonth.set(null);
    }
  }

  onLeftNavClick() {
    const from = this.currentDateView().clone();
    this.currentDateView.set(this.currentDateView().clone().startOf('month').subtract(this.showYearSelector() ? 21 : 1, 'year'));
    const to = this.currentDateView().clone();
    this.onLeftNav.emit({from, to});
  }

  onLeftSecondaryNavClick() {
    const config = this.componentConfig();
    let navigateBy = config.multipleYearsNavigateBy || 1;
    const min = config.min;
    if (min && this.currentDateView().year() - min.year() < navigateBy) {
      navigateBy = this.currentDateView().year() - min.year();
    }

    const from = this.currentDateView().clone();
    this.currentDateView.set(this.currentDateView().clone().subtract(navigateBy, 'year'));
    const to = this.currentDateView().clone();
    this.onLeftSecondaryNav.emit({from, to});
  }

  onRightNavClick() {
    const from = this.currentDateView().clone();
    this.currentDateView.set(this.currentDateView().clone().startOf('month').add(this.showYearSelector() ? 21 : 1, 'year'));
    const to = this.currentDateView().clone();
    this.onRightNav.emit({from, to});
  }

  onRightSecondaryNavClick() {
    const config = this.componentConfig();
    let navigateBy = config.multipleYearsNavigateBy || 1;
    const max = config.max;
    if (max && max.year() - this.currentDateView().year() < navigateBy) {
      navigateBy = max.year() - this.currentDateView().year();
    }

    const from = this.currentDateView().clone();
    this.currentDateView.set(this.currentDateView().clone().add(navigateBy, 'year'));
    const to = this.currentDateView().clone();
    this.onRightSecondaryNav.emit({from, to});
  }

  toggleCalendarMode() {
    this.showYearSelector.set(!this.showYearSelector());
  }

  selectYear(year: number) {
    if (this.isYearDisabled(year)) return;
    const config = this.componentConfig();
    const locale = config.locale || 'fa';
    const newDate = this.currentDateView().clone().locale(locale).startOf('month').year(year);
    this.currentDateView.set(newDate);
    this.showYearSelector.set(false);
    this.cd.markForCheck();
  }

  isCurrentYear(year: number): boolean {
    return this.currentDateView().year() === year;
  }

  isYearDisabled(year: number): boolean {
    const config = this.componentConfig();
    const date = this.currentDateView().clone().locale(config.locale || 'fa').startOf('year').year(year);
    return !!((config.min && date.isBefore(config.min, 'year')) ||
      (config.max && date.isAfter(config.max, 'year')));
  }

  /**
   * The button shows a short month name only; announce the year too so a
   * screen reader can tell "دی" in one year apart from another.
   */
  getMonthAriaLabel(month: IMonth): string {
    const config = this.componentConfig();
    const format = config.locale === 'fa' ? 'MMMM jYYYY' : 'MMMM YYYY';
    return month.date.clone().locale(config.locale || 'fa').format(format);
  }

  getMonthBtnCssClass(month: IMonth): { [klass: string]: boolean } {
    const cssClass: { [klass: string]: boolean } = {
      'dp-selected': !!month.selected,
      'dp-current-month': !!month.currentMonth
    };

    if (this.isRangeMode()) {
      const range = this.utilsService.getRangeState(month.date, this.selected(), this.hoveredMonth(), 'month');
      cssClass['dp-range-start'] = range.isStart;
      cssClass['dp-range-end'] = range.isEnd;
      cssClass['dp-in-range'] = range.isInRange;
      cssClass['dp-range-preview'] = range.isPreview && range.isInRange;
      cssClass['dp-selected'] = range.isStart || range.isEnd;
    }

    const customCssClass: string = this.monthCalendarService.getMonthBtnCssClass(this.componentConfig(), month.date);

    if (customCssClass) {
      cssClass[customCssClass] = true;
    }

    return cssClass;
  }

  goToCurrent() {
    const config = this.componentConfig();
    const now = moment().locale(config.locale || 'fa');
    this.currentDateView.set(now.clone());

    if (this.isRangeMode()) {
      // Navigating home should not silently close a half-open range.
      this.onGoToCurrent.emit();
      this.cd.markForCheck();
      return;
    }

    // Select the current month, not just navigate to it
    this.monthClicked({
      date: now.clone().startOf('month'),
      selected: false,
      currentMonth: true,
      disabled: false,
      text: this.monthCalendarService.getMonthBtnText(config, now)
    });
    this.onGoToCurrent.emit();
  }

  moveCalendarTo(to: SingleCalendarValue) {
    if (to) {
      const config = this.componentConfig();
      this.currentDateView.set(this.utilsService.convertToMoment(to, config.format || 'MMMM-YYYY', config.locale || 'fa'));
      this.cd.markForCheck();
    }
  }

  isFarsi(): boolean {
    return this.componentConfig().locale === 'fa';
  }
}
