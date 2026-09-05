import momentNs from 'jalali-moment';
import * as i0 from '@angular/core';
import { Injectable, input, output, HostBinding, ChangeDetectionStrategy, ViewEncapsulation, Component, signal, computed, forwardRef, EventEmitter, Output, Input, ViewChild, viewChild, HostListener, Optional, Directive } from '@angular/core';
import * as i5 from '@angular/forms';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormsModule } from '@angular/forms';
import * as i3 from '@angular/common';
import { CommonModule, NgClass, NgIf } from '@angular/common';

var ECalendarMode;
(function (ECalendarMode) {
    ECalendarMode[ECalendarMode["Day"] = 0] = "Day";
    ECalendarMode[ECalendarMode["DayTime"] = 1] = "DayTime";
    ECalendarMode[ECalendarMode["Month"] = 2] = "Month";
    ECalendarMode[ECalendarMode["Time"] = 3] = "Time";
})(ECalendarMode || (ECalendarMode = {}));

var ECalendarValue;
(function (ECalendarValue) {
    ECalendarValue[ECalendarValue["Moment"] = 1] = "Moment";
    ECalendarValue[ECalendarValue["MomentArr"] = 2] = "MomentArr";
    ECalendarValue[ECalendarValue["String"] = 3] = "String";
    ECalendarValue[ECalendarValue["StringArr"] = 4] = "StringArr";
})(ECalendarValue || (ECalendarValue = {}));

class DomHelper {
    static setYAxisPosition(element, container, anchor, drops) {
        const anchorRect = anchor.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const bottom = anchorRect.bottom - containerRect.top;
        const top = anchorRect.top - containerRect.top;
        if (drops === 'down') {
            element.style.top = (bottom + 1 + 'px');
        }
        else {
            element.style.top = (top - 1 - element.scrollHeight) + 'px';
        }
    }
    static setXAxisPosition(element, container, anchor, dimElem, opens) {
        const anchorRect = anchor.getBoundingClientRect();
        const rightPadding = window.innerWidth - anchorRect.right;
        const leftPadding = anchorRect.left;
        const offset = dimElem.offsetWidth / 2 - anchor.offsetWidth / 2;
        element.style.zIndex = '999999999999999';
        if (rightPadding < dimElem.offsetWidth && anchor.offsetWidth <= dimElem.offsetWidth) {
            element.style.left = `calc(50% - ${offset}px)`;
            element.style.transform = 'translateX(-50%)';
        }
        else if (leftPadding < dimElem.offsetWidth && anchor.offsetWidth <= dimElem.offsetWidth) {
            element.style.transform = 'translateX(+50%)';
            element.style.right = `calc(50% - ${offset}px)`;
        }
        else {
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
        }
    }
    static isTopInView(el) {
        const { top } = el.getBoundingClientRect();
        return (top >= 0);
    }
    static isBottomInView(el) {
        const { bottom } = el.getBoundingClientRect();
        return (bottom <= window.innerHeight);
    }
    static isLeftInView(el) {
        const { left } = el.getBoundingClientRect();
        return (left >= 0);
    }
    static isRightInView(el) {
        const { right } = el.getBoundingClientRect();
        return (right <= window.innerWidth);
    }
    appendElementToPosition(config) {
        const { container, element } = config;
        // Ensure the container is positioned relatively
        if (!container.style.position || container.style.position === 'static') {
            container.style.position = 'relative';
        }
        // Set the element to be positioned absolutely
        if (element.style.position !== 'absolute') {
            element.style.position = 'absolute';
        }
        // Hide the element initially
        element.style.visibility = 'hidden';
        setTimeout(() => {
            this.setElementPositionAsModal(config);
            element.style.visibility = 'visible';
        });
    }
    setElementPositionAsModal({ element, container }) {
        // Center the modal on the screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;
        // Calculate the top and left positions to center the modal
        const top = (windowHeight - elementHeight) / 2;
        const left = (windowWidth - elementWidth) / 2;
        // Apply the calculated positions
        element.style.top = `${top}px`;
        element.style.left = `${left}px`;
        // Ensure the modal is above other content
        element.style.zIndex = '999999999999999';
    }
    setElementPosition({ element, container, anchor, dimElem, drops, opens }) {
        DomHelper.setYAxisPosition(element, container, anchor, 'down');
        DomHelper.setXAxisPosition(element, container, anchor, dimElem, 'right');
        if (drops !== 'down' && drops !== 'up') {
            if (DomHelper.isBottomInView(dimElem)) {
                DomHelper.setYAxisPosition(element, container, anchor, 'down');
            }
            else if (DomHelper.isTopInView(dimElem)) {
                DomHelper.setYAxisPosition(element, container, anchor, 'up');
            }
        }
        else {
            DomHelper.setYAxisPosition(element, container, anchor, drops);
        }
        if (opens !== 'left' && opens !== 'right') {
            if (DomHelper.isRightInView(dimElem)) {
                DomHelper.setXAxisPosition(element, container, anchor, dimElem, 'right');
            }
            else if (DomHelper.isLeftInView(dimElem)) {
                DomHelper.setXAxisPosition(element, container, anchor, dimElem, 'left');
            }
        }
        else {
            DomHelper.setXAxisPosition(element, container, anchor, dimElem, opens);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DomHelper, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DomHelper }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DomHelper, decorators: [{
            type: Injectable
        }] });

