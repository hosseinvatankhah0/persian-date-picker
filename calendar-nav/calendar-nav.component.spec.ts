/* eslint-disable */
// @ts-nocheck
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CalendarNavComponent} from './calendar-nav.component';

describe('CalendarNavComponent', () => {
  let component: CalendarNavComponent;
  let fixture: ComponentFixture<CalendarNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarNavComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event when go to current click', () => {
    const nativeElement = fixture.nativeElement;
    const goToCurrent = nativeElement.querySelector('.dp-current-location-btn');

    vi.spyOn(component.onGoToCurrent, 'emit');
    goToCurrent.dispatchEvent(new Event('click'));
    expect(component.onGoToCurrent.emit).toHaveBeenCalledWith();
  });
});
