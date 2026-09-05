/* eslint-disable */
// @ts-nocheck
import {CalendarMode} from '../common/types/calendar-mode';
import {IDatePickerModalDirectiveConfig} from './date-picker-directive-config.model';
import {DatePickerModalDirectiveService} from './date-picker-directive.service';
import {IDpDayPickerApi} from './date-picker.api';
import {DatePickerModalComponent} from './date-picker.component';
import {
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Optional,
    Output,
    ViewContainerRef
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {CalendarValue} from '../common/types/calendar-value';
import {SingleCalendarValue} from '../common/types/single-calendar-value';
import {INavEvent} from '../common/models/navigation-event.model';
import {UtilsService} from '../common/services/utils/utils.service'

@Directive({
    exportAs: 'dpDayPicker',
    providers: [DatePickerModalDirectiveService],
    selector: '[dpDayPicker]'
})
export class DatePickerModalDirective implements OnInit {
    @Output() open = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();
    @Output() onChange = new EventEmitter<CalendarValue>();
    @Output() onGoToCurrent: EventEmitter<void> = new EventEmitter();
    @Output() onLeftNav: EventEmitter<INavEvent> = new EventEmitter();
    @Output() onRightNav: EventEmitter<INavEvent> = new EventEmitter();
    public datePickerModal: DatePickerModalComponent;
    public api: IDpDayPickerApi;

    constructor(public viewContainerRef: ViewContainerRef,
                public elemRef: ElementRef,
                public service: DatePickerModalDirectiveService,
                @Optional() public formControl: NgControl,
                public utilsService: UtilsService) {
    }

    private _config: IDatePickerModalDirectiveConfig;

    get config(): IDatePickerModalDirectiveConfig {
        return this._config;
    }

    @Input('dpDayPicker') set config(config: IDatePickerModalDirectiveConfig) {
        this._config = this.service.getConfig(config, this.viewContainerRef.element, this.attachTo);
        this.updateDatepickerConfig();
        this.markForCheck();
    }

    private _attachTo: ElementRef | string;

    get attachTo(): ElementRef | string {
        return this._attachTo;
    }

    @Input() set attachTo(attachTo: ElementRef | string) {
        this._attachTo = attachTo;
        this._config = this.service.getConfig(this.config, this.viewContainerRef.element, this.attachTo);
        this.updateDatepickerConfig();
        this.markForCheck();
    }

    private _theme: string;

    get theme(): string {
        return this._theme;
    }

    @Input() set theme(theme: string) {
        this._theme = theme;
        if (this.datePickerModal) {
            this.datePickerModal.theme = theme;
        }

        this.markForCheck();
    }

    private _mode: CalendarMode = 'day';

    get mode(): CalendarMode {
        return this._mode;
    }

    @Input() set mode(mode: CalendarMode) {
        this._mode = mode;
        if (this.datePickerModal) {
            this.datePickerModal.mode = mode;
        }

        this.markForCheck();
    }

    private _minDate: SingleCalendarValue;

    get minDate(): SingleCalendarValue {
        return this._minDate;
    }

    @Input() set minDate(minDate: SingleCalendarValue) {
        this._minDate = minDate;
        if (this.datePickerModal) {
            this.datePickerModal.minDate = minDate;
            this.datePickerModal.ngOnInit();
        }

        this.markForCheck();
    }

    private _maxDate: SingleCalendarValue;

    get maxDate(): SingleCalendarValue {
        return this._maxDate;
    }

    @Input() set maxDate(maxDate: SingleCalendarValue) {
        this._maxDate = maxDate;
        if (this.datePickerModal) {
            this.datePickerModal.maxDate = maxDate;
            this.datePickerModal.ngOnInit();
        }

        this.markForCheck();
    }

    private _minTime: SingleCalendarValue;

    get minTime(): SingleCalendarValue {
        return this._minTime;
    }

    @Input() set minTime(minTime: SingleCalendarValue) {
        this._minTime = minTime;
        if (this.datePickerModal) {
            this.datePickerModal.minTime = minTime;
            this.datePickerModal.ngOnInit();
        }

        this.markForCheck();
    }

    private _maxTime: SingleCalendarValue;

    get maxTime(): SingleCalendarValue {
        return this._maxTime;
    }

    @Input() set maxTime(maxTime: SingleCalendarValue) {
        this._maxTime = maxTime;
        if (this.datePickerModal) {
            this.datePickerModal.maxTime = maxTime;
            this.datePickerModal.ngOnInit();
        }

        this.markForCheck();
    }

    private _displayDate: SingleCalendarValue;

    get displayDate(): SingleCalendarValue {
        return this._displayDate;
    }

    @Input() set displayDate(displayDate: SingleCalendarValue) {
        this._displayDate = displayDate;
        this.updateDatepickerConfig();

        this.markForCheck();
    }

    ngOnInit(): void {
        this.datePickerModal = this.createDatePickerModal();
        this.api = this.datePickerModal.api;
        this.updateDatepickerConfig();
        this.attachModelToDatePickerModal();
        this.datePickerModal.theme = this.theme;
    }

    createDatePickerModal(): DatePickerModalComponent {
        return this.viewContainerRef.createComponent(DatePickerModalComponent).instance;
    }

    attachModelToDatePickerModal() {
        if (!this.formControl) {
            return;
        }

        this.datePickerModal.onViewDateChange(this.formControl.value);

        this.formControl.valueChanges.subscribe((value) => {
            if (value !== this.datePickerModal.inputElementValue) {
                const strVal = this.utilsService.convertToString(value, this.datePickerModal.componentConfig.format,
                    this.datePickerModal.componentConfig.locale);
                this.datePickerModal.onViewDateChange(strVal);
            }
        });

        let setup = true;

        this.datePickerModal.registerOnChange((value, changedByInput) => {
            if (value) {
                const isMultiselectEmpty = setup && Array.isArray(value) && !value.length;

                if (!isMultiselectEmpty && !changedByInput) {
                    this.formControl.control.setValue(this.datePickerModal.inputElementValue);
                }
            }

            const errors = this.datePickerModal.validateFn(value);

            if (!setup) {
                this.formControl.control.markAsDirty({
                    onlySelf: true
                });
            } else {
                setup = false;
            }

            if (errors) {
                if (errors.hasOwnProperty('format')) {
                    const {given} = errors['format'];
                    this.datePickerModal.inputElementValue = given;
                    if (!changedByInput) {
                        this.formControl.control.setValue(given);
                    }
                }

                this.formControl.control.setErrors(errors);
            }
        });
    }

    @HostListener('click', ['$event'])
    onClick(event?: Event) {
        this.datePickerModal.onClick();
    }

    @HostListener('focus')
    onFocus() {
        this.datePickerModal.inputFocused();
    }

    markForCheck() {
        if (this.datePickerModal) {
            this.datePickerModal.cd.markForCheck();
        }
    }

    private updateDatepickerConfig() {
        if (this.datePickerModal) {
            this.datePickerModal.minDate = this.minDate;
            this.datePickerModal.maxDate = this.maxDate;
            this.datePickerModal.minTime = this.minTime;
            this.datePickerModal.maxTime = this.maxTime;
            this.datePickerModal.mode = this.mode || 'day';
            this.datePickerModal.displayDate = this.displayDate;
            this.datePickerModal.config = this.config;
            this.datePickerModal.open = this.open;
            this.datePickerModal.close = this.close;
            this.datePickerModal.onChange = this.onChange;
            this.datePickerModal.onGoToCurrent = this.onGoToCurrent;
            this.datePickerModal.onLeftNav = this.onLeftNav;
            this.datePickerModal.onRightNav = this.onRightNav;

            this.datePickerModal.init();

            if (this.datePickerModal.componentConfig.disableKeypress) {
                this.elemRef.nativeElement.setAttribute('readonly', true);
            } else {
                this.elemRef.nativeElement.removeAttribute('readonly');
            }
        }
    }
}