const moment$9 = momentNs;
class UtilsService {
    static debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    }
    createArray(size) {
        return new Array(size).fill(1);
    }
    convertToMoment(date, format, locale) {
        let m = null;
        if (!date) {
            m = null;
        }
        else if (typeof date === 'string') {
            m = moment$9(date, format);
        }
        else {
            m = date.clone();
        }
        if (m && locale) {
            m.locale(locale);
        }
        return m;
    }
    isDateValid(date, format, locale) {
        if (date === '') {
            return true;
        }
        return moment$9.from(date, locale || 'fa', format).isValid();
    }
    getDefaultDisplayDate(current, selected, allowMultiSelect, minDate, locale) {
        let m = moment$9();
        if (current) {
            m = current.clone();
        }
        else if (minDate && minDate.isAfter(moment$9())) {
            m = minDate.clone();
        }
        else if (allowMultiSelect) {
            if (selected && selected.length && selected[selected.length - 1]) {
                m = selected[selected.length - 1].clone();
            }
        }
        else if (selected && selected[0]) {
            m = selected[0].clone();
        }
        if (locale) {
            m.locale(locale);
        }
        return m;
    }
    getInputType(value, allowMultiSelect) {
        if (Array.isArray(value)) {
            if (!value.length) {
                return ECalendarValue.MomentArr;
            }
            else if (typeof value[0] === 'string') {
                return ECalendarValue.StringArr;
            }
            else if (moment$9.isMoment(value[0])) {
                return ECalendarValue.MomentArr;
            }
        }
        else {
            if (typeof value === 'string') {
                return ECalendarValue.String;
            }
            else if (moment$9.isMoment(value)) {
                return ECalendarValue.Moment;
            }
        }
        return allowMultiSelect ? ECalendarValue.MomentArr : ECalendarValue.Moment;
    }
    convertToMomentArray(value, format, allowMultiSelect, locale) {
        const loc = locale || 'fa';
        switch (this.getInputType(value, allowMultiSelect)) {
            case (ECalendarValue.String):
                return value ? [moment$9(value, format, true).locale(loc)] : [];
            case (ECalendarValue.StringArr):
                return value.map(v => v ? moment$9(v, format, true).locale(loc) : null).filter((v) => Boolean(v));
            case (ECalendarValue.Moment):
                return value ? [value.clone().locale(loc)] : [];
            case (ECalendarValue.MomentArr):
                return (value || []).map(v => v.clone().locale(loc));
            default:
                return [];
        }
    }
    convertFromMomentArray(format, value = [], convertTo = ECalendarValue.MomentArr, locale) {
        const loc = locale || 'fa';
        const fmt = format || 'YYYY-MM-DD';
        switch (convertTo) {
            case (ECalendarValue.String):
                return value[0] ? value[0].locale(loc).format(fmt) : '';
            case (ECalendarValue.StringArr):
                return value.filter(Boolean).map(v => v.locale(loc).format(fmt));
            case (ECalendarValue.Moment):
                return value[0] ? value[0].clone().locale(loc) : '';
            case (ECalendarValue.MomentArr):
                return value ? value.map(v => v.clone().locale(loc)) : [];
            default:
                return value;
        }
    }
    convertToString(value, format, locale) {
        let tmpVal;
        if (typeof value === 'string') {
            tmpVal = [value];
        }
        else if (Array.isArray(value)) {
            if (value.length) {
                tmpVal = value.map((v) => {
                    return this.convertToMoment(v, format, locale).format(format);
                });
            }
            else {
                tmpVal = value;
            }
        }
        else if (moment$9.isMoment(value)) {
            tmpVal = [value.format(format)];
        }
        else {
            return '';
        }
        return tmpVal.filter(Boolean).join(' | ');
    }
    clearUndefined(obj) {
        if (!obj) {
            return obj;
        }
        Object.keys(obj).forEach((key) => (obj[key] === undefined) && delete obj[key]);
        return obj;
    }
    updateSelected(isMultiple, currentlySelected, date, granularity = 'day') {
        const isSelected = !date.selected;
        if (isMultiple) {
            return isSelected
                ? currentlySelected.concat([date.date])
                : currentlySelected.filter(d => !d.isSame(date.date, granularity));
        }
        else {
            return isSelected ? [date.date] : [];
        }
    }
    closestParent(element, selector) {
        if (!element) {
            return null;
        }
        const match = element.querySelector(selector);
        return match || this.closestParent(element.parentElement, selector);
    }
    onlyTime(m) {
        return m && moment$9.isMoment(m) ? moment$9(m.format('HH:mm:ss'), 'HH:mm:ss') : m;
    }
    granularityFromType(calendarType) {
        switch (calendarType) {
            case 'time':
                return 'second';
            case 'daytime':
                return 'second';
            default:
                return calendarType;
        }
    }
    createValidator({ minDate, maxDate, minTime, maxTime }, format = 'YYYY-MM-DD', calendarType = 'day', locale = 'fa') {
        let isValid;
        let value;
        const validators = [];
        const granularity = this.granularityFromType(calendarType);
        if (minDate) {
            const md = this.convertToMoment(minDate, format, locale);
            validators.push({
                key: 'minDate',
                isValid: () => {
                    const _isValid = value.every(val => val.isSameOrAfter(md, granularity));
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        if (maxDate) {
            const md = this.convertToMoment(maxDate, format, locale);
            validators.push({
                key: 'maxDate',
                isValid: () => {
                    const _isValid = value.every(val => val.isSameOrBefore(md, granularity));
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        if (minTime) {
            const md = this.onlyTime(this.convertToMoment(minTime, format, locale));
            validators.push({
                key: 'minTime',
                isValid: () => {
                    const _isValid = value.every(val => this.onlyTime(val).isSameOrAfter(md));
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        if (maxTime) {
            const md = this.onlyTime(this.convertToMoment(maxTime, format, locale));
            validators.push({
                key: 'maxTime',
                isValid: () => {
                    const _isValid = value.every(val => this.onlyTime(val).isSameOrBefore(md));
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        return (inputVal) => {
            isValid = true;
            value = this.convertToMomentArray(inputVal, format, true, locale).filter(Boolean);
            if (!value.every(val => val.isValid())) {
                return {
                    format: {
                        given: inputVal
                    }
                };
            }
            const errors = validators.reduce((map, err) => {
                if (!err.isValid()) {
                    map[err.key] = {
                        given: value
                    };
                }
                return map;
            }, {});
            return !isValid ? errors : null;
        };
    }
    datesStringToStringArray(value) {
        return (value || '').split('|').map(m => m.trim()).filter(Boolean);
    }
    getValidMomentArray(value, format = 'YYYY-MM-DD', locale = 'fa') {
        return this.datesStringToStringArray(value)
            .filter(d => this.isDateValid(d, format, locale))
            .map(d => moment$9(d, format));
    }
    shouldShowCurrent(showGoToCurrent, mode, min, max) {
        return !!showGoToCurrent &&
            mode !== 'time' &&
            this.isDateInRange(moment$9(), min, max);
    }
    isDateInRange(date, from, to) {
        if (!from && !to) {
            return true;
        }
        if (!from && to)
            return date.isBefore(to, 'day');
        if (from && !to)
            return date.isAfter(from, 'day');
        return date.isBetween(from, to, 'day', '[]');
    }
    convertPropsToMoment(obj, format, props = [], locale) {
        props.forEach((prop) => {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                obj[prop] = this.convertToMoment(obj[prop], format, locale);
            }
        });
    }
    shouldResetCurrentView(prevConf, currentConf) {
        if (prevConf && currentConf) {
            if (!prevConf.min && currentConf.min) {
                return true;
            }
            else if (prevConf.min && currentConf.min && !prevConf.min.isSame(currentConf.min, 'd')) {
                return true;
            }
            else if (!prevConf.max && currentConf.max) {
                return true;
            }
            else if (prevConf.max && currentConf.max && !prevConf.max.isSame(currentConf.max, 'd')) {
                return true;
            }
            return false;
        }
        return false;
    }
    getNativeElement(elem) {
        if (!elem) {
            return null;
        }
        else if (typeof elem === 'string') {
            return document.querySelector(elem);
        }
        else {
            return elem;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: UtilsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: UtilsService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: UtilsService, decorators: [{
            type: Injectable
        }] });

const moment$8 = momentNs;
class DayCalendarService {
    constructor(utilsService) {
        this.utilsService = utilsService;
        this.DEFAULT_CONFIG = {
            showNearMonthDays: true,
            showWeekNumbers: false,
            firstDayOfWeek: 'sa',
            weekDayFormat: 'dd',
            format: 'YYYY/M/D',
            monthFormat: 'MMMM YY',
            dayBtnFormat: 'D',
            allowMultiSelect: false,
            enableMonthSelector: true,
            locale: 'fa'
        };
        this.GREGORIAN_CONFIG_EXTENTION = {
            firstDayOfWeek: 'su',
            weekDayFormat: 'ddd',
            format: 'DD-MM-YYYY',
            monthFormat: 'MMM, YYYY',
            locale: 'en',
            dayBtnFormat: 'DD',
            unSelectOnClick: true
        };
        this.DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
    }
    getConfig(config) {
        const _config = {
            ...this.DEFAULT_CONFIG,
            ...((config && config.locale && config.locale !== 'fa') ? this.GREGORIAN_CONFIG_EXTENTION : {}),
            ...this.utilsService.clearUndefined(config)
        };
        this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max'], _config.locale);
        return _config;
    }
    generateDaysMap(firstDayOfWeek) {
        const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
        const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
        return daysArr.reduce((map, day, index) => {
            map[day] = index;
            return map;
        }, {});
    }
    generateMonthArray(config, month, selected) {
        let monthArray = [];
        const firstDayOfWeekIndex = this.DAYS.indexOf(config.firstDayOfWeek || 'sa');
        const firstDayOfBoard = month.clone().startOf('month');
        for (let i = 0; i < 8 && (firstDayOfBoard.day() !== firstDayOfWeekIndex); i++) {
            firstDayOfBoard.subtract(1, 'day');
            if (i === 7) {
                throw new Error('first day of Board has set Wrong');
            }
        }
        const current = firstDayOfBoard.clone();
        const prevMonth = month.clone().subtract(1, 'month');
        const nextMonth = month.clone().add(1, 'month');
        const today = moment$8();
        const safeSelected = selected || [];
        const daysOfCalendar = this.utilsService.createArray(42)
            .reduce((array) => {
            array.push({
                date: current.clone(),
                selected: !!safeSelected.find(selectedDay => current.isSame(selectedDay, 'day')),
                currentMonth: current.isSame(month, 'month'),
                prevMonth: current.isSame(prevMonth, 'month'),
                nextMonth: current.isSame(nextMonth, 'month'),
                currentDay: current.isSame(today, 'day'),
                disabled: this.isDateDisabled(current, config)
            });
            current.add(1, 'day');
            if (current.format('HH') !== '00') {
                current.startOf('day');
                if (array[array.length - 1].date.format('DD') === current.format('DD')) {
                    current.add(1, 'day');
                }
            }
            return array;
        }, []);
        daysOfCalendar.forEach((day, index) => {
            const weekIndex = Math.floor(index / 7);
            if (!monthArray[weekIndex]) {
                monthArray.push([]);
            }
            monthArray[weekIndex].push(day);
        });
        if (!config.showNearMonthDays) {
            monthArray = this.removeNearMonthWeeks(month, monthArray);
        }
        return monthArray;
    }
    generateWeekdays(firstDayOfWeek, locale) {
        const weekdayNames = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'].reduce((acc, d, i) => {
            const m = moment$8();
            if (locale) {
                m.locale(locale);
            }
            m.day(i);
            acc[d] = m;
            return acc;
        }, {});
        const weekdays = [];
        const daysMap = this.generateDaysMap(firstDayOfWeek);
        for (const dayKey in daysMap) {
            if (Object.prototype.hasOwnProperty.call(daysMap, dayKey)) {
                weekdays[daysMap[dayKey]] = weekdayNames[dayKey];
            }
        }
        return weekdays;
    }
    isDateDisabled(date, config) {
        if (config.isDayDisabledCallback) {
            return config.isDayDisabledCallback(date);
        }
        if (config.min && date.isBefore(config.min, 'day')) {
            return true;
        }
        return !!(config.max && date.isAfter(config.max, 'day'));
    }
    getHeaderLabel(config, month) {
        if (config.monthFormatter) {
            return config.monthFormatter(month);
        }
        if (config.locale) {
            month.locale(config.locale);
        }
        return month.format(config.monthFormat);
    }
    shouldShowLeft(min, currentMonthView) {
        return min ? min.isBefore(currentMonthView, 'month') : true;
    }
    shouldShowRight(max, currentMonthView) {
        return max ? max.isAfter(currentMonthView, 'month') : true;
    }
    generateDaysIndexMap(firstDayOfWeek) {
        const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
        const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
        return daysArr.reduce((map, day, index) => {
            map[index] = day;
            return map;
        }, {});
    }
    getMonthCalendarConfig(componentConfig) {
        return this.utilsService.clearUndefined({
            min: componentConfig.min,
            max: componentConfig.max,
            format: componentConfig.format,
            isNavHeaderBtnClickable: true,
            allowMultiSelect: false,
            yearFormat: componentConfig.yearFormat,
            locale: componentConfig.locale,
            yearFormatter: componentConfig.yearFormatter,
            monthBtnFormat: componentConfig.monthBtnFormat,
            monthBtnFormatter: componentConfig.monthBtnFormatter,
            monthBtnCssClassCallback: componentConfig.monthBtnCssClassCallback,
            multipleYearsNavigateBy: componentConfig.multipleYearsNavigateBy,
            showMultipleYearsNavigation: componentConfig.showMultipleYearsNavigation,
            showGoToCurrent: componentConfig.showGoToCurrent
        });
    }
    getDayBtnText(config, day) {
        if (config.dayBtnFormatter) {
            return config.dayBtnFormatter(day);
        }
        return day.format(config.dayBtnFormat);
    }
    getDayBtnCssClass(config, day) {
        if (config.dayBtnCssClassCallback) {
            return config.dayBtnCssClassCallback(day);
        }
        return '';
    }
    removeNearMonthWeeks(currentMonth, monthArray) {
        if (monthArray.length > 0 && monthArray[monthArray.length - 1].find((day) => day.date.isSame(currentMonth, 'month'))) {
            return monthArray;
        }
        else {
            return monthArray.slice(0, -1);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayCalendarService, deps: [{ token: UtilsService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayCalendarService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayCalendarService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: UtilsService }] });

class CalendarNavComponent {
    constructor() {
        this.label = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
        this.isLabelClickable = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isLabelClickable" }] : /* istanbul ignore next */ []));
        this.showLeftNav = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showLeftNav" }] : /* istanbul ignore next */ []));
        this.showLeftSecondaryNav = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showLeftSecondaryNav" }] : /* istanbul ignore next */ []));
        this.showRightNav = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showRightNav" }] : /* istanbul ignore next */ []));
        this.showRightSecondaryNav = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showRightSecondaryNav" }] : /* istanbul ignore next */ []));
        this.leftNavDisabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "leftNavDisabled" }] : /* istanbul ignore next */ []));
        this.leftSecondaryNavDisabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "leftSecondaryNavDisabled" }] : /* istanbul ignore next */ []));
        this.rightNavDisabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rightNavDisabled" }] : /* istanbul ignore next */ []));
        this.rightSecondaryNavDisabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rightSecondaryNavDisabled" }] : /* istanbul ignore next */ []));
        this.showGoToCurrent = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showGoToCurrent" }] : /* istanbul ignore next */ []));
        this.theme = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "theme" }] : /* istanbul ignore next */ []));
        this.onLeftNav = output();
        this.onLeftSecondaryNav = output();
        this.onRightNav = output();
        this.onRightSecondaryNav = output();
        this.onLabelClick = output();
        this.onGoToCurrent = output();
    }
    get themeClass() {
        return this.theme() || '';
    }
    leftNavClicked() {
        this.onLeftNav.emit();
    }
    leftSecondaryNavClicked() {
        this.onLeftSecondaryNav.emit();
    }
    rightNavClicked() {
        this.onRightNav.emit();
    }
    rightSecondaryNavClicked() {
        this.onRightSecondaryNav.emit();
    }
    labelClicked() {
        this.onLabelClick.emit();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: CalendarNavComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.5", type: CalendarNavComponent, isStandalone: true, selector: "dp-calendar-nav", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, isLabelClickable: { classPropertyName: "isLabelClickable", publicName: "isLabelClickable", isSignal: true, isRequired: false, transformFunction: null }, showLeftNav: { classPropertyName: "showLeftNav", publicName: "showLeftNav", isSignal: true, isRequired: false, transformFunction: null }, showLeftSecondaryNav: { classPropertyName: "showLeftSecondaryNav", publicName: "showLeftSecondaryNav", isSignal: true, isRequired: false, transformFunction: null }, showRightNav: { classPropertyName: "showRightNav", publicName: "showRightNav", isSignal: true, isRequired: false, transformFunction: null }, showRightSecondaryNav: { classPropertyName: "showRightSecondaryNav", publicName: "showRightSecondaryNav", isSignal: true, isRequired: false, transformFunction: null }, leftNavDisabled: { classPropertyName: "leftNavDisabled", publicName: "leftNavDisabled", isSignal: true, isRequired: false, transformFunction: null }, leftSecondaryNavDisabled: { classPropertyName: "leftSecondaryNavDisabled", publicName: "leftSecondaryNavDisabled", isSignal: true, isRequired: false, transformFunction: null }, rightNavDisabled: { classPropertyName: "rightNavDisabled", publicName: "rightNavDisabled", isSignal: true, isRequired: false, transformFunction: null }, rightSecondaryNavDisabled: { classPropertyName: "rightSecondaryNavDisabled", publicName: "rightSecondaryNavDisabled", isSignal: true, isRequired: false, transformFunction: null }, showGoToCurrent: { classPropertyName: "showGoToCurrent", publicName: "showGoToCurrent", isSignal: true, isRequired: false, transformFunction: null }, theme: { classPropertyName: "theme", publicName: "theme", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { onLeftNav: "onLeftNav", onLeftSecondaryNav: "onLeftSecondaryNav", onRightNav: "onRightNav", onRightSecondaryNav: "onRightSecondaryNav", onLabelClick: "onLabelClick", onGoToCurrent: "onGoToCurrent" }, host: { properties: { "class": "this.themeClass" } }, ngImport: i0, template: "<div class=\"dp-calendar-nav-container\">\n  <div class=\"dp-nav-header\">\n    <span [attr.data-hidden]=\"isLabelClickable()\"\n          [hidden]=\"isLabelClickable()\"\n          [innerText]=\"label()\">\n    </span>\n    <button (click)=\"labelClicked()\"\n            [attr.data-hidden]=\"!isLabelClickable()\"\n            [hidden]=\"!isLabelClickable()\"\n            [innerText]=\"label()\"\n            class=\"dp-nav-header-btn\"\n            type=\"button\">\n    </button>\n  </div>\n\n  <div class=\"dp-nav-btns-container\">\n    <div class=\"dp-calendar-nav-container-left\">\n      @if (showLeftSecondaryNav()) {\n        <button (click)=\"leftSecondaryNavClicked()\"\n                [disabled]=\"leftSecondaryNavDisabled()\"\n                class=\"dp-calendar-secondary-nav-left\"\n                type=\"button\">\n        </button>\n      }\n      <button (click)=\"leftNavClicked()\"\n              [attr.data-hidden]=\"!showLeftNav()\"\n              [disabled]=\"leftNavDisabled()\"\n              [hidden]=\"!showLeftNav()\"\n              class=\"dp-calendar-nav-left\"\n              type=\"button\">\n      </button>\n    </div>\n    @if (showGoToCurrent()) {\n      <button (click)=\"onGoToCurrent.emit()\"\n              class=\"dp-current-location-btn\"\n              type=\"button\">\n      </button>\n    }\n    <div class=\"dp-calendar-nav-container-right\">\n      <button (click)=\"rightNavClicked()\"\n              [attr.data-hidden]=\"!showRightNav()\"\n              [disabled]=\"rightNavDisabled()\"\n              [hidden]=\"!showRightNav()\"\n              class=\"dp-calendar-nav-right\"\n              type=\"button\">\n      </button>\n      @if (showRightSecondaryNav()) {\n        <button (click)=\"rightSecondaryNavClicked()\"\n                [disabled]=\"rightSecondaryNavDisabled()\"\n                class=\"dp-calendar-secondary-nav-right\"\n                type=\"button\">\n        </button>\n      }\n    </div>\n  </div>\n</div>\n", styles: ["dp-calendar-nav .dp-calendar-nav-container{position:relative;box-sizing:border-box;height:25px;border:1px solid #000000;border-bottom:none}dp-calendar-nav .dp-nav-date-btn{box-sizing:border-box;height:25px;border:1px solid #000000;border-bottom:none}dp-calendar-nav .dp-nav-btns-container{position:absolute;top:50%;transform:translateY(-50%);right:5px;display:inline-block;direction:ltr}dp-calendar-nav .dp-calendar-nav-container-left,dp-calendar-nav .dp-calendar-nav-container-right{display:inline-block}dp-calendar-nav .dp-calendar-nav-left,dp-calendar-nav .dp-calendar-nav-right,dp-calendar-nav .dp-calendar-secondary-nav-left,dp-calendar-nav .dp-calendar-secondary-nav-right{position:relative;width:16px;cursor:pointer}dp-calendar-nav .dp-calendar-nav-left,dp-calendar-nav .dp-calendar-nav-right{line-height:0}dp-calendar-nav .dp-calendar-nav-left:before,dp-calendar-nav .dp-calendar-nav-right:before{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(45deg)}dp-calendar-nav .dp-calendar-secondary-nav-left,dp-calendar-nav .dp-calendar-secondary-nav-right{padding:0}dp-calendar-nav .dp-calendar-secondary-nav-left:before,dp-calendar-nav .dp-calendar-secondary-nav-right:before,dp-calendar-nav .dp-calendar-secondary-nav-left:after,dp-calendar-nav .dp-calendar-secondary-nav-right:after{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(45deg)}dp-calendar-nav .dp-calendar-secondary-nav-left:before,dp-calendar-nav .dp-calendar-secondary-nav-right:before{right:-10px}dp-calendar-nav .dp-calendar-secondary-nav-right{left:initial;right:5px}dp-calendar-nav .dp-calendar-nav-left:before{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(-135deg)}dp-calendar-nav .dp-calendar-secondary-nav-left:before,dp-calendar-nav .dp-calendar-secondary-nav-left:after{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(-135deg)}dp-calendar-nav .dp-calendar-secondary-nav-left:before{right:-10px}dp-calendar-nav .dp-nav-header{position:absolute;top:50%;transform:translateY(-50%);left:5px;display:inline-block;font-size:13px}dp-calendar-nav .dp-nav-header-btn{cursor:pointer}dp-calendar-nav .dp-current-location-btn{position:relative;top:-1px;height:16px;width:16px;vertical-align:middle;background:#0009;border:1px solid rgba(0,0,0,.6);outline:none;border-radius:50%;box-shadow:inset 0 0 0 3px #fff;cursor:pointer}dp-calendar-nav .dp-current-location-btn:hover{background:#000}dp-calendar-nav.dp-material .dp-calendar-nav-container{height:30px;border:1px solid #E0E0E0}dp-calendar-nav.dp-material .dp-calendar-nav-left,dp-calendar-nav.dp-material .dp-calendar-nav-right,dp-calendar-nav.dp-material .dp-calendar-secondary-nav-left,dp-calendar-nav.dp-material .dp-calendar-secondary-nav-right{border:none;background:#fff;outline:none;font-size:16px;padding:0}dp-calendar-nav.dp-material .dp-calendar-secondary-nav-left,dp-calendar-nav.dp-material .dp-calendar-secondary-nav-right{width:20px}dp-calendar-nav.dp-material .dp-nav-header-btn{height:20px;width:80px;border:none;background:#fff;outline:none}dp-calendar-nav.dp-material .dp-nav-header-btn:hover{background:#0000000d}dp-calendar-nav.dp-material .dp-nav-header-btn:active{background:#0000001a}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: CalendarNavComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dp-calendar-nav', encapsulation: ViewEncapsulation.None, imports: [
                        CommonModule
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"dp-calendar-nav-container\">\n  <div class=\"dp-nav-header\">\n    <span [attr.data-hidden]=\"isLabelClickable()\"\n          [hidden]=\"isLabelClickable()\"\n          [innerText]=\"label()\">\n    </span>\n    <button (click)=\"labelClicked()\"\n            [attr.data-hidden]=\"!isLabelClickable()\"\n            [hidden]=\"!isLabelClickable()\"\n            [innerText]=\"label()\"\n            class=\"dp-nav-header-btn\"\n            type=\"button\">\n    </button>\n  </div>\n\n  <div class=\"dp-nav-btns-container\">\n    <div class=\"dp-calendar-nav-container-left\">\n      @if (showLeftSecondaryNav()) {\n        <button (click)=\"leftSecondaryNavClicked()\"\n                [disabled]=\"leftSecondaryNavDisabled()\"\n                class=\"dp-calendar-secondary-nav-left\"\n                type=\"button\">\n        </button>\n      }\n      <button (click)=\"leftNavClicked()\"\n              [attr.data-hidden]=\"!showLeftNav()\"\n              [disabled]=\"leftNavDisabled()\"\n              [hidden]=\"!showLeftNav()\"\n              class=\"dp-calendar-nav-left\"\n              type=\"button\">\n      </button>\n    </div>\n    @if (showGoToCurrent()) {\n      <button (click)=\"onGoToCurrent.emit()\"\n              class=\"dp-current-location-btn\"\n              type=\"button\">\n      </button>\n    }\n    <div class=\"dp-calendar-nav-container-right\">\n      <button (click)=\"rightNavClicked()\"\n              [attr.data-hidden]=\"!showRightNav()\"\n              [disabled]=\"rightNavDisabled()\"\n              [hidden]=\"!showRightNav()\"\n              class=\"dp-calendar-nav-right\"\n              type=\"button\">\n      </button>\n      @if (showRightSecondaryNav()) {\n        <button (click)=\"rightSecondaryNavClicked()\"\n                [disabled]=\"rightSecondaryNavDisabled()\"\n                class=\"dp-calendar-secondary-nav-right\"\n                type=\"button\">\n        </button>\n      }\n    </div>\n  </div>\n</div>\n", styles: ["dp-calendar-nav .dp-calendar-nav-container{position:relative;box-sizing:border-box;height:25px;border:1px solid #000000;border-bottom:none}dp-calendar-nav .dp-nav-date-btn{box-sizing:border-box;height:25px;border:1px solid #000000;border-bottom:none}dp-calendar-nav .dp-nav-btns-container{position:absolute;top:50%;transform:translateY(-50%);right:5px;display:inline-block;direction:ltr}dp-calendar-nav .dp-calendar-nav-container-left,dp-calendar-nav .dp-calendar-nav-container-right{display:inline-block}dp-calendar-nav .dp-calendar-nav-left,dp-calendar-nav .dp-calendar-nav-right,dp-calendar-nav .dp-calendar-secondary-nav-left,dp-calendar-nav .dp-calendar-secondary-nav-right{position:relative;width:16px;cursor:pointer}dp-calendar-nav .dp-calendar-nav-left,dp-calendar-nav .dp-calendar-nav-right{line-height:0}dp-calendar-nav .dp-calendar-nav-left:before,dp-calendar-nav .dp-calendar-nav-right:before{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(45deg)}dp-calendar-nav .dp-calendar-secondary-nav-left,dp-calendar-nav .dp-calendar-secondary-nav-right{padding:0}dp-calendar-nav .dp-calendar-secondary-nav-left:before,dp-calendar-nav .dp-calendar-secondary-nav-right:before,dp-calendar-nav .dp-calendar-secondary-nav-left:after,dp-calendar-nav .dp-calendar-secondary-nav-right:after{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(45deg)}dp-calendar-nav .dp-calendar-secondary-nav-left:before,dp-calendar-nav .dp-calendar-secondary-nav-right:before{right:-10px}dp-calendar-nav .dp-calendar-secondary-nav-right{left:initial;right:5px}dp-calendar-nav .dp-calendar-nav-left:before{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(-135deg)}dp-calendar-nav .dp-calendar-secondary-nav-left:before,dp-calendar-nav .dp-calendar-secondary-nav-left:after{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(-135deg)}dp-calendar-nav .dp-calendar-secondary-nav-left:before{right:-10px}dp-calendar-nav .dp-nav-header{position:absolute;top:50%;transform:translateY(-50%);left:5px;display:inline-block;font-size:13px}dp-calendar-nav .dp-nav-header-btn{cursor:pointer}dp-calendar-nav .dp-current-location-btn{position:relative;top:-1px;height:16px;width:16px;vertical-align:middle;background:#0009;border:1px solid rgba(0,0,0,.6);outline:none;border-radius:50%;box-shadow:inset 0 0 0 3px #fff;cursor:pointer}dp-calendar-nav .dp-current-location-btn:hover{background:#000}dp-calendar-nav.dp-material .dp-calendar-nav-container{height:30px;border:1px solid #E0E0E0}dp-calendar-nav.dp-material .dp-calendar-nav-left,dp-calendar-nav.dp-material .dp-calendar-nav-right,dp-calendar-nav.dp-material .dp-calendar-secondary-nav-left,dp-calendar-nav.dp-material .dp-calendar-secondary-nav-right{border:none;background:#fff;outline:none;font-size:16px;padding:0}dp-calendar-nav.dp-material .dp-calendar-secondary-nav-left,dp-calendar-nav.dp-material .dp-calendar-secondary-nav-right{width:20px}dp-calendar-nav.dp-material .dp-nav-header-btn{height:20px;width:80px;border:none;background:#fff;outline:none}dp-calendar-nav.dp-material .dp-nav-header-btn:hover{background:#0000000d}dp-calendar-nav.dp-material .dp-nav-header-btn:active{background:#0000001a}\n"] }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], isLabelClickable: [{ type: i0.Input, args: [{ isSignal: true, alias: "isLabelClickable", required: false }] }], showLeftNav: [{ type: i0.Input, args: [{ isSignal: true, alias: "showLeftNav", required: false }] }], showLeftSecondaryNav: [{ type: i0.Input, args: [{ isSignal: true, alias: "showLeftSecondaryNav", required: false }] }], showRightNav: [{ type: i0.Input, args: [{ isSignal: true, alias: "showRightNav", required: false }] }], showRightSecondaryNav: [{ type: i0.Input, args: [{ isSignal: true, alias: "showRightSecondaryNav", required: false }] }], leftNavDisabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "leftNavDisabled", required: false }] }], leftSecondaryNavDisabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "leftSecondaryNavDisabled", required: false }] }], rightNavDisabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "rightNavDisabled", required: false }] }], rightSecondaryNavDisabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "rightSecondaryNavDisabled", required: false }] }], showGoToCurrent: [{ type: i0.Input, args: [{ isSignal: true, alias: "showGoToCurrent", required: false }] }], theme: [{ type: i0.Input, args: [{ isSignal: true, alias: "theme", required: false }] }], themeClass: [{
                type: HostBinding,
                args: ['class']
            }], onLeftNav: [{ type: i0.Output, args: ["onLeftNav"] }], onLeftSecondaryNav: [{ type: i0.Output, args: ["onLeftSecondaryNav"] }], onRightNav: [{ type: i0.Output, args: ["onRightNav"] }], onRightSecondaryNav: [{ type: i0.Output, args: ["onRightSecondaryNav"] }], onLabelClick: [{ type: i0.Output, args: ["onLabelClick"] }], onGoToCurrent: [{ type: i0.Output, args: ["onGoToCurrent"] }] } });

