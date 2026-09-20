/* eslint-disable */
// @ts-nocheck
import {FormsModule} from '@angular/forms';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {DatePickerModalComponent} from './date-picker.component';
import {DayTimeCalendarComponent} from '../day-time-calendar/day-time-calendar.component';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';
import {DomHelper} from '../common/services/dom-appender/dom-appender.service';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {TimeSelectComponent} from '../time-select/time-select.component';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import {MonthCalendarComponent} from '../month-calendar/month-calendar.component';
import {DayCalendarService} from '../day-calendar/day-calendar.service';
import {TimeSelectService} from '../time-select/time-select.service';
import {UtilsService} from '../common/services/utils/utils.service';

describe('openOnClick / openOnFocus', () => {
  let component: DatePickerModalComponent;
  let fixture: ComponentFixture<DatePickerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        DatePickerModalComponent,
        DayTimeCalendarComponent,
        DayCalendarComponent,
        TimeSelectComponent,
        CalendarNavComponent,
        MonthCalendarComponent
      ],
      providers: [
        DayTimeCalendarService,
        DayCalendarService,
        TimeSelectService,
        UtilsService,
        DomHelper
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const input = () => fixture.nativeElement.querySelector('.dp-picker-input') as HTMLInputElement;
  const icon = () => fixture.nativeElement.querySelector('.datepicker-button') as HTMLButtonElement;

  describe('defaults (nothing set)', () => {
    it('shows the calendar icon and stays closed on an input click', () => {
      expect(icon()).toBeTruthy();

      input().click();

      expect(component.isModalOpen()).toBeFalsy();
    });

    it('opens on an icon click regardless', () => {
      icon().click();

      expect(component.isModalOpen()).toBeTruthy();
    });

    it('stays closed on input focus by default', () => {
      input().focus();
      expect(component.isModalOpen()).toBeFalsy();
    });

    it('still lets a typed, valid date set the value without opening the calendar', () => {
      component.onViewDateChange('1405/06/28');
      fixture.detectChanges();

      expect(component.selected().length).toBe(1);
      expect(component.selected()[0].locale('fa').format('jYYYY/jMM/jDD')).toBe('1405/06/28');
    });
  });

  describe('explicit field triggers', () => {
    it('opens on an input click when openOnClick is true', () => {
      fixture.componentRef.setInput('openOnClick', true);
      fixture.detectChanges();
      input().click();
      expect(component.isModalOpen()).toBeTruthy();
    });

    it('opens on input focus when openOnFocus is true', () => {
      fixture.componentRef.setInput('openOnFocus', true);
      fixture.detectChanges();
      input().focus();
      expect(component.isModalOpen()).toBeTruthy();
    });
  });

  describe('openOnClick=false, openOnFocus=false', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('openOnClick', false);
      fixture.componentRef.setInput('openOnFocus', false);
      fixture.detectChanges();
    });

    it('does not open on an input click', () => {
      input().click();

      expect(component.isModalOpen()).toBeFalsy();
    });

    it('does not open on input focus', () => {
      input().focus();
      expect(component.isModalOpen()).toBeFalsy();
    });

    it('still opens on an icon click — the icon calls showCalendars() directly', () => {
      icon().click();

      expect(component.isModalOpen()).toBeTruthy();
    });

    it('still lets the user type or paste a valid date directly', () => {
      const values: unknown[] = [];
      component.registerOnChange(value => values.push(value));
      for (const part of ['1', '14', '1405', '1405/06', '1405/06/2']) {
        component.onViewDateChange(part);
        expect(component.inputElementValue()).toBe(part);
        expect(values.length).toBe(0);
      }
      component.onViewDateChange('1405/06/28');
      fixture.detectChanges();

      expect(component.selected().length).toBe(1);
      expect(component.selected()[0].locale('fa').format('jYYYY/jMM/jDD')).toBe('1405/06/28');
      expect(values.length).toBe(1);
      expect(component.isModalOpen()).toBeFalsy();
    });

    it('keeps typed characters in the input and updates the form when the date is complete', async () => {
      const values: unknown[] = [];
      component.registerOnChange(value => values.push(value));
      for (const part of ['1', '14', '1405', '1405/06', '1405/06/2', '1405/06/28']) {
        input().value = part;
        input().dispatchEvent(new Event('input', {bubbles: true}));
        await fixture.whenStable();
        fixture.detectChanges();
      }
      expect(component.selected().length).toBe(1);
      expect(values.length).toBe(1);
      expect(component.isModalOpen()).toBeFalsy();
    });

    for (const value of ['14050202', '1405-02-02', '1405/02/02',
      '2026-04-22T00:00:00.000Z', '2026-04-22T00:00:00', '2026-04-22 00:00:00']) {
      it(`accepts pasted ${value} without opening the calendar`, () => {
        component.onViewDateChange(value);
        expect(component.selected().length).toBe(1);
        expect(component.selected()[0].clone().locale('fa').format('jYYYY/jMM/jDD')).toBe('1405/02/02');
        expect(component.isModalOpen()).toBeFalsy();
      });
    }
  });

  describe('openOnFocus under disableKeypress=true (e.g. range mode)', () => {
    it('stays closed on focus by default', () => {
      fixture.componentRef.setInput('config', {disableKeypress: true});
      fixture.detectChanges();

      input().focus();

      expect(component.isModalOpen()).toBeFalsy();
    });

    it('does not open on focus when explicitly turned off', () => {
      fixture.componentRef.setInput('config', {disableKeypress: true});
      fixture.componentRef.setInput('openOnFocus', false);
      fixture.detectChanges();

      input().focus();

      expect(component.isModalOpen()).toBeFalsy();
    });
  });
});
