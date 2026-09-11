/* eslint-disable */
// @ts-nocheck
import {inject, TestBed} from '@angular/core/testing';
import {DatePickerModalDirectiveService} from './date-picker-directive.service';
import {UtilsService} from '../common/services/utils/utils.service';

describe('Service: DatePickerModalDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatePickerModalDirectiveService, UtilsService]
    });
  });

  it('should check convertToElement method', inject([DatePickerModalDirectiveService, UtilsService],
    (service: DatePickerModalDirectiveService, stubUtilsService: UtilsService) => {
      stubUtilsService.closestParent = vi.fn().mockReturnValue('fakeElement');

      const baseElement = <any>{};
      const element1 = service.convertToHTMLElement({nativeElement: 'fakeElement'}, baseElement);
      expect(element1).toBe('fakeElement');
      expect(stubUtilsService.closestParent).not.toHaveBeenCalled();

      const element2 = service.convertToHTMLElement('.notFound', baseElement);
      expect(element2).toBe('fakeElement');
      expect(stubUtilsService.closestParent).toHaveBeenCalledWith(baseElement, '.notFound');
    }));

  it('should check getConfig method', inject([DatePickerModalDirectiveService],
    (service: DatePickerModalDirectiveService) => {
      service.convertToHTMLElement = vi.fn().mockReturnValue('fakeElement');

      const config1 = service.getConfig();
      expect(config1).toEqual({hideInputContainer: true});
      expect(service.convertToHTMLElement).not.toHaveBeenCalled();

      const config2 = service.getConfig({allowMultiSelect: true});
      expect(config2).toEqual({
        allowMultiSelect: true,
        hideInputContainer: true
      });
      expect(service.convertToHTMLElement).not.toHaveBeenCalled();

      const fakeElement = {};
      const config3 = service.getConfig({allowMultiSelect: true}, {nativeElement: fakeElement});
      expect(config3).toEqual({
        allowMultiSelect: true,
        hideInputContainer: true,
        inputElementContainer: fakeElement
      });
      expect(service.convertToHTMLElement).not.toHaveBeenCalled();

      const fakeAttachElementRef = {nativeElement: {}};
      const fakeElementRef = {nativeElement: fakeElement};
      const config4 = service.getConfig({allowMultiSelect: true}, fakeElementRef, fakeAttachElementRef);
      expect(config4).toEqual({
        allowMultiSelect: true,
        hideInputContainer: true,
        inputElementContainer: 'fakeElement'
      });
      expect(service.convertToHTMLElement).toHaveBeenCalledWith(fakeAttachElementRef, fakeElement);

      const config5 = service.getConfig({allowMultiSelect: true}, fakeElementRef, 'someSelector');
      expect(config5).toEqual({
        allowMultiSelect: true,
        hideInputContainer: true,
        inputElementContainer: 'fakeElement'
      });
      expect(service.convertToHTMLElement).toHaveBeenCalledWith('someSelector', fakeElement);
    }));
});