const moment$7 = momentNs;
class MonthCalendarService {
    constructor(utilsService) {
        this.utilsService = utilsService;
        this.DEFAULT_CONFIG = {
            allowMultiSelect: false,
            yearFormat: 'YYYY',
            format: 'MMMM-YYYY',
            isNavHeaderBtnClickable: false,
            monthBtnFormat: 'MMMM',
            locale: 'fa',
            multipleYearsNavigateBy: 10,
            showMultipleYearsNavigation: false,
            unSelectOnClick: true
        };
        this.GREGORIAN_DEFAULT_CONFIG = {
            format: 'MM-YYYY',
            monthBtnFormat: 'MMM',
            locale: 'en'
        };
    }
    getConfig(config) {
        const _config = {
            ...this.DEFAULT_CONFIG,
            ...((config && config.locale && config.locale !== 'fa') ? this.GREGORIAN_DEFAULT_CONFIG : {}),
            ...this.utilsService.clearUndefined(config)
        };
        this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max'], _config.locale);
        return _config;
    }
    generateYear(config, year, selected = []) {
        const index = year.clone().startOf('year');
        const safeSelected = selected || [];
        return this.utilsService.createArray(3).map(() => {
            return this.utilsService.createArray(4).map(() => {
                const date = index.clone();
                const month = {
                    date,
                    selected: !!safeSelected.find(s => index.isSame(s, 'month')),
                    currentMonth: index.isSame(moment$7(), 'month'),
                    disabled: this.isMonthDisabled(date, config),
                    text: this.getMonthBtnText(config, date)
                };
                index.add(1, 'month');
                return month;
            });
        });
    }
    isMonthDisabled(date, config) {
        if (config.min && date.isBefore(config.min, 'month')) {
            return true;
        }
        return !!(config.max && date.isAfter(config.max, 'month'));
    }
    shouldShowLeft(min, currentMonthView) {
        return min ? min.isBefore(currentMonthView, 'year') : true;
    }
    shouldShowRight(max, currentMonthView) {
        return max ? max.isAfter(currentMonthView, 'year') : true;
    }
    getHeaderLabel(config, year) {
        if (config.yearFormatter) {
            return config.yearFormatter(year);
        }
        if (config.locale) {
            year.locale(config.locale);
        }
        return year.format(config.yearFormat);
    }
    getMonthBtnText(config, month) {
        if (config.monthBtnFormatter) {
            return config.monthBtnFormatter(month);
        }
        return month.format(config.monthBtnFormat);
    }
    getMonthBtnCssClass(config, month) {
        if (config.monthBtnCssClassCallback) {
            return config.monthBtnCssClassCallback(month);
        }
        return '';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: MonthCalendarService, deps: [{ token: UtilsService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: MonthCalendarService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: MonthCalendarService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: UtilsService }] });

const moment$6 = momentNs;
class MonthCalendarComponent {
    get themeClass() {
        return this.theme() || '';
    }
    constructor(monthCalendarService, utilsService, cd) {
        this.monthCalendarService = monthCalendarService;
        this.utilsService = utilsService;
        this.cd = cd;
        this.config = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "config" }] : /* istanbul ignore next */ []));
        this.displayDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "displayDate" }] : /* istanbul ignore next */ []));
        this.minDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "maxDate" }] : /* istanbul ignore next */ []));
        this.theme = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "theme" }] : /* istanbul ignore next */ []));
        this.onSelect = output();
        this.onNavHeaderBtnClick = output();
        this.onGoToCurrent = output();
        this.onLeftNav = output();
        this.onRightNav = output();
        this.onLeftSecondaryNav = output();
        this.onRightSecondaryNav = output();
        this.isInited = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isInited" }] : /* istanbul ignore next */ []));
        this.selected = signal([], /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
        this.currentDateView = signal(moment$6(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "currentDateView" }] : /* istanbul ignore next */ []));
        this.componentConfig = computed(() => this.monthCalendarService.getConfig(this.config() || {}), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "componentConfig" }] : /* istanbul ignore next */ []));
        this.yearMonths = computed(() => this.monthCalendarService.generateYear(this.componentConfig(), this.currentDateView(), this.selected()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "yearMonths" }] : /* istanbul ignore next */ []));
        this.navLabel = computed(() => this.monthCalendarService.getHeaderLabel(this.componentConfig(), this.currentDateView()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "navLabel" }] : /* istanbul ignore next */ []));
        this.showLeftNav = computed(() => this.monthCalendarService.shouldShowLeft(this.componentConfig().min, this.currentDateView()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showLeftNav" }] : /* istanbul ignore next */ []));
        this.showRightNav = computed(() => this.monthCalendarService.shouldShowRight(this.componentConfig().max, this.currentDateView()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showRightNav" }] : /* istanbul ignore next */ []));
        this.showSecondaryLeftNav = computed(() => (!!this.componentConfig().showMultipleYearsNavigation && this.showLeftNav()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showSecondaryLeftNav" }] : /* istanbul ignore next */ []));
        this.showSecondaryRightNav = computed(() => (!!this.componentConfig().showMultipleYearsNavigation && this.showRightNav()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showSecondaryRightNav" }] : /* istanbul ignore next */ []));
        this.shouldShowCurrent = computed(() => this.utilsService.shouldShowCurrent(this.componentConfig().showGoToCurrent, 'month', this.componentConfig().min, this.componentConfig().max), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "shouldShowCurrent" }] : /* istanbul ignore next */ []));
        this.inputValue = '';
        this.inputValueType = ECalendarValue.String;
        this.api = {
            toggleCalendar: this.toggleCalendarMode.bind(this),
            moveCalendarTo: this.moveCalendarTo.bind(this)
        };
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
            ? this.displayDate().clone()
            : this.utilsService.getDefaultDisplayDate(currentView, selected, !!config.allowMultiSelect, config.min, config.locale || 'fa');
        this.currentDateView.set(nextView);
        this.inputValueType = this.utilsService.getInputType(this.inputValue, !!config.allowMultiSelect);
    }
    writeValue(value) {
        if (value) {
            const config = this.componentConfig();
            const selectedArr = this.utilsService.convertToMomentArray(value, config.format || 'MMMM-YYYY', !!config.allowMultiSelect, config.locale || 'fa');
            this.selected.set(selectedArr);
            this.inputValueType = this.utilsService.getInputType(value, !!config.allowMultiSelect);
        }
        else {
            this.selected.set([]);
        }
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    onChangeCallback(_) { }
    registerOnTouched(_fn) { }
    validate(formControl) {
        if (this.minDate() || this.maxDate()) {
            return this.validateFn ? this.validateFn(formControl.value) : null;
        }
        return null;
    }
    initValidators() {
        const config = this.componentConfig();
        this.validateFn = this.utilsService.createValidator({ minDate: this.minDate(), maxDate: this.maxDate() }, config.format || 'MMMM-YYYY', 'month', config.locale || 'fa');
        this.onChangeCallback(this.processOnChangeCallback(this.selected()));
    }
    processOnChangeCallback(value) {
        const config = this.componentConfig();
        return this.utilsService.convertFromMomentArray(config.format || 'MMMM-YYYY', value, config.returnedValueType || this.inputValueType, config.locale || 'fa');
    }
    monthClicked(month) {
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
        this.onLeftNav.emit({ from, to });
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
        this.onLeftSecondaryNav.emit({ from, to });
    }
    onRightNavClick() {
        const from = this.currentDateView().clone();
        this.currentDateView.set(this.currentDateView().clone().add(1, 'year'));
        const to = this.currentDateView().clone();
        this.onRightNav.emit({ from, to });
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
        this.onRightSecondaryNav.emit({ from, to });
    }
    toggleCalendarMode() {
        this.onNavHeaderBtnClick.emit();
    }
    getMonthBtnCssClass(month) {
        const cssClass = {
            'dp-selected': !!month.selected,
            'dp-current-month': !!month.currentMonth
        };
        const customCssClass = this.monthCalendarService.getMonthBtnCssClass(this.componentConfig(), month.date);
        if (customCssClass) {
            cssClass[customCssClass] = true;
        }
        return cssClass;
    }
    goToCurrent() {
        this.currentDateView.set(moment$6().locale(this.componentConfig().locale || 'fa'));
        this.onGoToCurrent.emit();
    }
    moveCalendarTo(to) {
        if (to) {
            const config = this.componentConfig();
            this.currentDateView.set(this.utilsService.convertToMoment(to, config.format || 'MMMM-YYYY', config.locale || 'fa'));
            this.cd.markForCheck();
        }
    }
    isFarsi() {
        return this.componentConfig().locale === 'fa';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: MonthCalendarComponent, deps: [{ token: MonthCalendarService }, { token: UtilsService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.5", type: MonthCalendarComponent, isStandalone: true, selector: "dp-month-calendar", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: false, transformFunction: null }, displayDate: { classPropertyName: "displayDate", publicName: "displayDate", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null }, theme: { classPropertyName: "theme", publicName: "theme", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { onSelect: "onSelect", onNavHeaderBtnClick: "onNavHeaderBtnClick", onGoToCurrent: "onGoToCurrent", onLeftNav: "onLeftNav", onRightNav: "onRightNav", onLeftSecondaryNav: "onLeftSecondaryNav", onRightSecondaryNav: "onRightSecondaryNav" }, host: { properties: { "class": "this.themeClass" } }, providers: [
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
        ], ngImport: i0, template: "<dp-calendar-nav\n    (onGoToCurrent)=\"goToCurrent()\"\n    (onLabelClick)=\"toggleCalendarMode()\"\n    (onLeftNav)=\"onLeftNavClick()\"\n    (onLeftSecondaryNav)=\"onLeftSecondaryNavClick()\"\n    (onRightNav)=\"onRightNavClick()\"\n    (onRightSecondaryNav)=\"onRightSecondaryNavClick()\"\n    [isLabelClickable]=\"componentConfig().isNavHeaderBtnClickable || false\"\n    [label]=\"navLabel()\"\n    [showGoToCurrent]=\"shouldShowCurrent()\"\n    [showLeftNav]=\"showLeftNav()\"\n    [showRightNav]=\"showRightNav()\"\n    [showLeftSecondaryNav]=\"showSecondaryLeftNav()\"\n    [showRightSecondaryNav]=\"showSecondaryRightNav()\"\n    [theme]=\"theme() || ''\">\n</dp-calendar-nav>\n\n<div class=\"dp-month-calendar-container\" [ngClass]=\"{'rtl': isFarsi()}\">\n  @for (row of yearMonths(); track row) {\n    <div class=\"dp-months-row\">\n      @for (month of row; track month.date.valueOf()) {\n        <button (click)=\"monthClicked(month)\"\n                [disabled]=\"month.disabled\"\n                [innerText]=\"month.text\"\n                [ngClass]=\"getMonthBtnCssClass(month)\"\n                class=\"dp-calendar-month\"\n                type=\"button\">\n        </button>\n      }\n    </div>\n  }\n</div>\n", styles: ["dp-month-calendar{display:inline-block}dp-month-calendar .dp-month-calendar-container{background:#fff}dp-month-calendar .dp-calendar-wrapper.rtl{direction:rtl}dp-month-calendar .dp-calendar-month{box-sizing:border-box;width:330px / 6;height:330px / 6;cursor:pointer}dp-month-calendar .dp-calendar-month.dp-selected{background:#106cc880;color:#fff}dp-month-calendar.dp-material .dp-calendar-weekday{height:25px;width:30px;line-height:25px;background:#e0e0e0;border:1px solid #E0E0E0}dp-month-calendar.dp-material .dp-calendar-wrapper{padding:15px}dp-month-calendar.dp-material .dp-calendar-month{box-sizing:border-box;background:#fff;border-radius:0;transition:border-radius .1s ease;border:none;outline:none;font-size:.7rem}dp-month-calendar.dp-material .dp-calendar-month:hover{border-radius:50%;background:#e0e0e0}dp-month-calendar.dp-material .dp-selected{background:#106cc880;color:#fff;border-radius:50%}dp-month-calendar.dp-material .dp-selected:hover{background:#106cc880}dp-month-calendar.dp-material .dp-current-month{border-radius:50%;border:1px solid rgba(16,108,200,.5);padding:0}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: CalendarNavComponent, selector: "dp-calendar-nav", inputs: ["label", "isLabelClickable", "showLeftNav", "showLeftSecondaryNav", "showRightNav", "showRightSecondaryNav", "leftNavDisabled", "leftSecondaryNavDisabled", "rightNavDisabled", "rightSecondaryNavDisabled", "showGoToCurrent", "theme"], outputs: ["onLeftNav", "onLeftSecondaryNav", "onRightNav", "onRightSecondaryNav", "onLabelClick", "onGoToCurrent"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: MonthCalendarComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dp-month-calendar', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        CommonModule,
                        CalendarNavComponent,
                        NgClass
                    ], providers: [
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
                    ], template: "<dp-calendar-nav\n    (onGoToCurrent)=\"goToCurrent()\"\n    (onLabelClick)=\"toggleCalendarMode()\"\n    (onLeftNav)=\"onLeftNavClick()\"\n    (onLeftSecondaryNav)=\"onLeftSecondaryNavClick()\"\n    (onRightNav)=\"onRightNavClick()\"\n    (onRightSecondaryNav)=\"onRightSecondaryNavClick()\"\n    [isLabelClickable]=\"componentConfig().isNavHeaderBtnClickable || false\"\n    [label]=\"navLabel()\"\n    [showGoToCurrent]=\"shouldShowCurrent()\"\n    [showLeftNav]=\"showLeftNav()\"\n    [showRightNav]=\"showRightNav()\"\n    [showLeftSecondaryNav]=\"showSecondaryLeftNav()\"\n    [showRightSecondaryNav]=\"showSecondaryRightNav()\"\n    [theme]=\"theme() || ''\">\n</dp-calendar-nav>\n\n<div class=\"dp-month-calendar-container\" [ngClass]=\"{'rtl': isFarsi()}\">\n  @for (row of yearMonths(); track row) {\n    <div class=\"dp-months-row\">\n      @for (month of row; track month.date.valueOf()) {\n        <button (click)=\"monthClicked(month)\"\n                [disabled]=\"month.disabled\"\n                [innerText]=\"month.text\"\n                [ngClass]=\"getMonthBtnCssClass(month)\"\n                class=\"dp-calendar-month\"\n                type=\"button\">\n        </button>\n      }\n    </div>\n  }\n</div>\n", styles: ["dp-month-calendar{display:inline-block}dp-month-calendar .dp-month-calendar-container{background:#fff}dp-month-calendar .dp-calendar-wrapper.rtl{direction:rtl}dp-month-calendar .dp-calendar-month{box-sizing:border-box;width:330px / 6;height:330px / 6;cursor:pointer}dp-month-calendar .dp-calendar-month.dp-selected{background:#106cc880;color:#fff}dp-month-calendar.dp-material .dp-calendar-weekday{height:25px;width:30px;line-height:25px;background:#e0e0e0;border:1px solid #E0E0E0}dp-month-calendar.dp-material .dp-calendar-wrapper{padding:15px}dp-month-calendar.dp-material .dp-calendar-month{box-sizing:border-box;background:#fff;border-radius:0;transition:border-radius .1s ease;border:none;outline:none;font-size:.7rem}dp-month-calendar.dp-material .dp-calendar-month:hover{border-radius:50%;background:#e0e0e0}dp-month-calendar.dp-material .dp-selected{background:#106cc880;color:#fff;border-radius:50%}dp-month-calendar.dp-material .dp-selected:hover{background:#106cc880}dp-month-calendar.dp-material .dp-current-month{border-radius:50%;border:1px solid rgba(16,108,200,.5);padding:0}\n"] }]
        }], ctorParameters: () => [{ type: MonthCalendarService }, { type: UtilsService }, { type: i0.ChangeDetectorRef }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: false }] }], displayDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "displayDate", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], theme: [{ type: i0.Input, args: [{ isSignal: true, alias: "theme", required: false }] }], themeClass: [{
                type: HostBinding,
                args: ['class']
            }], onSelect: [{ type: i0.Output, args: ["onSelect"] }], onNavHeaderBtnClick: [{ type: i0.Output, args: ["onNavHeaderBtnClick"] }], onGoToCurrent: [{ type: i0.Output, args: ["onGoToCurrent"] }], onLeftNav: [{ type: i0.Output, args: ["onLeftNav"] }], onRightNav: [{ type: i0.Output, args: ["onRightNav"] }], onLeftSecondaryNav: [{ type: i0.Output, args: ["onLeftSecondaryNav"] }], onRightSecondaryNav: [{ type: i0.Output, args: ["onRightSecondaryNav"] }] } });

