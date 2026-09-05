import momentNs, { Moment, unitOfTime } from 'jalali-moment';
import * as ng2_jalali_date_picker_modal from 'ng2-jalali-date-picker-modal';
import * as _angular_core from '@angular/core';
import { OnInit, ChangeDetectorRef, OnChanges, EventEmitter, SimpleChanges, OnDestroy, ElementRef, Renderer2, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor, Validator, FormControl, ValidationErrors, NgControl } from '@angular/forms';

type SingleCalendarValue = Moment | string;

interface IDate {
    date: Moment;
    selected?: boolean;
}

declare enum ECalendarMode {
    Day = 0,
    DayTime = 1,
    Month = 2,
    Time = 3
}

interface IDay extends IDate {
    currentMonth?: boolean;
    prevMonth?: boolean;
    nextMonth?: boolean;
    currentDay?: boolean;
    disabled?: boolean;
}
interface IDayEvent {
    day: IDay;
    event: MouseEvent;
}

interface IMonth extends IDate {
    currentMonth: boolean;
    disabled: boolean;
    text: string;
}

declare enum ECalendarValue {
    Moment = 1,
    MomentArr = 2,
    String = 3,
    StringArr = 4
}

type CalendarValue = Moment | Moment[] | string | string[];

interface ICalendar {
    locale?: string;
    min?: SingleCalendarValue;
    max?: Moment | string;
}
interface ICalendarInternal {
    locale?: string;
    min?: Moment;
    max?: Moment;
}

type WeekDays = 'su' | 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa';

interface IConfig$3 {
    isDayDisabledCallback?: (date: Moment) => boolean;
    isMonthDisabledCallback?: (date: Moment) => boolean;
    weekDayFormat?: string;
    weekDayFormatter?: (dayIndex: number) => string;
    showNearMonthDays?: boolean;
    showWeekNumbers?: boolean;
    firstDayOfWeek?: WeekDays;
    format?: string;
    allowMultiSelect?: boolean;
    monthFormat?: string;
    monthFormatter?: (month: Moment) => string;
    enableMonthSelector?: boolean;
    yearFormat?: string;
    yearFormatter?: (year: Moment) => string;
    dayBtnFormat?: string;
    dayBtnFormatter?: (day: Moment) => string;
    dayBtnCssClassCallback?: (day: Moment) => string;
    monthBtnFormat?: string;
    monthBtnFormatter?: (day: Moment) => string;
    monthBtnCssClassCallback?: (day: Moment) => string;
    multipleYearsNavigateBy?: number;
    showMultipleYearsNavigation?: boolean;
    returnedValueType?: ECalendarValue;
    showGoToCurrent?: boolean;
    unSelectOnClick?: boolean;
}
interface IDayCalendarConfig extends IConfig$3, ICalendar {
}
interface IDayCalendarConfigInternal extends IConfig$3, ICalendarInternal {
}

type TOpens = 'right' | 'left';
type TDrops = 'up' | 'down';

interface IConfig$2 {
    isMonthDisabledCallback?: (date: Moment) => boolean;
    allowMultiSelect?: boolean;
    yearFormat?: string;
    yearFormatter?: (month: Moment) => string;
    format?: string;
    isNavHeaderBtnClickable?: boolean;
    monthBtnFormat?: string;
    monthBtnFormatter?: (day: Moment) => string;
    monthBtnCssClassCallback?: (day: Moment) => string;
    multipleYearsNavigateBy?: number;
    showMultipleYearsNavigation?: boolean;
    locale?: string;
    returnedValueType?: ECalendarValue;
    showGoToCurrent?: boolean;
    unSelectOnClick?: boolean;
}
interface IMonthCalendarConfig extends IConfig$2, ICalendar {
}
interface IMonthCalendarConfigInternal extends IConfig$2, ICalendarInternal {
}

interface IConfig$1 {
    hours12Format?: string;
    hours24Format?: string;
    maxTime?: Moment;
    meridiemFormat?: string;
    minTime?: Moment;
    minutesFormat?: string;
    minutesInterval?: number;
    secondsFormat?: string;
    secondsInterval?: number;
    showSeconds?: boolean;
    showTwentyFourHours?: boolean;
    timeSeparator?: string;
    returnedValueType?: ECalendarValue;
}
interface ITimeSelectConfig extends IConfig$1, ICalendar {
}
interface ITimeSelectConfigInternal extends IConfig$1, ICalendarInternal {
}

interface IConfig {
    closeOnSelect?: boolean;
    closeOnSelectDelay?: number;
    openOnFocus?: boolean;
    openOnClick?: boolean;
    onOpenDelay?: number;
    disableKeypress?: boolean;
    appendTo?: string | HTMLElement;
    inputElementContainer?: HTMLElement | string;
    drops?: TDrops;
    opens?: TOpens;
    hideInputContainer?: boolean;
    hideOnOutsideClick?: boolean;
}
interface IDatePickerModalConfig extends IConfig, IDayCalendarConfig, IMonthCalendarConfig, ITimeSelectConfig {
}
interface IDatePickerModalConfigInternal extends IConfig, IDayCalendarConfigInternal, IMonthCalendarConfigInternal, ITimeSelectConfigInternal {
}

