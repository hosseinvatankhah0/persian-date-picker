/* eslint-disable */
// @ts-nocheck
import {UtilsService} from '../common/services/utils/utils.service';
import {IDatePickerModalDirectiveConfig} from './date-picker-directive-config.model';
import {ElementRef, Injectable} from '@angular/core';

@Injectable()
export class DatePickerModalDirectiveService {
  constructor(public utilsService: UtilsService) {
  }

  convertToHTMLElement(attachTo: ElementRef | string, baseElement: HTMLElement): HTMLElement {
    if (typeof attachTo === 'string') {
      return this.utilsService.closestParent(baseElement, attachTo);
    } else if (attachTo) {
      return attachTo.nativeElement;
    }

    return undefined;
  }

  getConfig(config: IDatePickerModalDirectiveConfig = {},
            baseElement?: ElementRef,
            attachTo?: ElementRef | string): IDatePickerModalDirectiveConfig {
    const _config: IDatePickerModalDirectiveConfig = {...config};
    _config.hideInputContainer = true;

    let native;

    if (config.inputElementContainer) {
      native = this.utilsService.getNativeElement(config.inputElementContainer);
    } else {
      native = baseElement ? baseElement.nativeElement : null;
    }

    if (native) {
      _config.inputElementContainer = attachTo
        ? this.convertToHTMLElement(attachTo, native)
        : native;
    }

    return _config;
  }
}