const moment$5 = momentNs;
class DayCalendarComponent {
    get themeClass() {
        return this.theme() || '';
    }
    constructor(dayCalendarService, utilsService, cd) {
        this.dayCalendarService = dayCalendarService;
        this.utilsService = utilsService;
        this.cd = cd;
        // Inputs (Signals)
        this.config = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "config" }] : /* istanbul ignore next */ []));
        this.displayDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "displayDate" }] : /* istanbul ignore next */ []));
        this.minDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "maxDate" }] : /* istanbul ignore next */ []));
        this.theme = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "theme" }] : /* istanbul ignore next */ []));
        // Outputs
        this.onSelect = output();
        this.onMonthSelect = output();
        this.onNavHeaderBtnClick = output();
        this.onGoToCurrent = output();
        this.onLeftNav = output();
        this.onRightNav = output();
        this.onLeftSecondaryNav = output();
        this.onRightSecondaryNav = output();
        // Internal state
        this.CalendarMode = ECalendarMode;
        this.isInited = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isInited" }] : /* istanbul ignore next */ []));
        this.currentCalendarMode = signal(ECalendarMode.Day, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "currentCalendarMode" }] : /* istanbul ignore next */ []));
        this.selected = signal([], /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
        this.currentDateView = signal(moment$5(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "currentDateView" }] : /* istanbul ignore next */ []));
        // Computed values
        this.componentConfig = computed(() => this.dayCalendarService.getConfig(this.config() || {}), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "componentConfig" }] : /* istanbul ignore next */ []));
        this.monthCalendarConfig = computed(() => this.dayCalendarService.getMonthCalendarConfig(this.componentConfig()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "monthCalendarConfig" }] : /* istanbul ignore next */ []));
        this.weeks = computed(() => this.dayCalendarService.generateMonthArray(this.componentConfig(), this.currentDateView(), this.selected()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "weeks" }] : /* istanbul ignore next */ []));
        this.weekdays = computed(() => this.dayCalendarService.generateWeekdays(this.componentConfig().firstDayOfWeek || 'sa', this.componentConfig().locale || 'fa'), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "weekdays" }] : /* istanbul ignore next */ []));
        this.navLabel = computed(() => this.dayCalendarService.getHeaderLabel(this.componentConfig(), this.currentDateView()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "navLabel" }] : /* istanbul ignore next */ []));
        this.showLeftNav = computed(() => this.dayCalendarService.shouldShowLeft(this.componentConfig().min, this.currentDateView()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showLeftNav" }] : /* istanbul ignore next */ []));
        this.showRightNav = computed(() => this.dayCalendarService.shouldShowRight(this.componentConfig().max, this.currentDateView()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showRightNav" }] : /* istanbul ignore next */ []));
        this.shouldShowCurrent = computed(() => this.utilsService.shouldShowCurrent(this.componentConfig().showGoToCurrent, 'day', this.componentConfig().min, this.componentConfig().max), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "shouldShowCurrent" }] : /* istanbul ignore next */ []));
        this.inputValue = '';
        this.inputValueType = ECalendarValue.String;
        this.api = {
            moveCalendarsBy: this.moveCalendarsBy.bind(this),
            moveCalendarTo: this.moveCalendarTo.bind(this),
            toggleCalendarMode: this.toggleCalendarMode.bind(this)
        };
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
            : this.utilsService.getDefaultDisplayDate(currentView, selected, !!config.allowMultiSelect, config.min, config.locale || 'fa');
        this.currentDateView.set(nextView);
        this.inputValueType = this.utilsService.getInputType(this.inputValue, !!config.allowMultiSelect);
    }
    initValidators() {
        const config = this.componentConfig();
        this.validateFn = this.utilsService.createValidator({ minDate: this.minDate(), maxDate: this.maxDate() }, config.format || 'YYYY/M/D', 'day', config.locale || 'fa');
        this.onChangeCallback(this.processOnChangeCallback(this.selected()));
    }
    writeValue(value) {
        if (value === this.inputValue || (this.inputValue && moment$5.isMoment(this.inputValue) && this.inputValue.isSame(value))) {
            return;
        }
        this.inputValue = value;
        const config = this.componentConfig();
        if (value) {
            const selectedArr = this.utilsService.convertToMomentArray(value, config.format || 'YYYY/M/D', !!config.allowMultiSelect, config.locale || 'fa');
            this.selected.set(selectedArr);
            this.inputValueType = this.utilsService.getInputType(this.inputValue, !!config.allowMultiSelect);
        }
        else {
            this.selected.set([]);
        }
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    onChangeCallback(_) { }
    registerOnTouched(_fn) { }
    validate(formControl) {
        if (this.minDate() || this.maxDate()) {
            return this.validateFn ? this.validateFn(formControl.value) : null;
        }
        return null;
    }
    processOnChangeCallback(value) {
        const config = this.componentConfig();
        return this.utilsService.convertFromMomentArray(config.format || 'YYYY/M/D', value, config.returnedValueType || this.inputValueType, config.locale || 'fa');
    }
    dayClicked(day) {
        if (day.selected && !this.componentConfig().unSelectOnClick) {
            return;
        }
        const nextSelected = this.utilsService.updateSelected(!!this.componentConfig().allowMultiSelect, this.selected(), day);
        this.selected.set(nextSelected);
        this.onSelect.emit(day);
    }
    getDayBtnText(day) {
        return this.dayCalendarService.getDayBtnText(this.componentConfig(), day.date);
    }
    getDayBtnCssClass(day) {
        const cssClasses = {
            'dp-selected': !!day.selected,
            'dp-current-month': !!day.currentMonth,
            'dp-prev-month': !!day.prevMonth,
            'dp-next-month': !!day.nextMonth,
            'dp-current-day': !!day.currentDay
        };
        const customCssClass = this.dayCalendarService.getDayBtnCssClass(this.componentConfig(), day.date);
        if (customCssClass) {
            cssClasses[customCssClass] = true;
        }
        return cssClasses;
    }
    onLeftNavClick() {
        const from = this.currentDateView().clone();
        this.moveCalendarsBy(this.currentDateView(), -1, 'month');
        const to = this.currentDateView().clone();
        this.onLeftNav.emit({ from, to });
    }
    onRightNavClick() {
        const from = this.currentDateView().clone();
        this.moveCalendarsBy(this.currentDateView(), 1, 'month');
        const to = this.currentDateView().clone();
        this.onRightNav.emit({ from, to });
    }
    onMonthCalendarLeftClick(event) {
        this.onLeftNav.emit(event);
    }
    onMonthCalendarRightClick(event) {
        this.onRightNav.emit(event);
    }
    onMonthCalendarSecondaryLeftClick(event) {
        this.onLeftSecondaryNav.emit(event);
    }
    onMonthCalendarSecondaryRightClick(event) {
        this.onRightSecondaryNav.emit(event);
    }
    getWeekdayName(weekday) {
        const config = this.componentConfig();
        if (config.weekDayFormatter) {
            return config.weekDayFormatter(weekday.day());
        }
        return weekday.format(config.weekDayFormat);
    }
    toggleCalendarMode(mode) {
        if (this.currentCalendarMode() !== mode) {
            this.currentCalendarMode.set(mode);
            this.onNavHeaderBtnClick.emit(mode);
        }
        this.cd.markForCheck();
    }
    monthSelected(month) {
        this.currentDateView.set(month.date.clone());
        this.currentCalendarMode.set(ECalendarMode.Day);
        this.onMonthSelect.emit(month);
    }
    moveCalendarsBy(current, amount, granularity = 'month') {
        this.currentDateView.set(current.clone().add(amount, granularity));
        this.cd.markForCheck();
    }
    moveCalendarTo(to) {
        if (to) {
            this.currentDateView.set(this.utilsService.convertToMoment(to, this.componentConfig().format || 'YYYY/M/D', this.componentConfig().locale || 'fa'));
        }
        this.cd.markForCheck();
    }
    goToCurrent() {
        this.currentDateView.set(moment$5().locale(this.componentConfig().locale || 'fa'));
        this.onGoToCurrent.emit();
    }
    isFarsi() {
        return this.componentConfig().locale === 'fa';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayCalendarComponent, deps: [{ token: DayCalendarService }, { token: UtilsService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.5", type: DayCalendarComponent, isStandalone: true, selector: "dp-day-calendar", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: false, transformFunction: null }, displayDate: { classPropertyName: "displayDate", publicName: "displayDate", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null }, theme: { classPropertyName: "theme", publicName: "theme", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { onSelect: "onSelect", onMonthSelect: "onMonthSelect", onNavHeaderBtnClick: "onNavHeaderBtnClick", onGoToCurrent: "onGoToCurrent", onLeftNav: "onLeftNav", onRightNav: "onRightNav", onLeftSecondaryNav: "onLeftSecondaryNav", onRightSecondaryNav: "onRightSecondaryNav" }, host: { properties: { "class": "this.themeClass" } }, providers: [
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
        ], ngImport: i0, template: "@if (currentCalendarMode() === CalendarMode.Day) {\n  <div class=\"dp-day-calendar-container\">\n    <dp-calendar-nav\n      (onGoToCurrent)=\"goToCurrent()\"\n      (onLabelClick)=\"toggleCalendarMode(CalendarMode.Month)\"\n      (onLeftNav)=\"onLeftNavClick()\"\n      (onRightNav)=\"onRightNavClick()\"\n      [isLabelClickable]=\"componentConfig().enableMonthSelector || false\"\n      [label]=\"navLabel()\"\n      [showGoToCurrent]=\"shouldShowCurrent()\"\n      [showLeftNav]=\"showLeftNav()\"\n      [showRightNav]=\"showRightNav()\"\n      [theme]=\"theme() || ''\">\n    </dp-calendar-nav>\n\n    <div [ngClass]=\"{'dp-hide-near-month': !componentConfig().showNearMonthDays, 'rtl': isFarsi()}\"\n         class=\"dp-calendar-wrapper\">\n      <div class=\"dp-weekdays\">\n        @for (weekday of weekdays(); track weekday) {\n          <span [innerText]=\"getWeekdayName(weekday)\"\n                class=\"dp-calendar-weekday\">\n          </span>\n        }\n      </div>\n      @for (week of weeks(); track week) {\n        <div class=\"dp-calendar-week\">\n          @if (componentConfig().showWeekNumbers) {\n            <span [innerText]=\"week[0].date.isoWeek()\"\n                  class=\"dp-week-number\">\n            </span>\n          }\n          @for (day of week; track day.date.valueOf()) {\n            <button (click)=\"dayClicked(day)\"\n                    [attr.data-date]=\"day.date.format(componentConfig().format)\"\n                    [disabled]=\"day.disabled\"\n                    [innerText]=\"getDayBtnText(day)\"\n                    [ngClass]=\"getDayBtnCssClass(day)\"\n                    class=\"dp-calendar-day\"\n                    type=\"button\">\n            </button>\n          }\n        </div>\n      }\n    </div>\n  </div>\n}\n\n@if (currentCalendarMode() === CalendarMode.Month) {\n  <dp-month-calendar\n    (onLeftNav)=\"onMonthCalendarLeftClick($event)\"\n    (onLeftSecondaryNav)=\"onMonthCalendarSecondaryLeftClick($event)\"\n    (onNavHeaderBtnClick)=\"toggleCalendarMode(CalendarMode.Day)\"\n    (onRightNav)=\"onMonthCalendarRightClick($event)\"\n    (onRightSecondaryNav)=\"onMonthCalendarSecondaryRightClick($event)\"\n    (onSelect)=\"monthSelected($event)\"\n    [config]=\"monthCalendarConfig()\"\n    [displayDate]=\"currentDateView()\"\n    [theme]=\"theme() || ''\">\n  </dp-month-calendar>\n}\n", styles: ["dp-day-calendar{display:inline-block}dp-day-calendar .dp-day-calendar-container{background:#fff}dp-day-calendar .dp-calendar-wrapper{box-sizing:border-box}dp-day-calendar .dp-calendar-wrapper .dp-calendar-weekday:first-child{border-left:none}dp-day-calendar .dp-weekdays{font-size:15px;margin-bottom:5px}dp-day-calendar .dp-calendar-weekday{box-sizing:border-box;display:inline-block;width:30px;text-align:center;border-left:1px solid #000000;border-bottom:1px solid #000000}dp-day-calendar .dp-calendar-day{box-sizing:border-box;width:30px;height:30px;cursor:pointer}dp-day-calendar .dp-selected{background:#106cc880;color:#fff}dp-day-calendar .dp-prev-month,dp-day-calendar .dp-next-month{opacity:.5}dp-day-calendar .dp-hide-near-month .dp-prev-month,dp-day-calendar .dp-hide-near-month .dp-next-month{visibility:hidden}dp-day-calendar .dp-week-number{position:absolute;font-size:9px}dp-day-calendar.dp-material .dp-calendar-weekday{height:25px;width:30px;line-height:25px;color:#106cc880;border:none;font-size:.75rem;opacity:.6}dp-day-calendar.dp-material .dp-calendar-weekday:last-child{color:red}dp-day-calendar.dp-material .dp-calendar-wrapper{padding:20px}dp-day-calendar.dp-material .dp-calendar-wrapper.rtl{direction:rtl}dp-day-calendar.dp-material .dp-calendar-month,dp-day-calendar.dp-material .dp-calendar-day{box-sizing:border-box;background:#fff;border-radius:0%;transition:border-radius .1s ease;border:none;outline:none;padding:0}dp-day-calendar.dp-material .dp-calendar-month:hover,dp-day-calendar.dp-material .dp-calendar-day:hover{background:#e0e0e0;border-radius:50%}dp-day-calendar.dp-material .dp-selected{border-radius:50%;background:#106cc880;color:#fff}dp-day-calendar.dp-material .dp-selected:hover{background:#106cc880}dp-day-calendar.dp-material .dp-current-day{border-radius:50%;border:1px solid rgba(16,108,200,.5)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: CalendarNavComponent, selector: "dp-calendar-nav", inputs: ["label", "isLabelClickable", "showLeftNav", "showLeftSecondaryNav", "showRightNav", "showRightSecondaryNav", "leftNavDisabled", "leftSecondaryNavDisabled", "rightNavDisabled", "rightSecondaryNavDisabled", "showGoToCurrent", "theme"], outputs: ["onLeftNav", "onLeftSecondaryNav", "onRightNav", "onRightSecondaryNav", "onLabelClick", "onGoToCurrent"] }, { kind: "component", type: MonthCalendarComponent, selector: "dp-month-calendar", inputs: ["config", "displayDate", "minDate", "maxDate", "theme"], outputs: ["onSelect", "onNavHeaderBtnClick", "onGoToCurrent", "onLeftNav", "onRightNav", "onLeftSecondaryNav", "onRightSecondaryNav"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayCalendarComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dp-day-calendar', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        CommonModule,
                        NgClass,
                        CalendarNavComponent,
                        MonthCalendarComponent
                    ], providers: [
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
                    ], template: "@if (currentCalendarMode() === CalendarMode.Day) {\n  <div class=\"dp-day-calendar-container\">\n    <dp-calendar-nav\n      (onGoToCurrent)=\"goToCurrent()\"\n      (onLabelClick)=\"toggleCalendarMode(CalendarMode.Month)\"\n      (onLeftNav)=\"onLeftNavClick()\"\n      (onRightNav)=\"onRightNavClick()\"\n      [isLabelClickable]=\"componentConfig().enableMonthSelector || false\"\n      [label]=\"navLabel()\"\n      [showGoToCurrent]=\"shouldShowCurrent()\"\n      [showLeftNav]=\"showLeftNav()\"\n      [showRightNav]=\"showRightNav()\"\n      [theme]=\"theme() || ''\">\n    </dp-calendar-nav>\n\n    <div [ngClass]=\"{'dp-hide-near-month': !componentConfig().showNearMonthDays, 'rtl': isFarsi()}\"\n         class=\"dp-calendar-wrapper\">\n      <div class=\"dp-weekdays\">\n        @for (weekday of weekdays(); track weekday) {\n          <span [innerText]=\"getWeekdayName(weekday)\"\n                class=\"dp-calendar-weekday\">\n          </span>\n        }\n      </div>\n      @for (week of weeks(); track week) {\n        <div class=\"dp-calendar-week\">\n          @if (componentConfig().showWeekNumbers) {\n            <span [innerText]=\"week[0].date.isoWeek()\"\n                  class=\"dp-week-number\">\n            </span>\n          }\n          @for (day of week; track day.date.valueOf()) {\n            <button (click)=\"dayClicked(day)\"\n                    [attr.data-date]=\"day.date.format(componentConfig().format)\"\n                    [disabled]=\"day.disabled\"\n                    [innerText]=\"getDayBtnText(day)\"\n                    [ngClass]=\"getDayBtnCssClass(day)\"\n                    class=\"dp-calendar-day\"\n                    type=\"button\">\n            </button>\n          }\n        </div>\n      }\n    </div>\n  </div>\n}\n\n@if (currentCalendarMode() === CalendarMode.Month) {\n  <dp-month-calendar\n    (onLeftNav)=\"onMonthCalendarLeftClick($event)\"\n    (onLeftSecondaryNav)=\"onMonthCalendarSecondaryLeftClick($event)\"\n    (onNavHeaderBtnClick)=\"toggleCalendarMode(CalendarMode.Day)\"\n    (onRightNav)=\"onMonthCalendarRightClick($event)\"\n    (onRightSecondaryNav)=\"onMonthCalendarSecondaryRightClick($event)\"\n    (onSelect)=\"monthSelected($event)\"\n    [config]=\"monthCalendarConfig()\"\n    [displayDate]=\"currentDateView()\"\n    [theme]=\"theme() || ''\">\n  </dp-month-calendar>\n}\n", styles: ["dp-day-calendar{display:inline-block}dp-day-calendar .dp-day-calendar-container{background:#fff}dp-day-calendar .dp-calendar-wrapper{box-sizing:border-box}dp-day-calendar .dp-calendar-wrapper .dp-calendar-weekday:first-child{border-left:none}dp-day-calendar .dp-weekdays{font-size:15px;margin-bottom:5px}dp-day-calendar .dp-calendar-weekday{box-sizing:border-box;display:inline-block;width:30px;text-align:center;border-left:1px solid #000000;border-bottom:1px solid #000000}dp-day-calendar .dp-calendar-day{box-sizing:border-box;width:30px;height:30px;cursor:pointer}dp-day-calendar .dp-selected{background:#106cc880;color:#fff}dp-day-calendar .dp-prev-month,dp-day-calendar .dp-next-month{opacity:.5}dp-day-calendar .dp-hide-near-month .dp-prev-month,dp-day-calendar .dp-hide-near-month .dp-next-month{visibility:hidden}dp-day-calendar .dp-week-number{position:absolute;font-size:9px}dp-day-calendar.dp-material .dp-calendar-weekday{height:25px;width:30px;line-height:25px;color:#106cc880;border:none;font-size:.75rem;opacity:.6}dp-day-calendar.dp-material .dp-calendar-weekday:last-child{color:red}dp-day-calendar.dp-material .dp-calendar-wrapper{padding:20px}dp-day-calendar.dp-material .dp-calendar-wrapper.rtl{direction:rtl}dp-day-calendar.dp-material .dp-calendar-month,dp-day-calendar.dp-material .dp-calendar-day{box-sizing:border-box;background:#fff;border-radius:0%;transition:border-radius .1s ease;border:none;outline:none;padding:0}dp-day-calendar.dp-material .dp-calendar-month:hover,dp-day-calendar.dp-material .dp-calendar-day:hover{background:#e0e0e0;border-radius:50%}dp-day-calendar.dp-material .dp-selected{border-radius:50%;background:#106cc880;color:#fff}dp-day-calendar.dp-material .dp-selected:hover{background:#106cc880}dp-day-calendar.dp-material .dp-current-day{border-radius:50%;border:1px solid rgba(16,108,200,.5)}\n"] }]
        }], ctorParameters: () => [{ type: DayCalendarService }, { type: UtilsService }, { type: i0.ChangeDetectorRef }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: false }] }], displayDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "displayDate", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], theme: [{ type: i0.Input, args: [{ isSignal: true, alias: "theme", required: false }] }], themeClass: [{
                type: HostBinding,
                args: ['class']
            }], onSelect: [{ type: i0.Output, args: ["onSelect"] }], onMonthSelect: [{ type: i0.Output, args: ["onMonthSelect"] }], onNavHeaderBtnClick: [{ type: i0.Output, args: ["onNavHeaderBtnClick"] }], onGoToCurrent: [{ type: i0.Output, args: ["onGoToCurrent"] }], onLeftNav: [{ type: i0.Output, args: ["onLeftNav"] }], onRightNav: [{ type: i0.Output, args: ["onRightNav"] }], onLeftSecondaryNav: [{ type: i0.Output, args: ["onLeftSecondaryNav"] }], onRightSecondaryNav: [{ type: i0.Output, args: ["onRightSecondaryNav"] }] } });

