/* eslint-disable */
// @ts-nocheck
import {inject, TestBed} from '@angular/core/testing';
import {DatePickerModalService} from './date-picker.service';
import momentNs, {Moment} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';
import {DayCalendarService} from '../day-calendar/day-calendar.service';
import {TimeSelectService} from '../time-select/time-select.service';

const moment = momentNs;

describe('Service: DatePickerModal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatePickerModalService,
        DayTimeCalendarService,
        DayCalendarService,
        TimeSelectService,
        UtilsService
      ]
    });
  });

  it('should check getConfig method for dates format', inject([DatePickerModalService],
    (service: DatePickerModalService) => {
      const config1 = service.getConfig(<any>{
        min: '2016-10-25',
        max: '2017-10-25',
        format: 'YYYY-MM-DD',
        locale: 'en'
      });

      expect((<Moment>config1.min).isSame(moment('2016-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);
      expect((<Moment>config1.max).isSame(moment('2017-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);

      const config2 = service.getConfig({
        min: moment('2016-10-25', 'YYYY-MM-DD'),
        max: moment('2017-10-25', 'YYYY-MM-DD')
      });

      expect((<Moment>config2.min).isSame(moment('2016-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);
      expect((<Moment>config2.max).isSame(moment('2017-10-25', 'YYYY-MM-DD'), 'day')).toBe(true);

      expect(service.getConfig({}, 'time').format).toEqual('HH:mm:ss');
      // expect(service.getConfig({}, 'daytime').format).toEqual('DD-MM-YYYY HH:mm:ss');
      // expect(service.getConfig({}, 'month').format).toEqual('MMM, YYYY');
      // expect(service.getConfig({}, 'day').format).toEqual('DD-MM-YYYY');
      // expect(service.getConfig({}).format).toEqual('DD-MM-YYYY HH:mm:ss');
    }));
});