interface IDatePickerModalDirectiveConfig extends IDayCalendarConfig, IMonthCalendarConfig, ITimeSelectConfig {
    closeOnSelect?: boolean;
    closeOnSelectDelay?: number;
    onOpenDelay?: number;
    disableKeypress?: boolean;
    appendTo?: string | HTMLElement;
    inputElementContainer?: HTMLElement;
    drops?: TDrops;
    opens?: TOpens;
    hideInputContainer?: boolean;
}

declare class DomHelper {
    private static setYAxisPosition;
    private static setXAxisPosition;
    private static isTopInView;
    private static isBottomInView;
    private static isLeftInView;
    private static isRightInView;
    appendElementToPosition(config: IAppendToArgs): void;
    setElementPositionAsModal({ element, container }: IAppendToArgs): void;
    setElementPosition({ element, container, anchor, dimElem, drops, opens }: IAppendToArgs): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DomHelper, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DomHelper>;
}
interface IAppendToArgs {
    container: HTMLElement;
    element: HTMLElement;
    anchor: HTMLElement;
    dimElem: HTMLElement;
    drops: TDrops;
    opens: TOpens;
}

type CalendarMode = 'day' | 'month' | 'daytime' | 'time';

type DateValidator = (inputVal: CalendarValue) => {
    [key: string]: any;
} | null;

interface DateLimits {
    minDate?: SingleCalendarValue;
    maxDate?: SingleCalendarValue;
    minTime?: SingleCalendarValue;
    maxTime?: SingleCalendarValue;
}
declare class UtilsService {
    static debounce(func: Function, wait: number): (this: any, ...args: any[]) => void;
    createArray(size: number): number[];
    convertToMoment(date: SingleCalendarValue | undefined, format?: string, locale?: string): Moment;
    isDateValid(date: string, format?: string, locale?: string): boolean;
    getDefaultDisplayDate(current: Moment, selected: Moment[], allowMultiSelect?: boolean, minDate?: Moment, locale?: string): Moment;
    getInputType(value: CalendarValue, allowMultiSelect?: boolean): ECalendarValue;
    convertToMomentArray(value: CalendarValue, format?: string, allowMultiSelect?: boolean, locale?: string): Moment[];
    convertFromMomentArray(format?: string, value?: Moment[], convertTo?: ECalendarValue, locale?: string): CalendarValue;
    convertToString(value: CalendarValue, format?: string, locale?: string): string;
    clearUndefined<T extends Record<string, any>>(obj: T): T;
    updateSelected(isMultiple: boolean, currentlySelected: Moment[], date: IDate, granularity?: unitOfTime.Base): Moment[];
    closestParent(element: HTMLElement | null, selector: string): HTMLElement | null;
    onlyTime(m: Moment): Moment;
    granularityFromType(calendarType: CalendarMode): unitOfTime.Base;
    createValidator({ minDate, maxDate, minTime, maxTime }: DateLimits, format?: string, calendarType?: CalendarMode, locale?: string): DateValidator;
    datesStringToStringArray(value: string): string[];
    getValidMomentArray(value: string, format?: string, locale?: string): Moment[];
    shouldShowCurrent(showGoToCurrent?: boolean, mode?: CalendarMode, min?: Moment, max?: Moment): boolean;
    isDateInRange(date: Moment, from?: Moment, to?: Moment): boolean;
    convertPropsToMoment(obj: {
        [key: string]: any;
    }, format?: string, props?: string[], locale?: string): void;
    shouldResetCurrentView<T extends ICalendarInternal>(prevConf: T, currentConf: T): boolean;
    getNativeElement(elem: HTMLElement | string): HTMLElement | null;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UtilsService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UtilsService>;
}

declare class DayCalendarService {
    private utilsService;
    readonly DEFAULT_CONFIG: IDayCalendarConfig;
    readonly GREGORIAN_CONFIG_EXTENTION: IDayCalendarConfig;
    private readonly DAYS;
    constructor(utilsService: UtilsService);
    getConfig(config: IDayCalendarConfig): IDayCalendarConfigInternal;
    generateDaysMap(firstDayOfWeek: WeekDays): {
        [key: string]: number;
    };
    generateMonthArray(config: IDayCalendarConfigInternal, month: Moment, selected: Moment[]): IDay[][];
    generateWeekdays(firstDayOfWeek: WeekDays, locale?: string): Moment[];
    isDateDisabled(date: Moment, config: IDayCalendarConfigInternal): boolean;
    getHeaderLabel(config: IDayCalendarConfigInternal, month: Moment): string;
    shouldShowLeft(min: Moment | undefined, currentMonthView: Moment): boolean;
    shouldShowRight(max: Moment | undefined, currentMonthView: Moment): boolean;
    generateDaysIndexMap(firstDayOfWeek: WeekDays): {
        [key: number]: string;
    };
    getMonthCalendarConfig(componentConfig: IDayCalendarConfigInternal): IMonthCalendarConfig;
    getDayBtnText(config: IDayCalendarConfigInternal, day: Moment): string;
    getDayBtnCssClass(config: IDayCalendarConfigInternal, day: Moment): string;
    private removeNearMonthWeeks;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DayCalendarService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DayCalendarService>;
}