/* eslint-disable */
// @ts-nocheck
const moment$4 = momentNs;
const FIRST_PM_HOUR = 12;
class TimeSelectService {
    constructor(utilsService) {
        this.utilsService = utilsService;
        this.DEFAULT_CONFIG = {
            hours12Format: 'hh',
            hours24Format: 'HH',
            meridiemFormat: 'A',
            minutesFormat: 'mm',
            minutesInterval: 1,
            secondsFormat: 'ss',
            secondsInterval: 1,
            showSeconds: false,
            showTwentyFourHours: false,
            timeSeparator: ':',
            locale: 'fa'
        };
    }
    getConfig(config) {
        const timeConfigs = {
            maxTime: this.utilsService.onlyTime((config && config.maxTime)),
            minTime: this.utilsService.onlyTime((config && config.minTime))
        };
        const _config = {
            ...this.DEFAULT_CONFIG,
            ...this.utilsService.clearUndefined(config),
            ...timeConfigs
        };
        // moment.locale(_config.locale);
        return _config;
    }
    getTimeFormat(config) {
        return (config.showTwentyFourHours ? config.hours24Format : config.hours12Format)
            + config.timeSeparator + config.minutesFormat
            + (config.showSeconds ? (config.timeSeparator + config.secondsFormat) : '')
            + (config.showTwentyFourHours ? '' : ' ' + config.meridiemFormat);
    }
    getHours(config, t) {
        const time = t || moment$4();
        return time && time.format(config.showTwentyFourHours ? config.hours24Format : config.hours12Format);
    }
    getMinutes(config, t) {
        const time = t || moment$4();
        return time && time.format(config.minutesFormat);
    }
    getSeconds(config, t) {
        const time = t || moment$4();
        return time && time.format(config.secondsFormat);
    }
    getMeridiem(config, time) {
        if (config.locale) {
            time.locale(config.locale);
        }
        return time && time.format(config.meridiemFormat);
    }
    decrease(config, time, unit) {
        let amount = 1;
        switch (unit) {
            case 'minute':
                amount = config.minutesInterval;
                break;
            case 'second':
                amount = config.secondsInterval;
                break;
        }
        return time.clone().subtract(amount, unit);
    }
    increase(config, time, unit) {
        let amount = 1;
        switch (unit) {
            case 'minute':
                amount = config.minutesInterval;
                break;
            case 'second':
                amount = config.secondsInterval;
                break;
        }
        return time.clone().add(amount, unit);
    }
    toggleMeridiem(time) {
        if (time.hours() < FIRST_PM_HOUR) {
            return time.clone().add(12, 'hour');
        }
        else {
            return time.clone().subtract(12, 'hour');
        }
    }
    shouldShowDecrease(config, time, unit) {
        if (!config.min && !config.minTime) {
            return true;
        }
        const newTime = this.decrease(config, time, unit);
        return (!config.min || config.min.isSameOrBefore(newTime))
            && (!config.minTime || config.minTime.isSameOrBefore(this.utilsService.onlyTime(newTime)));
    }
    shouldShowIncrease(config, time, unit) {
        if (!config.max && !config.maxTime) {
            return true;
        }
        const newTime = this.increase(config, time, unit);
        return (!config.max || config.max.isSameOrAfter(newTime))
            && (!config.maxTime || config.maxTime.isSameOrAfter(this.utilsService.onlyTime(newTime)));
    }
    shouldShowToggleMeridiem(config, time) {
        if (!config.min && !config.max && !config.minTime && !config.maxTime) {
            return true;
        }
        const newTime = this.toggleMeridiem(time);
        return (!config.max || config.max.isSameOrAfter(newTime))
            && (!config.min || config.min.isSameOrBefore(newTime))
            && (!config.maxTime || config.maxTime.isSameOrAfter(this.utilsService.onlyTime(newTime)))
            && (!config.minTime || config.minTime.isSameOrBefore(this.utilsService.onlyTime(newTime)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: TimeSelectService, deps: [{ token: UtilsService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: TimeSelectService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: TimeSelectService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: UtilsService }] });

/* eslint-disable */
// @ts-nocheck
const moment$3 = momentNs;
const DAY_FORMAT = 'YYYYMMDD';
const TIME_FORMAT = 'HH:mm:ss';
const COMBINED_FORMAT = DAY_FORMAT + TIME_FORMAT;
class DayTimeCalendarService {
    constructor(utilsService, dayCalendarService, timeSelectService) {
        this.utilsService = utilsService;
        this.dayCalendarService = dayCalendarService;
        this.timeSelectService = timeSelectService;
        this.DEFAULT_CONFIG = {
            locale: 'fa'
        };
    }
    getConfig(config) {
        const _config = {
            ...this.DEFAULT_CONFIG,
            ...this.timeSelectService.getConfig(config),
            ...this.dayCalendarService.getConfig(config)
        };
        // moment.locale(config.locale);
        return _config;
    }
    updateDay(current, day, config) {
        const time = current ? current : moment$3();
        let updated = moment$3.from(day.format(DAY_FORMAT) + time.format(TIME_FORMAT), day.locale(), COMBINED_FORMAT);
        if (config.min) {
            const min = config.min;
            updated = min.isAfter(updated) ? min : updated;
        }
        if (config.max) {
            const max = config.max;
            updated = max.isBefore(updated) ? max : updated;
        }
        return updated;
    }
    updateTime(current, time) {
        const day = current ? current : moment$3();
        return moment$3.from(day.format(DAY_FORMAT) + time.format(TIME_FORMAT), day.locale(), COMBINED_FORMAT);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayTimeCalendarService, deps: [{ token: UtilsService }, { token: DayCalendarService }, { token: TimeSelectService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayTimeCalendarService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayTimeCalendarService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: UtilsService }, { type: DayCalendarService }, { type: TimeSelectService }] });

const moment$2 = momentNs;
class TimeSelectComponent {
    constructor(timeSelectService, utilsService, cd) {
        this.timeSelectService = timeSelectService;
        this.utilsService = utilsService;
        this.cd = cd;
        this.onChange = new EventEmitter();
        this.onConfirm = new EventEmitter();
        this.isInited = false;
        this.api = {
            triggerChange: this.emitChange.bind(this)
        };
    }
    get selected() {
        return this._selected;
    }
    set selected(selected) {
        this._selected = selected;
        this.calculateTimeParts(this.selected);
        this.showDecHour = this.timeSelectService.shouldShowDecrease(this.componentConfig, this._selected, 'hour');
        this.showDecMinute = this.timeSelectService.shouldShowDecrease(this.componentConfig, this._selected, 'minute');
        this.showDecSecond = this.timeSelectService.shouldShowDecrease(this.componentConfig, this._selected, 'second');
        this.showIncHour = this.timeSelectService.shouldShowIncrease(this.componentConfig, this._selected, 'hour');
        this.showIncMinute = this.timeSelectService.shouldShowIncrease(this.componentConfig, this._selected, 'minute');
        this.showIncSecond = this.timeSelectService.shouldShowIncrease(this.componentConfig, this._selected, 'second');
        this.showToggleMeridiem = this.timeSelectService.shouldShowToggleMeridiem(this.componentConfig, this._selected);
        this.onChangeCallback(this.processOnChangeCallback(selected));
    }
    ngOnInit() {
        this.isInited = true;
        this.init();
        this.initValidators();
    }
    init() {
        this.componentConfig = this.timeSelectService.getConfig(this.config);
        this.selected = this.selected || moment$2();
        this.inputValueType = this.utilsService.getInputType(this.inputValue, false);
    }
    ngOnChanges(changes) {
        if (this.isInited) {
            const { minDate, maxDate, minTime, maxTime } = changes;
            this.init();
            if (minDate || maxDate || minTime || maxTime) {
                this.initValidators();
            }
        }
    }
    writeValue(value) {
        this.inputValue = value;
        if (value) {
            const momentValue = this.utilsService
                .convertToMomentArray(value, this.timeSelectService.getTimeFormat(this.componentConfig), false, this.componentConfig.locale)[0];
            if (momentValue.isValid()) {
                this.selected = momentValue;
                this.inputValueType = this.utilsService
                    .getInputType(this.inputValue, false);
            }
        }
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    onChangeCallback(_) {
    }
    ;
    registerOnTouched(fn) {
    }
    validate(formControl) {
        if (this.minDate || this.maxDate || this.minTime || this.maxTime) {
            return this.validateFn(formControl.value);
        }
        else {
            return () => null;
        }
    }
    processOnChangeCallback(value) {
        return this.utilsService.convertFromMomentArray(this.timeSelectService.getTimeFormat(this.componentConfig), [value], this.componentConfig.returnedValueType || this.inputValueType, this.componentConfig.locale);
    }
    initValidators() {
        this.validateFn = this.utilsService.createValidator({
            minDate: this.minDate,
            maxDate: this.maxDate,
            minTime: this.minTime,
            maxTime: this.maxTime
        }, undefined, 'day', this.componentConfig.locale);
        this.onChangeCallback(this.processOnChangeCallback(this.selected));
    }
    decrease(unit) {
        this.selected = this.timeSelectService.decrease(this.componentConfig, this.selected, unit);
        this.emitChange();
    }
    increase(unit) {
        this.selected = this.timeSelectService.increase(this.componentConfig, this.selected, unit);
        this.emitChange();
    }
    toggleMeridiem() {
        this.selected = this.timeSelectService.toggleMeridiem(this.selected);
        this.emitChange();
    }
    emitChange() {
        this.onChange.emit({ date: this.selected, selected: false });
        this.cd.markForCheck();
    }
    calculateTimeParts(time) {
        this.hours = this.timeSelectService.getHours(this.componentConfig, time);
        this.minutes = this.timeSelectService.getMinutes(this.componentConfig, time);
        this.seconds = this.timeSelectService.getSeconds(this.componentConfig, time);
        this.meridiem = this.timeSelectService.getMeridiem(this.componentConfig, time);
    }
    confirmSelection() {
        this.onConfirm.emit({ date: this.selected, selected: true });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: TimeSelectComponent, deps: [{ token: TimeSelectService }, { token: UtilsService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.5", type: TimeSelectComponent, isStandalone: true, selector: "dp-time-select", inputs: { config: "config", displayDate: "displayDate", minDate: "minDate", maxDate: "maxDate", minTime: "minTime", maxTime: "maxTime", theme: "theme" }, outputs: { onChange: "onChange", onConfirm: "onConfirm" }, host: { properties: { "class": "this.theme" } }, providers: [
            TimeSelectService,
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => TimeSelectComponent),
                multi: true
            },
            {
                provide: NG_VALIDATORS,
                useExisting: forwardRef(() => TimeSelectComponent),
                multi: true
            }
        ], usesOnChanges: true, ngImport: i0, template: "<ul class=\"dp-time-select-controls\">\r\n  <li class=\"dp-time-select-control\">\r\n    <button class=\"dp-time-btn\" (click)=\"confirmSelection()\">\u062A\u0627\u06CC\u06CC\u062F</button>\r\n  </li>\r\n  <li class=\"dp-time-select-control dp-time-select-control-hours\">\r\n    <button (click)=\"increase('hour')\"\r\n            [disabled]=\"!showIncHour\"\r\n            class=\"dp-time-select-control-up\"\r\n            type=\"button\">\r\n    </button>\r\n    <span [innerText]=\"hours\"\r\n          class=\"dp-time-select-display-hours\">\r\n    </span>\r\n    <button (click)=\"decrease('hour')\"\r\n            [disabled]=\"!showDecHour\"\r\n            class=\"dp-time-select-control-down\"\r\n            type=\"button\"></button>\r\n  </li>\r\n  <li [innerText]=\"componentConfig.timeSeparator\"\r\n      class=\"dp-time-select-control dp-time-select-separator\">\r\n  </li>\r\n  <li class=\"dp-time-select-control dp-time-select-control-minutes\">\r\n    <button (click)=\"increase('minute')\"\r\n            [disabled]=\"!showIncMinute\"\r\n            class=\"dp-time-select-control-up\"\r\n            type=\"button\"></button>\r\n    <span [innerText]=\"minutes\"\r\n          class=\"dp-time-select-display-minutes\">\r\n    </span>\r\n    <button (click)=\"decrease('minute')\"\r\n            [disabled]=\"!showDecMinute\" class=\"dp-time-select-control-down\"\r\n            type=\"button\"></button>\r\n  </li>\r\n  <ng-container *ngIf=\"componentConfig.showSeconds\">\r\n    <li [innerText]=\"componentConfig.timeSeparator\"\r\n        class=\"dp-time-select-control dp-time-select-separator\">\r\n    </li>\r\n    <li class=\"dp-time-select-control dp-time-select-control-seconds\">\r\n      <button (click)=\"increase('second')\"\r\n              [disabled]=\"!showIncSecond\"\r\n              class=\"dp-time-select-control-up\"\r\n              type=\"button\"></button>\r\n      <span [innerText]=\"seconds\"\r\n            class=\"dp-time-select-display-seconds\">\r\n      </span>\r\n      <button (click)=\"decrease('second')\"\r\n              [disabled]=\"!showDecSecond\"\r\n              class=\"dp-time-select-control-down\"\r\n              type=\"button\"></button>\r\n    </li>\r\n  </ng-container>\r\n  <li *ngIf=\"!componentConfig.showTwentyFourHours\" class=\"dp-time-select-control dp-time-select-control-meridiem\">\r\n    <button (click)=\"toggleMeridiem()\"\r\n            [disabled]=\"!showToggleMeridiem\"\r\n            class=\"dp-time-select-control-up\"\r\n            type=\"button\"></button>\r\n    <span [innerText]=\"meridiem\"\r\n          class=\"dp-time-select-display-meridiem\">\r\n    </span>\r\n    <button (click)=\"toggleMeridiem()\"\r\n            [disabled]=\"!showToggleMeridiem\"\r\n            class=\"dp-time-select-control-down\"\r\n            type=\"button\"></button>\r\n  </li>\r\n</ul>\r\n", styles: [".dp-time-btn{padding:6px 8px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;font-size:12px}.dp-time-btn:hover{background:#f5f5f5}dp-time-select{display:inline-block}dp-time-select .dp-time-select-controls{margin:0;padding:0;text-align:center;line-height:normal;background:#fff}dp-time-select .dp-time-select-control{display:inline-block;margin:0 auto;vertical-align:middle;font-size:inherit;letter-spacing:1px}dp-time-select .dp-time-select-control-up,dp-time-select .dp-time-select-control-down{position:relative;display:block;width:24px;height:24px;margin:3px auto;cursor:pointer;color:#e0e0e0}dp-time-select .dp-time-select-control-up:before,dp-time-select .dp-time-select-control-down:before{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(0)}dp-time-select .dp-time-select-control-up:before{transform:rotate(-45deg);top:4px}dp-time-select .dp-time-select-control-down:before{transform:rotate(135deg)}dp-time-select .dp-time-select-separator{width:5px}dp-time-select.dp-material .dp-time-select-control-up,dp-time-select.dp-material .dp-time-select-control-down{box-sizing:border-box;background:transparent;border:none;outline:none;border-radius:50%}dp-time-select.dp-material .dp-time-select-control-up:before,dp-time-select.dp-material .dp-time-select-control-down:before{left:0}dp-time-select.dp-material .dp-time-select-control-up:hover,dp-time-select.dp-material .dp-time-select-control-down:hover{background:#e0e0e0;color:#fff}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: TimeSelectComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dp-time-select', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        CommonModule,
                        NgIf
                    ], providers: [
                        TimeSelectService,
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => TimeSelectComponent),
                            multi: true
                        },
                        {
                            provide: NG_VALIDATORS,
                            useExisting: forwardRef(() => TimeSelectComponent),
                            multi: true
                        }
                    ], template: "<ul class=\"dp-time-select-controls\">\r\n  <li class=\"dp-time-select-control\">\r\n    <button class=\"dp-time-btn\" (click)=\"confirmSelection()\">\u062A\u0627\u06CC\u06CC\u062F</button>\r\n  </li>\r\n  <li class=\"dp-time-select-control dp-time-select-control-hours\">\r\n    <button (click)=\"increase('hour')\"\r\n            [disabled]=\"!showIncHour\"\r\n            class=\"dp-time-select-control-up\"\r\n            type=\"button\">\r\n    </button>\r\n    <span [innerText]=\"hours\"\r\n          class=\"dp-time-select-display-hours\">\r\n    </span>\r\n    <button (click)=\"decrease('hour')\"\r\n            [disabled]=\"!showDecHour\"\r\n            class=\"dp-time-select-control-down\"\r\n            type=\"button\"></button>\r\n  </li>\r\n  <li [innerText]=\"componentConfig.timeSeparator\"\r\n      class=\"dp-time-select-control dp-time-select-separator\">\r\n  </li>\r\n  <li class=\"dp-time-select-control dp-time-select-control-minutes\">\r\n    <button (click)=\"increase('minute')\"\r\n            [disabled]=\"!showIncMinute\"\r\n            class=\"dp-time-select-control-up\"\r\n            type=\"button\"></button>\r\n    <span [innerText]=\"minutes\"\r\n          class=\"dp-time-select-display-minutes\">\r\n    </span>\r\n    <button (click)=\"decrease('minute')\"\r\n            [disabled]=\"!showDecMinute\" class=\"dp-time-select-control-down\"\r\n            type=\"button\"></button>\r\n  </li>\r\n  <ng-container *ngIf=\"componentConfig.showSeconds\">\r\n    <li [innerText]=\"componentConfig.timeSeparator\"\r\n        class=\"dp-time-select-control dp-time-select-separator\">\r\n    </li>\r\n    <li class=\"dp-time-select-control dp-time-select-control-seconds\">\r\n      <button (click)=\"increase('second')\"\r\n              [disabled]=\"!showIncSecond\"\r\n              class=\"dp-time-select-control-up\"\r\n              type=\"button\"></button>\r\n      <span [innerText]=\"seconds\"\r\n            class=\"dp-time-select-display-seconds\">\r\n      </span>\r\n      <button (click)=\"decrease('second')\"\r\n              [disabled]=\"!showDecSecond\"\r\n              class=\"dp-time-select-control-down\"\r\n              type=\"button\"></button>\r\n    </li>\r\n  </ng-container>\r\n  <li *ngIf=\"!componentConfig.showTwentyFourHours\" class=\"dp-time-select-control dp-time-select-control-meridiem\">\r\n    <button (click)=\"toggleMeridiem()\"\r\n            [disabled]=\"!showToggleMeridiem\"\r\n            class=\"dp-time-select-control-up\"\r\n            type=\"button\"></button>\r\n    <span [innerText]=\"meridiem\"\r\n          class=\"dp-time-select-display-meridiem\">\r\n    </span>\r\n    <button (click)=\"toggleMeridiem()\"\r\n            [disabled]=\"!showToggleMeridiem\"\r\n            class=\"dp-time-select-control-down\"\r\n            type=\"button\"></button>\r\n  </li>\r\n</ul>\r\n", styles: [".dp-time-btn{padding:6px 8px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;font-size:12px}.dp-time-btn:hover{background:#f5f5f5}dp-time-select{display:inline-block}dp-time-select .dp-time-select-controls{margin:0;padding:0;text-align:center;line-height:normal;background:#fff}dp-time-select .dp-time-select-control{display:inline-block;margin:0 auto;vertical-align:middle;font-size:inherit;letter-spacing:1px}dp-time-select .dp-time-select-control-up,dp-time-select .dp-time-select-control-down{position:relative;display:block;width:24px;height:24px;margin:3px auto;cursor:pointer;color:#e0e0e0}dp-time-select .dp-time-select-control-up:before,dp-time-select .dp-time-select-control-down:before{position:relative;content:\"\";display:inline-block;height:8px;width:8px;vertical-align:baseline;border-style:solid;border-width:2px 2px 0 0;transform:rotate(0)}dp-time-select .dp-time-select-control-up:before{transform:rotate(-45deg);top:4px}dp-time-select .dp-time-select-control-down:before{transform:rotate(135deg)}dp-time-select .dp-time-select-separator{width:5px}dp-time-select.dp-material .dp-time-select-control-up,dp-time-select.dp-material .dp-time-select-control-down{box-sizing:border-box;background:transparent;border:none;outline:none;border-radius:50%}dp-time-select.dp-material .dp-time-select-control-up:before,dp-time-select.dp-material .dp-time-select-control-down:before{left:0}dp-time-select.dp-material .dp-time-select-control-up:hover,dp-time-select.dp-material .dp-time-select-control-down:hover{background:#e0e0e0;color:#fff}\n"] }]
        }], ctorParameters: () => [{ type: TimeSelectService }, { type: UtilsService }, { type: i0.ChangeDetectorRef }], propDecorators: { config: [{
                type: Input
            }], displayDate: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], minTime: [{
                type: Input
            }], maxTime: [{
                type: Input
            }], theme: [{
                type: HostBinding,
                args: ['class']
            }, {
                type: Input
            }], onChange: [{
                type: Output
            }], onConfirm: [{
                type: Output
            }] } });

