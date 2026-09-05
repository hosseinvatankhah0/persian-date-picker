import {ECalendarValue} from '../common/types/calendar-value-enum';
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
export class MonthCalendarComponent implements OnInit, ControlValueAccessor, Validator {
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

  componentConfig = computed(() => this.monthCalendarService.getConfig(this.config() || {}));
  yearMonths = computed(() => this.monthCalendarService.generateYear(this.componentConfig(), this.currentDateView(), this.selected()));

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

  init() {
    const config = this.componentConfig();
    const currentView = this.currentDateView();
    const selected = this.selected();

    const nextView = this.displayDate()
      ? this.displayDate()!.clone()
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
    if (value) {
      const config = this.componentConfig();
      const selectedArr = this.utilsService.convertToMomentArray(
        value,
        config.format || 'MMMM-YYYY',
        !!config.allowMultiSelect,
        config.locale || 'fa'
      );
      this.selected.set(selectedArr);
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
    this.onChangeCallback(this.processOnChangeCallback(this.selected()));
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
    if (month.selected && !this.componentConfig().unSelectOnClick) {
      return;
    }

    const nextSelected = this.utilsService.updateSelected(!!this.componentConfig().allowMultiSelect, this.selected(), month, 'month');
    this.selected.set(nextSelected);
    this.onSelect.emit(month);
  }

  onLeftNavClick() {
    const from = this.currentDateView().clone();
    this.currentDateView.set(this.currentDateView().clone().subtract(1, 'year'));
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
    this.currentDateView.set(this.currentDateView().clone().add(1, 'year'));
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
    this.onNavHeaderBtnClick.emit();
  }

  getMonthBtnCssClass(month: IMonth): { [klass: string]: boolean } {
    const cssClass: { [klass: string]: boolean } = {
      'dp-selected': !!month.selected,
      'dp-current-month': !!month.currentMonth
    };
    const customCssClass: string = this.monthCalendarService.getMonthBtnCssClass(this.componentConfig(), month.date);

    if (customCssClass) {
      cssClass[customCssClass] = true;
    }

    return cssClass;
  }

  goToCurrent() {
    this.currentDateView.set(moment().locale(this.componentConfig().locale || 'fa'));
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