interface INavEvent {
    from: Moment;
    to: Moment;
}

declare class DayCalendarComponent implements OnInit, ControlValueAccessor, Validator {
    readonly dayCalendarService: DayCalendarService;
    readonly utilsService: UtilsService;
    readonly cd: ChangeDetectorRef;
    config: _angular_core.InputSignal<IDayCalendarConfig | undefined>;
    displayDate: _angular_core.InputSignal<SingleCalendarValue | undefined>;
    minDate: _angular_core.InputSignal<momentNs.Moment | undefined>;
    maxDate: _angular_core.InputSignal<momentNs.Moment | undefined>;
    theme: _angular_core.InputSignal<string | undefined>;
    get themeClass(): string;
    onSelect: _angular_core.OutputEmitterRef<IDay>;
    onMonthSelect: _angular_core.OutputEmitterRef<IMonth>;
    onNavHeaderBtnClick: _angular_core.OutputEmitterRef<ECalendarMode>;
    onGoToCurrent: _angular_core.OutputEmitterRef<void>;
    onLeftNav: _angular_core.OutputEmitterRef<INavEvent>;
    onRightNav: _angular_core.OutputEmitterRef<INavEvent>;
    onLeftSecondaryNav: _angular_core.OutputEmitterRef<INavEvent>;
    onRightSecondaryNav: _angular_core.OutputEmitterRef<INavEvent>;
    CalendarMode: typeof ECalendarMode;
    isInited: _angular_core.WritableSignal<boolean>;
    currentCalendarMode: _angular_core.WritableSignal<ECalendarMode>;
    selected: _angular_core.WritableSignal<momentNs.Moment[]>;
    currentDateView: _angular_core.WritableSignal<momentNs.Moment>;
    componentConfig: _angular_core.Signal<IDayCalendarConfigInternal>;
    monthCalendarConfig: _angular_core.Signal<ng2_jalali_date_picker_modal.IMonthCalendarConfig>;
    weeks: _angular_core.Signal<IDay[][]>;
    weekdays: _angular_core.Signal<momentNs.Moment[]>;
    navLabel: _angular_core.Signal<string>;
    showLeftNav: _angular_core.Signal<boolean>;
    showRightNav: _angular_core.Signal<boolean>;
    shouldShowCurrent: _angular_core.Signal<boolean>;
    inputValue: CalendarValue;
    inputValueType: ECalendarValue;
    validateFn?: DateValidator;
    api: {
        moveCalendarsBy: (current: Moment, amount: number, granularity?: unitOfTime.Base) => void;
        moveCalendarTo: (to: SingleCalendarValue) => void;
        toggleCalendarMode: (mode: ECalendarMode) => void;
    };
    constructor(dayCalendarService: DayCalendarService, utilsService: UtilsService, cd: ChangeDetectorRef);
    ngOnInit(): void;
    init(): void;
    initValidators(): void;
    writeValue(value: CalendarValue): void;
    registerOnChange(fn: any): void;
    onChangeCallback(_: any): void;
    registerOnTouched(_fn: any): void;
    validate(formControl: FormControl): ValidationErrors | null;
    processOnChangeCallback(value: Moment[]): CalendarValue;
    dayClicked(day: IDay): void;
    getDayBtnText(day: IDay): string;
    getDayBtnCssClass(day: IDay): {
        [klass: string]: boolean;
    };
    onLeftNavClick(): void;
    onRightNavClick(): void;
    onMonthCalendarLeftClick(event: INavEvent): void;
    onMonthCalendarRightClick(event: INavEvent): void;
    onMonthCalendarSecondaryLeftClick(event: INavEvent): void;
    onMonthCalendarSecondaryRightClick(event: INavEvent): void;
    getWeekdayName(weekday: Moment): string;
    toggleCalendarMode(mode: ECalendarMode): void;
    monthSelected(month: IMonth): void;
    moveCalendarsBy(current: Moment, amount: number, granularity?: unitOfTime.Base): void;
    moveCalendarTo(to: SingleCalendarValue): void;
    goToCurrent(): void;
    isFarsi(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DayCalendarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DayCalendarComponent, "dp-day-calendar", never, { "config": { "alias": "config"; "required": false; "isSignal": true; }; "displayDate": { "alias": "displayDate"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "theme": { "alias": "theme"; "required": false; "isSignal": true; }; }, { "onSelect": "onSelect"; "onMonthSelect": "onMonthSelect"; "onNavHeaderBtnClick": "onNavHeaderBtnClick"; "onGoToCurrent": "onGoToCurrent"; "onLeftNav": "onLeftNav"; "onRightNav": "onRightNav"; "onLeftSecondaryNav": "onLeftSecondaryNav"; "onRightSecondaryNav": "onRightSecondaryNav"; }, never, never, true, never>;
}

interface IDayTimeCalendarConfig extends ITimeSelectConfig, IDayCalendarConfig {
}

type TimeUnit = 'hour' | 'minute' | 'second';
declare class TimeSelectService {
    private utilsService;
    readonly DEFAULT_CONFIG: ITimeSelectConfigInternal;
    constructor(utilsService: UtilsService);
    getConfig(config: ITimeSelectConfig): ITimeSelectConfigInternal;
    getTimeFormat(config: ITimeSelectConfigInternal): string;
    getHours(config: ITimeSelectConfigInternal, t: Moment | null): string;
    getMinutes(config: ITimeSelectConfigInternal, t: Moment | null): string;
    getSeconds(config: ITimeSelectConfigInternal, t: Moment | null): string;
    getMeridiem(config: ITimeSelectConfigInternal, time: Moment): string;
    decrease(config: ITimeSelectConfigInternal, time: Moment, unit: TimeUnit): Moment;
    increase(config: ITimeSelectConfigInternal, time: Moment, unit: TimeUnit): Moment;
    toggleMeridiem(time: Moment): Moment;
    shouldShowDecrease(config: ITimeSelectConfigInternal, time: Moment, unit: TimeUnit): boolean;
    shouldShowIncrease(config: ITimeSelectConfigInternal, time: Moment, unit: TimeUnit): boolean;
    shouldShowToggleMeridiem(config: ITimeSelectConfigInternal, time: Moment): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TimeSelectService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TimeSelectService>;
}

declare class DayTimeCalendarService {
    private utilsService;
    private dayCalendarService;
    private timeSelectService;
    readonly DEFAULT_CONFIG: IDayTimeCalendarConfig;
    constructor(utilsService: UtilsService, dayCalendarService: DayCalendarService, timeSelectService: TimeSelectService);
    getConfig(config: IDayTimeCalendarConfig): IDayTimeCalendarConfig;
    updateDay(current: Moment, day: Moment, config: IDayTimeCalendarConfig): Moment;
    updateTime(current: Moment, time: Moment): Moment;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DayTimeCalendarService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DayTimeCalendarService>;
}

declare class DayTimeCalendarComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {
    dayTimeCalendarService: DayTimeCalendarService;
    utilsService: UtilsService;
    cd: ChangeDetectorRef;
    config: IDayTimeCalendarConfig;
    displayDate: SingleCalendarValue;
    minDate: SingleCalendarValue;
    maxDate: SingleCalendarValue;
    theme: string;
    onChange: EventEmitter<IDate>;
    onGoToCurrent: EventEmitter<void>;
    onLeftNav: EventEmitter<INavEvent>;
    onRightNav: EventEmitter<INavEvent>;
    dayCalendarRef: DayCalendarComponent;
    isInited: boolean;
    componentConfig: IDayTimeCalendarConfig;
    inputValue: CalendarValue;
    inputValueType: ECalendarValue;
    validateFn: DateValidator;
    api: {
        moveCalendarTo: (to: SingleCalendarValue) => void;
    };
    constructor(dayTimeCalendarService: DayTimeCalendarService, utilsService: UtilsService, cd: ChangeDetectorRef);
    _selected: Moment;
    get selected(): Moment;
    set selected(selected: Moment);
    ngOnInit(): void;
    init(): void;
    ngOnChanges(changes: SimpleChanges): void;
    writeValue(value: CalendarValue): void;
    registerOnChange(fn: any): void;
    onChangeCallback(_: any): void;
    registerOnTouched(fn: any): void;
    validate(formControl: FormControl): ValidationErrors | any;
    processOnChangeCallback(value: Moment): CalendarValue;
    initValidators(): void;
    dateSelected(day: IDate): void;
    timeChange(time: IDate): void;
    emitChange(): void;
    moveCalendarTo(to: SingleCalendarValue): void;
    onLeftNavClick(change: INavEvent): void;
    onRightNavClick(change: INavEvent): void;
    timeConfirm(time: IDate): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DayTimeCalendarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DayTimeCalendarComponent, "dp-day-time-calendar", never, { "config": { "alias": "config"; "required": false; }; "displayDate": { "alias": "displayDate"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "theme": { "alias": "theme"; "required": false; }; }, { "onChange": "onChange"; "onGoToCurrent": "onGoToCurrent"; "onLeftNav": "onLeftNav"; "onRightNav": "onRightNav"; }, never, never, true, never>;
}

declare class TimeSelectComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {
    timeSelectService: TimeSelectService;
    utilsService: UtilsService;
    cd: ChangeDetectorRef;
    config: ITimeSelectConfig;
    displayDate: SingleCalendarValue;
    minDate: SingleCalendarValue;
    maxDate: SingleCalendarValue;
    minTime: SingleCalendarValue;
    maxTime: SingleCalendarValue;
    theme: string;
    onChange: EventEmitter<IDate>;
    onConfirm: EventEmitter<IDate>;
    isInited: boolean;
    componentConfig: ITimeSelectConfigInternal;
    inputValue: CalendarValue;
    inputValueType: ECalendarValue;
    validateFn: DateValidator;
    hours: string;
    minutes: string;
    seconds: string;
    meridiem: string;
    showDecHour: boolean;
    showDecMinute: boolean;
    showDecSecond: boolean;
    showIncHour: boolean;
    showIncMinute: boolean;
    showIncSecond: boolean;
    showToggleMeridiem: boolean;
    api: {
        triggerChange: () => void;
    };
    constructor(timeSelectService: TimeSelectService, utilsService: UtilsService, cd: ChangeDetectorRef);
    _selected: Moment;
    get selected(): Moment;
    set selected(selected: Moment);
    ngOnInit(): void;
    init(): void;
    ngOnChanges(changes: SimpleChanges): void;
    writeValue(value: CalendarValue): void;
    registerOnChange(fn: any): void;
    onChangeCallback(_: any): void;
    registerOnTouched(fn: any): void;
    validate(formControl: FormControl): ValidationErrors | any;
    processOnChangeCallback(value: Moment): CalendarValue;
    initValidators(): void;
    decrease(unit: TimeUnit): void;
    increase(unit: TimeUnit): void;
    toggleMeridiem(): void;
    emitChange(): void;
    calculateTimeParts(time: Moment): void;
    confirmSelection(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TimeSelectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TimeSelectComponent, "dp-time-select", never, { "config": { "alias": "config"; "required": false; }; "displayDate": { "alias": "displayDate"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "minTime": { "alias": "minTime"; "required": false; }; "maxTime": { "alias": "maxTime"; "required": false; }; "theme": { "alias": "theme"; "required": false; }; }, { "onChange": "onChange"; "onConfirm": "onConfirm"; }, never, never, true, never>;
}

interface IDpDayPickerApi {
    open: () => void;
    close: () => void;
    moveCalendarTo: (date: SingleCalendarValue) => void;
}

declare class DatePickerModalService {
    private utilsService;
    private timeSelectService;
    private daytimeCalendarService;
    readonly onPickerClosed: EventEmitter<null>;
    private defaultConfig;
    private gregorianExtensionConfig;
    constructor(utilsService: UtilsService, timeSelectService: TimeSelectService, daytimeCalendarService: DayTimeCalendarService);
    getConfig(config: IDatePickerModalConfig, mode?: CalendarMode): IDatePickerModalConfigInternal;
    getDayConfigService(pickerConfig: IDatePickerModalConfig): IDayCalendarConfig;
    getDayTimeConfigService(pickerConfig: IDatePickerModalConfig): ITimeSelectConfig;
    getTimeConfigService(pickerConfig: IDatePickerModalConfig): ITimeSelectConfig;
    pickerClosed(): void;
    isValidInputDateValue(value: string, config: IDatePickerModalConfig): boolean;
    convertInputValueToMomentArray(value: string, config: IDatePickerModalConfig): Moment[];
    private getDefaultFormatByMode;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DatePickerModalService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DatePickerModalService>;
}

declare class MonthCalendarService {
    private utilsService;
    readonly DEFAULT_CONFIG: IMonthCalendarConfigInternal;
    readonly GREGORIAN_DEFAULT_CONFIG: IMonthCalendarConfig;
    constructor(utilsService: UtilsService);
    getConfig(config: IMonthCalendarConfig): IMonthCalendarConfigInternal;
    generateYear(config: IMonthCalendarConfig, year: Moment, selected?: Moment[]): IMonth[][];
    isMonthDisabled(date: Moment, config: IMonthCalendarConfig): boolean;
    shouldShowLeft(min: Moment | undefined, currentMonthView: Moment): boolean;
    shouldShowRight(max: Moment | undefined, currentMonthView: Moment): boolean;
    getHeaderLabel(config: IMonthCalendarConfig, year: Moment): string;
    getMonthBtnText(config: IMonthCalendarConfig, month: Moment): string;
    getMonthBtnCssClass(config: IMonthCalendarConfig, month: Moment): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MonthCalendarService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<MonthCalendarService>;
}

declare class MonthCalendarComponent implements OnInit, ControlValueAccessor, Validator {
    readonly monthCalendarService: MonthCalendarService;
    readonly utilsService: UtilsService;
    readonly cd: ChangeDetectorRef;
    config: _angular_core.InputSignal<IMonthCalendarConfig | undefined>;
    displayDate: _angular_core.InputSignal<momentNs.Moment | undefined>;
    minDate: _angular_core.InputSignal<momentNs.Moment | undefined>;
    maxDate: _angular_core.InputSignal<momentNs.Moment | undefined>;
    theme: _angular_core.InputSignal<string | undefined>;
    get themeClass(): string;
    onSelect: _angular_core.OutputEmitterRef<IMonth>;
    onNavHeaderBtnClick: _angular_core.OutputEmitterRef<void>;
    onGoToCurrent: _angular_core.OutputEmitterRef<void>;
    onLeftNav: _angular_core.OutputEmitterRef<INavEvent>;
    onRightNav: _angular_core.OutputEmitterRef<INavEvent>;
    onLeftSecondaryNav: _angular_core.OutputEmitterRef<INavEvent>;
    onRightSecondaryNav: _angular_core.OutputEmitterRef<INavEvent>;
    isInited: _angular_core.WritableSignal<boolean>;
    selected: _angular_core.WritableSignal<momentNs.Moment[]>;
    currentDateView: _angular_core.WritableSignal<momentNs.Moment>;
    componentConfig: _angular_core.Signal<IMonthCalendarConfigInternal>;
    yearMonths: _angular_core.Signal<IMonth[][]>;
    navLabel: _angular_core.Signal<string>;
    showLeftNav: _angular_core.Signal<boolean>;
    showRightNav: _angular_core.Signal<boolean>;
    showSecondaryLeftNav: _angular_core.Signal<boolean>;
    showSecondaryRightNav: _angular_core.Signal<boolean>;
    shouldShowCurrent: _angular_core.Signal<boolean>;
    inputValue: CalendarValue;
    inputValueType: ECalendarValue;
    validateFn?: DateValidator;
    api: {
        toggleCalendar: () => void;
        moveCalendarTo: (to: SingleCalendarValue) => void;
    };
    constructor(monthCalendarService: MonthCalendarService, utilsService: UtilsService, cd: ChangeDetectorRef);
    ngOnInit(): void;
    init(): void;
    writeValue(value: CalendarValue): void;
    registerOnChange(fn: any): void;
    onChangeCallback(_: any): void;
    registerOnTouched(_fn: any): void;
    validate(formControl: FormControl): ValidationErrors | null;
    initValidators(): void;
    processOnChangeCallback(value: Moment[]): CalendarValue;
    monthClicked(month: IMonth): void;
    onLeftNavClick(): void;
    onLeftSecondaryNavClick(): void;
    onRightNavClick(): void;
    onRightSecondaryNavClick(): void;
    toggleCalendarMode(): void;
    getMonthBtnCssClass(month: IMonth): {
        [klass: string]: boolean;
    };
    goToCurrent(): void;
    moveCalendarTo(to: SingleCalendarValue): void;
    isFarsi(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MonthCalendarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<MonthCalendarComponent, "dp-month-calendar", never, { "config": { "alias": "config"; "required": false; "isSignal": true; }; "displayDate": { "alias": "displayDate"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "theme": { "alias": "theme"; "required": false; "isSignal": true; }; }, { "onSelect": "onSelect"; "onNavHeaderBtnClick": "onNavHeaderBtnClick"; "onGoToCurrent": "onGoToCurrent"; "onLeftNav": "onLeftNav"; "onRightNav": "onRightNav"; "onLeftSecondaryNav": "onLeftSecondaryNav"; "onRightSecondaryNav": "onRightSecondaryNav"; }, never, never, true, never>;
}

declare class DatePickerModalComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {
    private readonly dayPickerService;
    private readonly domHelper;
    private readonly elemRef;
    private readonly renderer;
    private readonly utilsService;
    readonly cd: ChangeDetectorRef;
    config: _angular_core.InputSignal<IDatePickerModalConfig | undefined>;
    mode: _angular_core.InputSignal<CalendarMode>;
    placeholder: _angular_core.InputSignal<string>;
    fontSize: _angular_core.InputSignal<number>;
    disabled: _angular_core.InputSignal<boolean>;
    displayDate: _angular_core.InputSignal<any>;
    theme: _angular_core.InputSignal<string>;
    minDate: _angular_core.InputSignal<any>;
    maxDate: _angular_core.InputSignal<any>;
    minTime: _angular_core.InputSignal<SingleCalendarValue | undefined>;
    maxTime: _angular_core.InputSignal<SingleCalendarValue | undefined>;
    get themeClass(): string;
    onOpen: _angular_core.OutputEmitterRef<void>;
    onClose: _angular_core.OutputEmitterRef<void>;
    onChange: _angular_core.OutputEmitterRef<CalendarValue>;
    onGoToCurrent: _angular_core.OutputEmitterRef<void>;
    onLeftNav: _angular_core.OutputEmitterRef<INavEvent>;
    onRightNav: _angular_core.OutputEmitterRef<INavEvent>;
    calendarContainer: _angular_core.Signal<ElementRef<any> | undefined>;
    dayCalendarRef: _angular_core.Signal<DayCalendarComponent | undefined>;
    monthCalendarRef: _angular_core.Signal<MonthCalendarComponent | undefined>;
    dayTimeCalendarRef: _angular_core.Signal<DayTimeCalendarComponent | undefined>;
    timeSelectRef: _angular_core.Signal<TimeSelectComponent | undefined>;
    inputElementLabel: _angular_core.Signal<ElementRef<any> | undefined>;
    isInitialized: _angular_core.WritableSignal<boolean>;
    isModalOpen: _angular_core.WritableSignal<boolean>;
    inputElementValue: _angular_core.WritableSignal<string>;
    selected: _angular_core.WritableSignal<momentNs.Moment[]>;
    currentDateView: _angular_core.WritableSignal<momentNs.Moment>;
    showMinDateIsNotValid: _angular_core.WritableSignal<boolean>;
    showMaxDateIsNotValid: _angular_core.WritableSignal<boolean>;
    componentConfig: _angular_core.Signal<IDatePickerModalConfigInternal>;
    dayCalendarConfig: _angular_core.Signal<ng2_jalali_date_picker_modal.IDayCalendarConfig>;
    dayTimeCalendarConfig: _angular_core.Signal<ITimeSelectConfig>;
    timeSelectConfig: _angular_core.Signal<ITimeSelectConfig>;
    inputValue: CalendarValue;
    inputValueType: ECalendarValue;
    isFocusedTrigger: boolean;
    hideStateHelper: boolean;
    calendarWrapper?: HTMLElement;
    appendToElement?: HTMLElement;
    inputElementContainer?: HTMLElement;
    popupElem?: HTMLElement;
    handleInnerElementClickUnlisteners: Function[];
    globalListnersUnlisteners: Function[];
    validateFn?: DateValidator;
    api: IDpDayPickerApi;
    constructor(dayPickerService: DatePickerModalService, domHelper: DomHelper, elemRef: ElementRef, renderer: Renderer2, utilsService: UtilsService, cd: ChangeDetectorRef);
    ngOnInit(): void;
    init(): void;
    initValidators(): void;
    writeValue(value: CalendarValue): void;
    updateInputElementValue(selected: Moment[]): void;
    registerOnChange(fn: any): void;
    onChangeCallback(_: any, _changedByInput: boolean): void;
    registerOnTouched(_fn: any): void;
    validate(formControl: FormControl): ValidationErrors | null;
    processOnChangeCallback(selected: Moment[] | string): CalendarValue;
    onClick(event?: Event): void;
    inputFocused(): void;
    showCalendars(): void;
    hideCalendar(): void;
    onViewDateChange(value: CalendarValue): void;
    handleInvalidDate(isMin: boolean): void;
    get minDateIsValid(): boolean;
    get maxDateIsValid(): boolean;
    dateSelected(date: IDate, granularity: unitOfTime.Base, _ignoreClose?: boolean): void;
    onDateClick(): Promise<void>;
    checkClass(): Promise<boolean>;
    onKeyPress(event: KeyboardEvent): void;
    moveCalendarTo(date: SingleCalendarValue): void;
    onLeftNavClick(change: INavEvent): void;
    onRightNavClick(change: INavEvent): void;
    closeModal(): void;
    transformToJalali(value: any, toFormat?: string): string;
    ngOnDestroy(): void;
    private stopGlobalListeners;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DatePickerModalComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DatePickerModalComponent, "dp-date-picker-modal", never, { "config": { "alias": "config"; "required": false; "isSignal": true; }; "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "fontSize": { "alias": "fontSize"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "displayDate": { "alias": "displayDate"; "required": false; "isSignal": true; }; "theme": { "alias": "theme"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "minTime": { "alias": "minTime"; "required": false; "isSignal": true; }; "maxTime": { "alias": "maxTime"; "required": false; "isSignal": true; }; }, { "onOpen": "open"; "onClose": "close"; "onChange": "onChange"; "onGoToCurrent": "onGoToCurrent"; "onLeftNav": "onLeftNav"; "onRightNav": "onRightNav"; }, never, never, true, never>;
}

declare class DatePickerModalDirectiveService {
    utilsService: UtilsService;
    constructor(utilsService: UtilsService);
    convertToHTMLElement(attachTo: ElementRef | string, baseElement: HTMLElement): HTMLElement;
    getConfig(config?: IDatePickerModalDirectiveConfig, baseElement?: ElementRef, attachTo?: ElementRef | string): IDatePickerModalDirectiveConfig;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DatePickerModalDirectiveService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DatePickerModalDirectiveService>;
}

declare class DatePickerModalDirective implements OnInit {
    viewContainerRef: ViewContainerRef;
    elemRef: ElementRef;
    service: DatePickerModalDirectiveService;
    formControl: NgControl;
    utilsService: UtilsService;
    open: EventEmitter<void>;
    close: EventEmitter<void>;
    onChange: EventEmitter<CalendarValue>;
    onGoToCurrent: EventEmitter<void>;
    onLeftNav: EventEmitter<INavEvent>;
    onRightNav: EventEmitter<INavEvent>;
    datePickerModal: DatePickerModalComponent;
    api: IDpDayPickerApi;
    constructor(viewContainerRef: ViewContainerRef, elemRef: ElementRef, service: DatePickerModalDirectiveService, formControl: NgControl, utilsService: UtilsService);
    private _config;
    get config(): IDatePickerModalDirectiveConfig;
    set config(config: IDatePickerModalDirectiveConfig);
    private _attachTo;
    get attachTo(): ElementRef | string;
    set attachTo(attachTo: ElementRef | string);
    private _theme;
    get theme(): string;
    set theme(theme: string);
    private _mode;
    get mode(): CalendarMode;
    set mode(mode: CalendarMode);
    private _minDate;
    get minDate(): SingleCalendarValue;
    set minDate(minDate: SingleCalendarValue);
    private _maxDate;
    get maxDate(): SingleCalendarValue;
    set maxDate(maxDate: SingleCalendarValue);
    private _minTime;
    get minTime(): SingleCalendarValue;
    set minTime(minTime: SingleCalendarValue);
    private _maxTime;
    get maxTime(): SingleCalendarValue;
    set maxTime(maxTime: SingleCalendarValue);
    private _displayDate;
    get displayDate(): SingleCalendarValue;
    set displayDate(displayDate: SingleCalendarValue);
    ngOnInit(): void;
    createDatePickerModal(): DatePickerModalComponent;
    attachModelToDatePickerModal(): void;
    onClick(event?: Event): void;
    onFocus(): void;
    markForCheck(): void;
    private updateDatepickerConfig;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DatePickerModalDirective, [null, null, null, { optional: true; }, null]>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<DatePickerModalDirective, "[dpDayPicker]", ["dpDayPicker"], { "config": { "alias": "dpDayPicker"; "required": false; }; "attachTo": { "alias": "attachTo"; "required": false; }; "theme": { "alias": "theme"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "minTime": { "alias": "minTime"; "required": false; }; "maxTime": { "alias": "maxTime"; "required": false; }; "displayDate": { "alias": "displayDate"; "required": false; }; }, { "open": "open"; "close": "close"; "onChange": "onChange"; "onGoToCurrent": "onGoToCurrent"; "onLeftNav": "onLeftNav"; "onRightNav": "onRightNav"; }, never, never, true, never>;
}

declare class CalendarNavComponent {
    label: _angular_core.InputSignal<string>;
    isLabelClickable: _angular_core.InputSignal<boolean>;
    showLeftNav: _angular_core.InputSignal<boolean>;
    showLeftSecondaryNav: _angular_core.InputSignal<boolean>;
    showRightNav: _angular_core.InputSignal<boolean>;
    showRightSecondaryNav: _angular_core.InputSignal<boolean>;
    leftNavDisabled: _angular_core.InputSignal<boolean>;
    leftSecondaryNavDisabled: _angular_core.InputSignal<boolean>;
    rightNavDisabled: _angular_core.InputSignal<boolean>;
    rightSecondaryNavDisabled: _angular_core.InputSignal<boolean>;
    showGoToCurrent: _angular_core.InputSignal<boolean>;
    theme: _angular_core.InputSignal<string>;
    get themeClass(): string;
    onLeftNav: _angular_core.OutputEmitterRef<void>;
    onLeftSecondaryNav: _angular_core.OutputEmitterRef<void>;
    onRightNav: _angular_core.OutputEmitterRef<void>;
    onRightSecondaryNav: _angular_core.OutputEmitterRef<void>;
    onLabelClick: _angular_core.OutputEmitterRef<void>;
    onGoToCurrent: _angular_core.OutputEmitterRef<void>;
    leftNavClicked(): void;
    leftSecondaryNavClicked(): void;
    rightNavClicked(): void;
    rightSecondaryNavClicked(): void;
    labelClicked(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CalendarNavComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CalendarNavComponent, "dp-calendar-nav", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "isLabelClickable": { "alias": "isLabelClickable"; "required": false; "isSignal": true; }; "showLeftNav": { "alias": "showLeftNav"; "required": false; "isSignal": true; }; "showLeftSecondaryNav": { "alias": "showLeftSecondaryNav"; "required": false; "isSignal": true; }; "showRightNav": { "alias": "showRightNav"; "required": false; "isSignal": true; }; "showRightSecondaryNav": { "alias": "showRightSecondaryNav"; "required": false; "isSignal": true; }; "leftNavDisabled": { "alias": "leftNavDisabled"; "required": false; "isSignal": true; }; "leftSecondaryNavDisabled": { "alias": "leftSecondaryNavDisabled"; "required": false; "isSignal": true; }; "rightNavDisabled": { "alias": "rightNavDisabled"; "required": false; "isSignal": true; }; "rightSecondaryNavDisabled": { "alias": "rightSecondaryNavDisabled"; "required": false; "isSignal": true; }; "showGoToCurrent": { "alias": "showGoToCurrent"; "required": false; "isSignal": true; }; "theme": { "alias": "theme"; "required": false; "isSignal": true; }; }, { "onLeftNav": "onLeftNav"; "onLeftSecondaryNav": "onLeftSecondaryNav"; "onRightNav": "onRightNav"; "onRightSecondaryNav": "onRightSecondaryNav"; "onLabelClick": "onLabelClick"; "onGoToCurrent": "onGoToCurrent"; }, never, never, true, never>;
}

export { CalendarNavComponent, DatePickerModalComponent, DatePickerModalDirective, DayCalendarComponent, DayTimeCalendarComponent, ECalendarMode, ECalendarValue, MonthCalendarComponent, TimeSelectComponent };
export type { CalendarValue, IDate, IDatePickerModalConfig, IDatePickerModalDirectiveConfig, IDay, IDayCalendarConfig, IDayEvent, IMonth, IMonthCalendarConfig, SingleCalendarValue };
//# sourceMappingURL=ng2-jalali-date-picker-modal.d.ts.map