class DayTimeCalendarComponent {
    constructor(dayTimeCalendarService, utilsService, cd) {
        this.dayTimeCalendarService = dayTimeCalendarService;
        this.utilsService = utilsService;
        this.cd = cd;
        this.onChange = new EventEmitter();
        this.onGoToCurrent = new EventEmitter();
        this.onLeftNav = new EventEmitter();
        this.onRightNav = new EventEmitter();
        this.isInited = false;
        this.api = {
            moveCalendarTo: this.moveCalendarTo.bind(this)
        };
    }
    get selected() {
        return this._selected;
    }
    set selected(selected) {
        this._selected = selected;
        this.onChangeCallback(this.processOnChangeCallback(selected));
    }
    ngOnInit() {
        this.isInited = true;
        this.init();
        this.initValidators();
    }
    init() {
        this.componentConfig = this.dayTimeCalendarService.getConfig(this.config);
        this.inputValueType = this.utilsService.getInputType(this.inputValue, false);
    }
    ngOnChanges(changes) {
        if (this.isInited) {
            const { minDate, maxDate } = changes;
            this.init();
            if (minDate || maxDate) {
                this.initValidators();
            }
        }
    }
    writeValue(value) {
        this.inputValue = value;
        if (value) {
            this.selected = this.utilsService
                .convertToMomentArray(value, this.componentConfig.format, false, this.componentConfig.locale)[0];
            this.inputValueType = this.utilsService
                .getInputType(this.inputValue, false);
        }
        else {
            this.selected = null;
        }
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    onChangeCallback(_) {
    }
    ;
    registerOnTouched(fn) {
    }
    validate(formControl) {
        if (this.minDate || this.maxDate) {
            return this.validateFn(formControl.value);
        }
        else {
            return () => null;
        }
    }
    processOnChangeCallback(value) {
        return this.utilsService.convertFromMomentArray(this.componentConfig.format, [value], this.componentConfig.returnedValueType || this.inputValueType, this.componentConfig.locale);
    }
    initValidators() {
        this.validateFn = this.utilsService.createValidator({
            minDate: this.minDate,
            maxDate: this.maxDate
        }, undefined, 'daytime', this.componentConfig.locale);
        this.onChangeCallback(this.processOnChangeCallback(this.selected));
    }
    dateSelected(day) {
        this.selected = this.dayTimeCalendarService.updateDay(this.selected, day.date, this.config);
    }
    timeChange(time) {
        this.selected = this.dayTimeCalendarService.updateTime(this.selected, time.date);
    }
    emitChange() {
        this.onChange.emit({ date: this.selected, selected: false });
    }
    moveCalendarTo(to) {
        if (to) {
            this.dayCalendarRef.moveCalendarTo(to);
        }
    }
    onLeftNavClick(change) {
        this.onLeftNav.emit(change);
    }
    onRightNavClick(change) {
        this.onRightNav.emit(change);
    }
    timeConfirm(time) {
        this.selected = this.dayTimeCalendarService.updateTime(this.selected, time.date);
        this.emitChange();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayTimeCalendarComponent, deps: [{ token: DayTimeCalendarService }, { token: UtilsService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.5", type: DayTimeCalendarComponent, isStandalone: true, selector: "dp-day-time-calendar", inputs: { config: "config", displayDate: "displayDate", minDate: "minDate", maxDate: "maxDate", theme: "theme" }, outputs: { onChange: "onChange", onGoToCurrent: "onGoToCurrent", onLeftNav: "onLeftNav", onRightNav: "onRightNav" }, host: { properties: { "class": "this.theme" } }, providers: [
            DayTimeCalendarService,
            DayCalendarService,
            TimeSelectService,
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => DayTimeCalendarComponent),
                multi: true
            },
            {
                provide: NG_VALIDATORS,
                useExisting: forwardRef(() => DayTimeCalendarComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "dayCalendarRef", first: true, predicate: ["dayCalendar"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<dp-day-calendar #dayCalendar\r\n                 (onGoToCurrent)=\"onGoToCurrent.emit()\"\r\n                 (onLeftNav)=\"onLeftNavClick($event)\"\r\n                 (onRightNav)=\"onRightNavClick($event)\"\r\n                 (onSelect)=\"dateSelected($event)\"\r\n                 [config]=\"componentConfig\"\r\n                 [displayDate]=\"displayDate\"\r\n                 [ngModel]=\"_selected\"\r\n                 [theme]=\"theme\">\r\n</dp-day-calendar>\r\n<dp-time-select #timeSelect\r\n                (onChange)=\"timeChange($event)\"\r\n                (onConfirm)=\"timeConfirm($event)\"\r\n                [config]=\"componentConfig\"\r\n                [ngModel]=\"_selected\"\r\n                [theme]=\"theme\">\r\n</dp-time-select>\r\n", styles: ["dp-day-time-calendar{display:inline-block}dp-day-time-calendar dp-time-select{display:block;border-top:0}dp-day-time-calendar.dp-material dp-time-select{border-top:0}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "component", type: DayCalendarComponent, selector: "dp-day-calendar", inputs: ["config", "displayDate", "minDate", "maxDate", "theme"], outputs: ["onSelect", "onMonthSelect", "onNavHeaderBtnClick", "onGoToCurrent", "onLeftNav", "onRightNav", "onLeftSecondaryNav", "onRightSecondaryNav"] }, { kind: "component", type: TimeSelectComponent, selector: "dp-time-select", inputs: ["config", "displayDate", "minDate", "maxDate", "minTime", "maxTime", "theme"], outputs: ["onChange", "onConfirm"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i5.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i5.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DayTimeCalendarComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dp-day-time-calendar', changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, imports: [
                        CommonModule,
                        DayCalendarComponent,
                        TimeSelectComponent,
                        FormsModule
                    ], providers: [
                        DayTimeCalendarService,
                        DayCalendarService,
                        TimeSelectService,
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => DayTimeCalendarComponent),
                            multi: true
                        },
                        {
                            provide: NG_VALIDATORS,
                            useExisting: forwardRef(() => DayTimeCalendarComponent),
                            multi: true
                        }
                    ], template: "<dp-day-calendar #dayCalendar\r\n                 (onGoToCurrent)=\"onGoToCurrent.emit()\"\r\n                 (onLeftNav)=\"onLeftNavClick($event)\"\r\n                 (onRightNav)=\"onRightNavClick($event)\"\r\n                 (onSelect)=\"dateSelected($event)\"\r\n                 [config]=\"componentConfig\"\r\n                 [displayDate]=\"displayDate\"\r\n                 [ngModel]=\"_selected\"\r\n                 [theme]=\"theme\">\r\n</dp-day-calendar>\r\n<dp-time-select #timeSelect\r\n                (onChange)=\"timeChange($event)\"\r\n                (onConfirm)=\"timeConfirm($event)\"\r\n                [config]=\"componentConfig\"\r\n                [ngModel]=\"_selected\"\r\n                [theme]=\"theme\">\r\n</dp-time-select>\r\n", styles: ["dp-day-time-calendar{display:inline-block}dp-day-time-calendar dp-time-select{display:block;border-top:0}dp-day-time-calendar.dp-material dp-time-select{border-top:0}\n"] }]
        }], ctorParameters: () => [{ type: DayTimeCalendarService }, { type: UtilsService }, { type: i0.ChangeDetectorRef }], propDecorators: { config: [{
                type: Input
            }], displayDate: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], theme: [{
                type: HostBinding,
                args: ['class']
            }, {
                type: Input
            }], onChange: [{
                type: Output
            }], onGoToCurrent: [{
                type: Output
            }], onLeftNav: [{
                type: Output
            }], onRightNav: [{
                type: Output
            }], dayCalendarRef: [{
                type: ViewChild,
                args: ['dayCalendar']
            }] } });

/* eslint-disable */
// @ts-nocheck
const moment$1 = momentNs;
class DatePickerModalService {
    constructor(utilsService, timeSelectService, daytimeCalendarService) {
        this.utilsService = utilsService;
        this.timeSelectService = timeSelectService;
        this.daytimeCalendarService = daytimeCalendarService;
        this.onPickerClosed = new EventEmitter();
        this.defaultConfig = {
            closeOnSelect: true,
            closeOnSelectDelay: 100,
            format: 'YYYY-MM-D',
            openOnFocus: true,
            openOnClick: true,
            onOpenDelay: 0,
            disableKeypress: false,
            showNearMonthDays: true,
            showWeekNumbers: false,
            enableMonthSelector: true,
            showGoToCurrent: true,
            locale: 'fa',
            hideOnOutsideClick: true
        };
        this.gregorianExtensionConfig = {
            format: 'DD-MM-YYYY',
            locale: 'en'
        };
    }
    // todo:: add unit tests
    getConfig(config, mode = 'daytime') {
        const _config = {
            ...this.defaultConfig,
            ...((config && config.locale && config.locale !== 'fa') ? this.gregorianExtensionConfig : {}),
            format: this.getDefaultFormatByMode(mode, config),
            ...this.utilsService.clearUndefined(config)
        };
        this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max'], _config.locale);
        if (config && config.allowMultiSelect && config.closeOnSelect === undefined) {
            _config.closeOnSelect = false;
        }
        // moment.locale(_config.locale);
        return _config;
    }
    getDayConfigService(pickerConfig) {
        return {
            min: pickerConfig.min,
            max: pickerConfig.max,
            isDayDisabledCallback: pickerConfig.isDayDisabledCallback,
            weekDayFormat: pickerConfig.weekDayFormat,
            showNearMonthDays: pickerConfig.showNearMonthDays,
            showWeekNumbers: pickerConfig.showWeekNumbers,
            firstDayOfWeek: pickerConfig.firstDayOfWeek,
            format: pickerConfig.format,
            allowMultiSelect: pickerConfig.allowMultiSelect,
            monthFormat: pickerConfig.monthFormat,
            monthFormatter: pickerConfig.monthFormatter,
            enableMonthSelector: pickerConfig.enableMonthSelector,
            yearFormat: pickerConfig.yearFormat,
            yearFormatter: pickerConfig.yearFormatter,
            dayBtnFormat: pickerConfig.dayBtnFormat,
            dayBtnFormatter: pickerConfig.dayBtnFormatter,
            dayBtnCssClassCallback: pickerConfig.dayBtnCssClassCallback,
            monthBtnFormat: pickerConfig.monthBtnFormat,
            monthBtnFormatter: pickerConfig.monthBtnFormatter,
            monthBtnCssClassCallback: pickerConfig.monthBtnCssClassCallback,
            multipleYearsNavigateBy: pickerConfig.multipleYearsNavigateBy,
            showMultipleYearsNavigation: pickerConfig.showMultipleYearsNavigation,
            locale: pickerConfig.locale,
            returnedValueType: pickerConfig.returnedValueType,
            showGoToCurrent: pickerConfig.showGoToCurrent,
            unSelectOnClick: pickerConfig.unSelectOnClick
        };
    }
    getDayTimeConfigService(pickerConfig) {
        return this.daytimeCalendarService.getConfig(pickerConfig);
    }
    getTimeConfigService(pickerConfig) {
        return this.timeSelectService.getConfig(pickerConfig);
    }
    pickerClosed() {
        this.onPickerClosed.emit();
    }
    // todo:: add unit tests
    isValidInputDateValue(value, config) {
        value = value ? value : '';
        const datesStrArr = this.utilsService.datesStringToStringArray(value);
        return datesStrArr.every(date => this.utilsService.isDateValid(date, config.format, config.locale));
    }
    // todo:: add unit tests
    convertInputValueToMomentArray(value, config) {
        value = value ? value : '';
        const datesStrArr = this.utilsService.datesStringToStringArray(value);
        return this.utilsService.convertToMomentArray(datesStrArr, config.format, config.allowMultiSelect, config.locale);
    }
    getDefaultFormatByMode(mode, config) {
        let dateFormat = 'YYYY-MM-DD';
        let monthFormat = 'MMMM YY';
        const timeFormat = 'HH:mm:ss';
        if (config && config.locale && config.locale !== 'fa') {
            dateFormat = 'DD-MM-YYYY';
            monthFormat = 'MMM, YYYY';
        }
        switch (mode) {
            case 'day':
                return dateFormat;
            case 'daytime':
                return dateFormat + ' ' + timeFormat;
            case 'time':
                return timeFormat;
            case 'month':
                return monthFormat;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalService, deps: [{ token: UtilsService }, { token: TimeSelectService }, { token: DayTimeCalendarService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: UtilsService }, { type: TimeSelectService }, { type: DayTimeCalendarService }] });

const moment = momentNs;
class DatePickerModalComponent {
    get themeClass() {
        return this.theme() || '';
    }
    constructor(dayPickerService, domHelper, elemRef, renderer, utilsService, cd) {
        this.dayPickerService = dayPickerService;
        this.domHelper = domHelper;
        this.elemRef = elemRef;
        this.renderer = renderer;
        this.utilsService = utilsService;
        this.cd = cd;
        // Inputs
        this.config = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "config" }] : /* istanbul ignore next */ []));
        this.mode = input('day', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
        this.placeholder = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
        this.fontSize = input(23, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "fontSize" }] : /* istanbul ignore next */ []));
        this.disabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
        this.displayDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "displayDate" }] : /* istanbul ignore next */ []));
        this.theme = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "theme" }] : /* istanbul ignore next */ []));
        this.minDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "maxDate" }] : /* istanbul ignore next */ []));
        this.minTime = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "minTime" }] : /* istanbul ignore next */ []));
        this.maxTime = input(/* @ts-ignore */
        ...(ngDevMode ? [undefined, { debugName: "maxTime" }] : /* istanbul ignore next */ []));
        // Outputs
        this.onOpen = output({ alias: 'open' });
        this.onClose = output({ alias: 'close' });
        this.onChange = output();
        this.onGoToCurrent = output();
        this.onLeftNav = output();
        this.onRightNav = output();
        // ViewChilds
        this.calendarContainer = viewChild('container', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "calendarContainer" }] : /* istanbul ignore next */ []));
        this.dayCalendarRef = viewChild('dayCalendar', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "dayCalendarRef" }] : /* istanbul ignore next */ []));
        this.monthCalendarRef = viewChild('monthCalendar', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "monthCalendarRef" }] : /* istanbul ignore next */ []));
        this.dayTimeCalendarRef = viewChild('daytimeCalendar', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "dayTimeCalendarRef" }] : /* istanbul ignore next */ []));
        this.timeSelectRef = viewChild('timeSelect', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "timeSelectRef" }] : /* istanbul ignore next */ []));
        this.inputElementLabel = viewChild('inputElementLabel', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "inputElementLabel" }] : /* istanbul ignore next */ []));
        // Signals for state
        this.isInitialized = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isInitialized" }] : /* istanbul ignore next */ []));
        this.isModalOpen = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isModalOpen" }] : /* istanbul ignore next */ []));
        this.inputElementValue = signal('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "inputElementValue" }] : /* istanbul ignore next */ []));
        this.selected = signal([], /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
        this.currentDateView = signal(moment(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "currentDateView" }] : /* istanbul ignore next */ []));
        this.showMinDateIsNotValid = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showMinDateIsNotValid" }] : /* istanbul ignore next */ []));
        this.showMaxDateIsNotValid = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showMaxDateIsNotValid" }] : /* istanbul ignore next */ []));
        // Computeds
        this.componentConfig = computed(() => this.dayPickerService.getConfig(this.config() || {}, this.mode()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "componentConfig" }] : /* istanbul ignore next */ []));
        this.dayCalendarConfig = computed(() => this.dayPickerService.getDayConfigService(this.componentConfig()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "dayCalendarConfig" }] : /* istanbul ignore next */ []));
        this.dayTimeCalendarConfig = computed(() => this.dayPickerService.getDayTimeConfigService(this.componentConfig()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "dayTimeCalendarConfig" }] : /* istanbul ignore next */ []));
        this.timeSelectConfig = computed(() => this.dayPickerService.getTimeConfigService(this.componentConfig()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "timeSelectConfig" }] : /* istanbul ignore next */ []));
        this.inputValue = '';
        this.inputValueType = ECalendarValue.String;
        this.isFocusedTrigger = false;
        this.hideStateHelper = false;
        this.handleInnerElementClickUnlisteners = [];
        this.globalListnersUnlisteners = [];
        this.api = {
            open: this.showCalendars.bind(this),
            close: this.hideCalendar.bind(this),
            moveCalendarTo: this.moveCalendarTo.bind(this)
        };
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
            : this.utilsService.getDefaultDisplayDate(currentView, selected, !!config.allowMultiSelect, config.min, config.locale || 'fa');
        this.currentDateView.set(nextView);
        this.inputValueType = this.utilsService.getInputType(this.inputValue, !!config.allowMultiSelect);
    }
    initValidators() {
        const config = this.componentConfig();
        this.validateFn = this.utilsService.createValidator({
            minDate: this.minDate(),
            maxDate: this.maxDate(),
            minTime: this.minTime(),
            maxTime: this.maxTime()
        }, config.format || 'YYYY-MM-DD', this.mode(), config.locale || 'fa');
        this.onChangeCallback(this.processOnChangeCallback(this.selected()), false);
    }
    writeValue(value) {
        this.inputValue = value;
        const config = this.componentConfig();
        if (value || value === '') {
            const selectedMoments = this.utilsService.convertToMomentArray(value, config.format || 'YYYY-MM-DD', !!config.allowMultiSelect, config.locale || 'fa');
            this.selected.set(selectedMoments);
            if (selectedMoments.length) {
                const nextView = this.utilsService.getDefaultDisplayDate(this.currentDateView(), selectedMoments, !!config.allowMultiSelect, config.min, config.locale || 'fa');
                this.currentDateView.set(nextView);
            }
            this.updateInputElementValue(selectedMoments);
        }
        else {
            this.selected.set([]);
            this.inputElementValue.set('');
        }
        this.cd.markForCheck();
    }
    updateInputElementValue(selected) {
        const config = this.componentConfig();
        const val = this.utilsService.convertFromMomentArray(config.format || 'YYYY-MM-DD', selected, ECalendarValue.StringArr, config.locale || 'fa').join(' | ');
        this.inputElementValue.set(val);
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    onChangeCallback(_, _changedByInput) { }
    registerOnTouched(_fn) { }
    validate(formControl) {
        return this.validateFn ? this.validateFn(formControl.value) : null;
    }
    processOnChangeCallback(selected) {
        const config = this.componentConfig();
        if (typeof selected === 'string') {
            return selected;
        }
        else {
            return this.utilsService.convertFromMomentArray(config.format || 'YYYY-MM-DD', selected, config.returnedValueType || this.inputValueType, config.locale || 'fa');
        }
    }
    onClick(event) {
        if (event) {
            const target = event.target;
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
    onViewDateChange(value) {
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
            const nextView = this.utilsService.getDefaultDisplayDate(this.currentDateView(), selectedArr, !!config.allowMultiSelect, config.min, config.locale || 'fa');
            this.currentDateView.set(nextView);
        }
        else {
            if (this.inputElementValue() && this.minDate() && !this.minDateIsValid) {
                this.handleInvalidDate(true);
            }
            else if (this.inputElementValue() && this.maxDate() && !this.maxDateIsValid) {
                this.handleInvalidDate(false);
            }
            else {
                const validArr = this.utilsService.getValidMomentArray(strVal, config.format || 'YYYY-MM-DD', config.locale || 'fa');
                this.selected.set(validArr);
                this.onChangeCallback(this.processOnChangeCallback(strVal), true);
                this.hideCalendar();
            }
        }
    }
    handleInvalidDate(isMin) {
        this.onChangeCallback('', false);
        this.hideCalendar();
        this.onChange.emit('');
        this.inputElementValue.set('');
        if (isMin)
            this.showMinDateIsNotValid.set(true);
        else
            this.showMaxDateIsNotValid.set(true);
    }
    get minDateIsValid() {
        const inputVal = this.inputElementValue();
        const min = this.minDate();
        if (!inputVal || !min)
            return true;
        const currentDate = moment(inputVal).locale('en');
        const minMoment = moment(this.transformToJalali(min)).locale('en');
        return this.mode() !== 'day' || minMoment.isBefore(currentDate);
    }
    get maxDateIsValid() {
        const inputVal = this.inputElementValue();
        const max = this.maxDate();
        if (!inputVal || !max)
            return true;
        const currentDate = moment(inputVal).locale('en');
        const maxMoment = moment(this.transformToJalali(max)).locale('en');
        return this.mode() !== 'day' || maxMoment.isAfter(currentDate);
    }
    dateSelected(date, granularity, _ignoreClose) {
        const nextSelected = this.utilsService.updateSelected(!!this.componentConfig().allowMultiSelect, this.selected(), date, granularity);
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
    checkClass() {
        return new Promise((resolve) => {
            const listener = (evt) => {
                const target = evt.target;
                document.removeEventListener('click', listener);
                resolve(target.className ? target.className.includes('dp-calendar-day') : false);
            };
            document.addEventListener('click', listener);
        });
    }
    onKeyPress(event) {
        if (event.keyCode === 9 || event.keyCode === 27) {
            this.hideCalendar();
        }
    }
    moveCalendarTo(date) {
        const config = this.componentConfig();
        this.currentDateView.set(this.utilsService.convertToMoment(date, config.format || 'YYYY-MM-DD', config.locale || 'fa'));
    }
    onLeftNavClick(change) {
        this.onLeftNav.emit(change);
    }
    onRightNavClick(change) {
        this.onRightNav.emit(change);
    }
    closeModal() {
        this.isModalOpen.set(false);
        this.hideCalendar();
        this.cd.markForCheck();
    }
    transformToJalali(value, toFormat = 'jYYYY/jMM/jDD') {
        if (!value)
            return '';
        return momentNs(value).format(toFormat);
    }
    ngOnDestroy() {
        this.handleInnerElementClickUnlisteners.forEach(ul => ul());
        this.stopGlobalListeners();
    }
    stopGlobalListeners() {
        this.globalListnersUnlisteners.forEach(ul => ul());
        this.globalListnersUnlisteners = [];
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalComponent, deps: [{ token: DatePickerModalService }, { token: DomHelper }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: UtilsService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.5", type: DatePickerModalComponent, isStandalone: true, selector: "dp-date-picker-modal", inputs: { config: { classPropertyName: "config", publicName: "config", isSignal: true, isRequired: false, transformFunction: null }, mode: { classPropertyName: "mode", publicName: "mode", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, fontSize: { classPropertyName: "fontSize", publicName: "fontSize", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, displayDate: { classPropertyName: "displayDate", publicName: "displayDate", isSignal: true, isRequired: false, transformFunction: null }, theme: { classPropertyName: "theme", publicName: "theme", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null }, minTime: { classPropertyName: "minTime", publicName: "minTime", isSignal: true, isRequired: false, transformFunction: null }, maxTime: { classPropertyName: "maxTime", publicName: "maxTime", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { onOpen: "open", onClose: "close", onChange: "onChange", onGoToCurrent: "onGoToCurrent", onLeftNav: "onLeftNav", onRightNav: "onRightNav" }, host: { listeners: { "click": "onClick($event)" }, properties: { "class": "this.themeClass" } }, providers: [
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
        ], viewQueries: [{ propertyName: "calendarContainer", first: true, predicate: ["container"], descendants: true, isSignal: true }, { propertyName: "dayCalendarRef", first: true, predicate: ["dayCalendar"], descendants: true, isSignal: true }, { propertyName: "monthCalendarRef", first: true, predicate: ["monthCalendar"], descendants: true, isSignal: true }, { propertyName: "dayTimeCalendarRef", first: true, predicate: ["daytimeCalendar"], descendants: true, isSignal: true }, { propertyName: "timeSelectRef", first: true, predicate: ["timeSelect"], descendants: true, isSignal: true }, { propertyName: "inputElementLabel", first: true, predicate: ["inputElementLabel"], descendants: true, isSignal: true }], ngImport: i0, template: "<div [ngClass]=\"'dp-open'\">\n  <div [attr.data-hidden]=\"componentConfig().hideInputContainer\"\n       [hidden]=\"componentConfig().hideInputContainer\"\n       class=\"dp-input-container\">\n    <input\n        (ngModelChange)=\"onViewDateChange($event)\"\n        [disabled]=\"disabled()\"\n        [ngModel]=\"inputElementValue()\"\n        [placeholder]=\"placeholder()\"\n        [readonly]=\"componentConfig().disableKeypress\"\n        class=\"dp-picker-input\"\n        id=\"dp\"\n        type=\"text\"/>\n    <span #inputElementLabel (click)=\"inputFocused()\" for=\"dp\" class=\"datepicker-button\" [class.disabled]=\"disabled()\">\n            <i class=\"fa-duotone fa-calendar datepicker-icon\" [style.fontSize.px]=\"fontSize()\" aria-hidden=\"true\"></i>\n        </span>\n    @if (showMinDateIsNotValid()) {\n      <div class=\"date-error\">\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u0632\n        {{ transformToJalali(minDate()) }}\n        \u06A9\u0648\u0686\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F.\n      </div>\n    }\n    @if (showMaxDateIsNotValid()) {\n      <div class=\"date-error\">\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u0632\n        {{ transformToJalali(maxDate()) }}\n        \u0628\u0632\u0631\u06AF\u062A\u0631 \u0628\u0627\u0634\u062F.\n      </div>\n    }\n\n  </div>\n  <div\n      class=\"kendo-datepicker-dialog\"\n      [hidden]=\"!isModalOpen()\">\n    <div #container>\n      <div\n          [ngSwitch]=\"mode()\"\n          class=\"dp-popup {{theme()}}\">\n        <dp-day-calendar #dayCalendar\n                         class=\"visible\"\n                         (onGoToCurrent)=\"onGoToCurrent.emit()\"\n                         (onLeftNav)=\"onLeftNavClick($event)\"\n                         (onRightNav)=\"onRightNavClick($event)\"\n                         (onSelect)=\"dateSelected($event, 'day')\"\n                         *ngSwitchCase=\"'day'\"\n                         [config]=\"dayCalendarConfig()\"\n                         [displayDate]=\"displayDate()\"\n                         [maxDate]=\"maxDate()\"\n                         [minDate]=\"minDate()\"\n                         [ngModel]=\"selected()\"\n                         [theme]=\"theme()\"\n                         opens=\"left\">\n        </dp-day-calendar>\n\n        <dp-month-calendar #monthCalendar\n                           (onGoToCurrent)=\"onGoToCurrent.emit()\"\n                           (onLeftNav)=\"onLeftNavClick($event)\"\n                           (onRightNav)=\"onRightNavClick($event)\"\n                           (onSelect)=\"dateSelected($event, 'month')\"\n                           *ngSwitchCase=\"'month'\"\n                           [config]=\"dayCalendarConfig()\"\n                           [displayDate]=\"displayDate()\"\n                           [ngModel]=\"selected()\"\n                           [theme]=\"theme()\"\n                           opens=\"left\">\n        </dp-month-calendar>\n\n        <dp-time-select #timeSelect\n                        (onChange)=\"dateSelected($event, 'second', true)\"\n                        *ngSwitchCase=\"'time'\"\n                        [config]=\"timeSelectConfig()\"\n                        [ngModel]=\"selected() && selected()[0]\"\n                        [theme]=\"theme()\"\n                        opens=\"left\">\n        </dp-time-select>\n\n        <dp-day-time-calendar #daytimeCalendar\n                              (onChange)=\"dateSelected($event, 'second', true)\"\n                              (onGoToCurrent)=\"onGoToCurrent.emit()\"\n                              (onLeftNav)=\"onLeftNavClick($event)\"\n                              (onRightNav)=\"onRightNavClick($event)\"\n                              *ngSwitchCase=\"'daytime'\"\n                              [config]=\"dayTimeCalendarConfig()\"\n                              [displayDate]=\"displayDate()\"\n                              [maxDate]=\"maxDate()\"\n                              [minDate]=\"minDate()\"\n                              [ngModel]=\"selected() && selected()[0]\"\n                              [theme]=\"theme()\"\n                              opens=\"left\">\n        </dp-day-time-calendar>\n      </div>\n    </div>\n  </div>\n</div>\n", styles: ["dp-date-picker,dp-date-picker-modal{display:flex}dp-date-picker.dp-material .dp-picker-input,dp-date-picker-modal.dp-material .dp-picker-input{box-sizing:border-box;height:30px;width:252px;font-size:13px;outline:none}dp-date-picker .dp-input-container,dp-date-picker-modal .dp-input-container{position:relative;flex-direction:column}dp-date-picker .dp-selected,dp-date-picker-modal .dp-selected{background:#106cc880;color:#fff}.dp-popup{position:relative;background:#fff;box-shadow:1px 1px 5px #0000001a;border-left:1px solid rgba(0,0,0,.1);border-right:1px solid rgba(0,0,0,.1);border-bottom:1px solid rgba(0,0,0,.1);z-index:9999999999999999;white-space:nowrap;transform:translate(-50%);left:50%}.date-error{font-size:12px;color:#db524b;margin-top:3px}.datepicker-button{position:absolute;top:50%;right:5px;transform:translateY(-50%);color:#42526e;cursor:pointer;height:100%;display:flex;align-items:center;justify-content:center}.datepicker-button.disabled{cursor:not-allowed;opacity:.5}.datepicker-button .datepicker-icon{line-height:1}.datepicker-button.disabled{pointer-events:none;opacity:.5;cursor:not-allowed}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: i3.NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i5.DefaultValueAccessor, selector: "input:not([type=checkbox]):not([ngNoCva])[formControlName],textarea:not([ngNoCva])[formControlName],input:not([type=checkbox]):not([ngNoCva])[formControl],textarea:not([ngNoCva])[formControl],input:not([type=checkbox]):not([ngNoCva])[ngModel],textarea:not([ngNoCva])[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i5.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i5.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: DayCalendarComponent, selector: "dp-day-calendar", inputs: ["config", "displayDate", "minDate", "maxDate", "theme"], outputs: ["onSelect", "onMonthSelect", "onNavHeaderBtnClick", "onGoToCurrent", "onLeftNav", "onRightNav", "onLeftSecondaryNav", "onRightSecondaryNav"] }, { kind: "component", type: MonthCalendarComponent, selector: "dp-month-calendar", inputs: ["config", "displayDate", "minDate", "maxDate", "theme"], outputs: ["onSelect", "onNavHeaderBtnClick", "onGoToCurrent", "onLeftNav", "onRightNav", "onLeftSecondaryNav", "onRightSecondaryNav"] }, { kind: "component", type: TimeSelectComponent, selector: "dp-time-select", inputs: ["config", "displayDate", "minDate", "maxDate", "minTime", "maxTime", "theme"], outputs: ["onChange", "onConfirm"] }, { kind: "component", type: DayTimeCalendarComponent, selector: "dp-day-time-calendar", inputs: ["config", "displayDate", "minDate", "maxDate", "theme"], outputs: ["onChange", "onGoToCurrent", "onLeftNav", "onRightNav"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dp-date-picker-modal', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        CommonModule,
                        FormsModule,
                        DayCalendarComponent,
                        MonthCalendarComponent,
                        TimeSelectComponent,
                        DayTimeCalendarComponent,
                    ], providers: [
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
                    ], template: "<div [ngClass]=\"'dp-open'\">\n  <div [attr.data-hidden]=\"componentConfig().hideInputContainer\"\n       [hidden]=\"componentConfig().hideInputContainer\"\n       class=\"dp-input-container\">\n    <input\n        (ngModelChange)=\"onViewDateChange($event)\"\n        [disabled]=\"disabled()\"\n        [ngModel]=\"inputElementValue()\"\n        [placeholder]=\"placeholder()\"\n        [readonly]=\"componentConfig().disableKeypress\"\n        class=\"dp-picker-input\"\n        id=\"dp\"\n        type=\"text\"/>\n    <span #inputElementLabel (click)=\"inputFocused()\" for=\"dp\" class=\"datepicker-button\" [class.disabled]=\"disabled()\">\n            <i class=\"fa-duotone fa-calendar datepicker-icon\" [style.fontSize.px]=\"fontSize()\" aria-hidden=\"true\"></i>\n        </span>\n    @if (showMinDateIsNotValid()) {\n      <div class=\"date-error\">\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u0632\n        {{ transformToJalali(minDate()) }}\n        \u06A9\u0648\u0686\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F.\n      </div>\n    }\n    @if (showMaxDateIsNotValid()) {\n      <div class=\"date-error\">\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u062A\u062E\u0627\u0628\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u0632\n        {{ transformToJalali(maxDate()) }}\n        \u0628\u0632\u0631\u06AF\u062A\u0631 \u0628\u0627\u0634\u062F.\n      </div>\n    }\n\n  </div>\n  <div\n      class=\"kendo-datepicker-dialog\"\n      [hidden]=\"!isModalOpen()\">\n    <div #container>\n      <div\n          [ngSwitch]=\"mode()\"\n          class=\"dp-popup {{theme()}}\">\n        <dp-day-calendar #dayCalendar\n                         class=\"visible\"\n                         (onGoToCurrent)=\"onGoToCurrent.emit()\"\n                         (onLeftNav)=\"onLeftNavClick($event)\"\n                         (onRightNav)=\"onRightNavClick($event)\"\n                         (onSelect)=\"dateSelected($event, 'day')\"\n                         *ngSwitchCase=\"'day'\"\n                         [config]=\"dayCalendarConfig()\"\n                         [displayDate]=\"displayDate()\"\n                         [maxDate]=\"maxDate()\"\n                         [minDate]=\"minDate()\"\n                         [ngModel]=\"selected()\"\n                         [theme]=\"theme()\"\n                         opens=\"left\">\n        </dp-day-calendar>\n\n        <dp-month-calendar #monthCalendar\n                           (onGoToCurrent)=\"onGoToCurrent.emit()\"\n                           (onLeftNav)=\"onLeftNavClick($event)\"\n                           (onRightNav)=\"onRightNavClick($event)\"\n                           (onSelect)=\"dateSelected($event, 'month')\"\n                           *ngSwitchCase=\"'month'\"\n                           [config]=\"dayCalendarConfig()\"\n                           [displayDate]=\"displayDate()\"\n                           [ngModel]=\"selected()\"\n                           [theme]=\"theme()\"\n                           opens=\"left\">\n        </dp-month-calendar>\n\n        <dp-time-select #timeSelect\n                        (onChange)=\"dateSelected($event, 'second', true)\"\n                        *ngSwitchCase=\"'time'\"\n                        [config]=\"timeSelectConfig()\"\n                        [ngModel]=\"selected() && selected()[0]\"\n                        [theme]=\"theme()\"\n                        opens=\"left\">\n        </dp-time-select>\n\n        <dp-day-time-calendar #daytimeCalendar\n                              (onChange)=\"dateSelected($event, 'second', true)\"\n                              (onGoToCurrent)=\"onGoToCurrent.emit()\"\n                              (onLeftNav)=\"onLeftNavClick($event)\"\n                              (onRightNav)=\"onRightNavClick($event)\"\n                              *ngSwitchCase=\"'daytime'\"\n                              [config]=\"dayTimeCalendarConfig()\"\n                              [displayDate]=\"displayDate()\"\n                              [maxDate]=\"maxDate()\"\n                              [minDate]=\"minDate()\"\n                              [ngModel]=\"selected() && selected()[0]\"\n                              [theme]=\"theme()\"\n                              opens=\"left\">\n        </dp-day-time-calendar>\n      </div>\n    </div>\n  </div>\n</div>\n", styles: ["dp-date-picker,dp-date-picker-modal{display:flex}dp-date-picker.dp-material .dp-picker-input,dp-date-picker-modal.dp-material .dp-picker-input{box-sizing:border-box;height:30px;width:252px;font-size:13px;outline:none}dp-date-picker .dp-input-container,dp-date-picker-modal .dp-input-container{position:relative;flex-direction:column}dp-date-picker .dp-selected,dp-date-picker-modal .dp-selected{background:#106cc880;color:#fff}.dp-popup{position:relative;background:#fff;box-shadow:1px 1px 5px #0000001a;border-left:1px solid rgba(0,0,0,.1);border-right:1px solid rgba(0,0,0,.1);border-bottom:1px solid rgba(0,0,0,.1);z-index:9999999999999999;white-space:nowrap;transform:translate(-50%);left:50%}.date-error{font-size:12px;color:#db524b;margin-top:3px}.datepicker-button{position:absolute;top:50%;right:5px;transform:translateY(-50%);color:#42526e;cursor:pointer;height:100%;display:flex;align-items:center;justify-content:center}.datepicker-button.disabled{cursor:not-allowed;opacity:.5}.datepicker-button .datepicker-icon{line-height:1}.datepicker-button.disabled{pointer-events:none;opacity:.5;cursor:not-allowed}\n"] }]
        }], ctorParameters: () => [{ type: DatePickerModalService }, { type: DomHelper }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: UtilsService }, { type: i0.ChangeDetectorRef }], propDecorators: { config: [{ type: i0.Input, args: [{ isSignal: true, alias: "config", required: false }] }], mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], fontSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "fontSize", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], displayDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "displayDate", required: false }] }], theme: [{ type: i0.Input, args: [{ isSignal: true, alias: "theme", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], minTime: [{ type: i0.Input, args: [{ isSignal: true, alias: "minTime", required: false }] }], maxTime: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxTime", required: false }] }], themeClass: [{
                type: HostBinding,
                args: ['class']
            }], onOpen: [{ type: i0.Output, args: ["open"] }], onClose: [{ type: i0.Output, args: ["close"] }], onChange: [{ type: i0.Output, args: ["onChange"] }], onGoToCurrent: [{ type: i0.Output, args: ["onGoToCurrent"] }], onLeftNav: [{ type: i0.Output, args: ["onLeftNav"] }], onRightNav: [{ type: i0.Output, args: ["onRightNav"] }], calendarContainer: [{ type: i0.ViewChild, args: ['container', { isSignal: true }] }], dayCalendarRef: [{ type: i0.ViewChild, args: ['dayCalendar', { isSignal: true }] }], monthCalendarRef: [{ type: i0.ViewChild, args: ['monthCalendar', { isSignal: true }] }], dayTimeCalendarRef: [{ type: i0.ViewChild, args: ['daytimeCalendar', { isSignal: true }] }], timeSelectRef: [{ type: i0.ViewChild, args: ['timeSelect', { isSignal: true }] }], inputElementLabel: [{ type: i0.ViewChild, args: ['inputElementLabel', { isSignal: true }] }], onClick: [{
                type: HostListener,
                args: ['click', ['$event']]
            }] } });

class DatePickerModalDirectiveService {
    constructor(utilsService) {
        this.utilsService = utilsService;
    }
    convertToHTMLElement(attachTo, baseElement) {
        if (typeof attachTo === 'string') {
            return this.utilsService.closestParent(baseElement, attachTo);
        }
        else if (attachTo) {
            return attachTo.nativeElement;
        }
        return undefined;
    }
    getConfig(config = {}, baseElement, attachTo) {
        const _config = { ...config };
        _config.hideInputContainer = true;
        let native;
        if (config.inputElementContainer) {
            native = this.utilsService.getNativeElement(config.inputElementContainer);
        }
        else {
            native = baseElement ? baseElement.nativeElement : null;
        }
        if (native) {
            _config.inputElementContainer = attachTo
                ? this.convertToHTMLElement(attachTo, native)
                : native;
        }
        return _config;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalDirectiveService, deps: [{ token: UtilsService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalDirectiveService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalDirectiveService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: UtilsService }] });

class DatePickerModalDirective {
    constructor(viewContainerRef, elemRef, service, formControl, utilsService) {
        this.viewContainerRef = viewContainerRef;
        this.elemRef = elemRef;
        this.service = service;
        this.formControl = formControl;
        this.utilsService = utilsService;
        this.open = new EventEmitter();
        this.close = new EventEmitter();
        this.onChange = new EventEmitter();
        this.onGoToCurrent = new EventEmitter();
        this.onLeftNav = new EventEmitter();
        this.onRightNav = new EventEmitter();
        this._mode = 'day';
    }
    get config() {
        return this._config;
    }
    set config(config) {
        this._config = this.service.getConfig(config, this.viewContainerRef.element, this.attachTo);
        this.updateDatepickerConfig();
        this.markForCheck();
    }
    get attachTo() {
        return this._attachTo;
    }
    set attachTo(attachTo) {
        this._attachTo = attachTo;
        this._config = this.service.getConfig(this.config, this.viewContainerRef.element, this.attachTo);
        this.updateDatepickerConfig();
        this.markForCheck();
    }
    get theme() {
        return this._theme;
    }
    set theme(theme) {
        this._theme = theme;
        if (this.datePickerModal) {
            this.datePickerModal.theme = theme;
        }
        this.markForCheck();
    }
    get mode() {
        return this._mode;
    }
    set mode(mode) {
        this._mode = mode;
        if (this.datePickerModal) {
            this.datePickerModal.mode = mode;
        }
        this.markForCheck();
    }
    get minDate() {
        return this._minDate;
    }
    set minDate(minDate) {
        this._minDate = minDate;
        if (this.datePickerModal) {
            this.datePickerModal.minDate = minDate;
            this.datePickerModal.ngOnInit();
        }
        this.markForCheck();
    }
    get maxDate() {
        return this._maxDate;
    }
    set maxDate(maxDate) {
        this._maxDate = maxDate;
        if (this.datePickerModal) {
            this.datePickerModal.maxDate = maxDate;
            this.datePickerModal.ngOnInit();
        }
        this.markForCheck();
    }
    get minTime() {
        return this._minTime;
    }
    set minTime(minTime) {
        this._minTime = minTime;
        if (this.datePickerModal) {
            this.datePickerModal.minTime = minTime;
            this.datePickerModal.ngOnInit();
        }
        this.markForCheck();
    }
    get maxTime() {
        return this._maxTime;
    }
    set maxTime(maxTime) {
        this._maxTime = maxTime;
        if (this.datePickerModal) {
            this.datePickerModal.maxTime = maxTime;
            this.datePickerModal.ngOnInit();
        }
        this.markForCheck();
    }
    get displayDate() {
        return this._displayDate;
    }
    set displayDate(displayDate) {
        this._displayDate = displayDate;
        this.updateDatepickerConfig();
        this.markForCheck();
    }
    ngOnInit() {
        this.datePickerModal = this.createDatePickerModal();
        this.api = this.datePickerModal.api;
        this.updateDatepickerConfig();
        this.attachModelToDatePickerModal();
        this.datePickerModal.theme = this.theme;
    }
    createDatePickerModal() {
        return this.viewContainerRef.createComponent(DatePickerModalComponent).instance;
    }
    attachModelToDatePickerModal() {
        if (!this.formControl) {
            return;
        }
        this.datePickerModal.onViewDateChange(this.formControl.value);
        this.formControl.valueChanges.subscribe((value) => {
            if (value !== this.datePickerModal.inputElementValue) {
                const strVal = this.utilsService.convertToString(value, this.datePickerModal.componentConfig.format, this.datePickerModal.componentConfig.locale);
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
            }
            else {
                setup = false;
            }
            if (errors) {
                if (errors.hasOwnProperty('format')) {
                    const { given } = errors['format'];
                    this.datePickerModal.inputElementValue = given;
                    if (!changedByInput) {
                        this.formControl.control.setValue(given);
                    }
                }
                this.formControl.control.setErrors(errors);
            }
        });
    }
    onClick(event) {
        this.datePickerModal.onClick();
    }
    onFocus() {
        this.datePickerModal.inputFocused();
    }
    markForCheck() {
        if (this.datePickerModal) {
            this.datePickerModal.cd.markForCheck();
        }
    }
    updateDatepickerConfig() {
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
            }
            else {
                this.elemRef.nativeElement.removeAttribute('readonly');
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.ElementRef }, { token: DatePickerModalDirectiveService }, { token: i5.NgControl, optional: true }, { token: UtilsService }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.5", type: DatePickerModalDirective, isStandalone: true, selector: "[dpDayPicker]", inputs: { config: ["dpDayPicker", "config"], attachTo: "attachTo", theme: "theme", mode: "mode", minDate: "minDate", maxDate: "maxDate", minTime: "minTime", maxTime: "maxTime", displayDate: "displayDate" }, outputs: { open: "open", close: "close", onChange: "onChange", onGoToCurrent: "onGoToCurrent", onLeftNav: "onLeftNav", onRightNav: "onRightNav" }, host: { listeners: { "click": "onClick($event)", "focus": "onFocus()" } }, providers: [DatePickerModalDirectiveService], exportAs: ["dpDayPicker"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.5", ngImport: i0, type: DatePickerModalDirective, decorators: [{
            type: Directive,
            args: [{
                    exportAs: 'dpDayPicker',
                    providers: [DatePickerModalDirectiveService],
                    selector: '[dpDayPicker]'
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: i0.ElementRef }, { type: DatePickerModalDirectiveService }, { type: i5.NgControl, decorators: [{
                    type: Optional
                }] }, { type: UtilsService }], propDecorators: { open: [{
                type: Output
            }], close: [{
                type: Output
            }], onChange: [{
                type: Output
            }], onGoToCurrent: [{
                type: Output
            }], onLeftNav: [{
                type: Output
            }], onRightNav: [{
                type: Output
            }], config: [{
                type: Input,
                args: ['dpDayPicker']
            }], attachTo: [{
                type: Input
            }], theme: [{
                type: Input
            }], mode: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], minTime: [{
                type: Input
            }], maxTime: [{
                type: Input
            }], displayDate: [{
                type: Input
            }], onClick: [{
                type: HostListener,
                args: ['click', ['$event']]
            }], onFocus: [{
                type: HostListener,
                args: ['focus']
            }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { CalendarNavComponent, DatePickerModalComponent, DatePickerModalDirective, DayCalendarComponent, DayTimeCalendarComponent, ECalendarMode, ECalendarValue, MonthCalendarComponent, TimeSelectComponent };
//# sourceMappingURL=ng2-jalali-date-picker-modal.mjs.map
