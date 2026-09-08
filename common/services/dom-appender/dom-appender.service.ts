import {Injectable} from '@angular/core';
import {TDrops, TOpens} from '../../types/positions.type';

@Injectable()
export class DomHelper {

  private static setYAxisPosition(element: HTMLElement, container: HTMLElement, anchor: HTMLElement, drops: TDrops) {
    const anchorRect = anchor.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const bottom = anchorRect.bottom - containerRect.top;
    const top = anchorRect.top - containerRect.top;

    if (drops === 'down') {
      element.style.top = (bottom + 1 + 'px');
    } else {
      element.style.top = (top - 1 - element.scrollHeight) + 'px';
    }
  }

  private static setXAxisPosition(element: HTMLElement, container: HTMLElement, anchor: HTMLElement, dimElem: HTMLElement, opens: TOpens) {
    const anchorRect = anchor.getBoundingClientRect();
    const rightPadding = window.innerWidth - anchorRect.right;
    const leftPadding = anchorRect.left;
    const offset = dimElem.offsetWidth / 2 - anchor.offsetWidth / 2;
    element.style.zIndex = '999999999999999';
    if (rightPadding < dimElem.offsetWidth && anchor.offsetWidth <= dimElem.offsetWidth) {
      element.style.left = `calc(50% - ${offset}px)`;
      element.style.transform = 'translateX(-50%)';
    } else if (leftPadding < dimElem.offsetWidth && anchor.offsetWidth <= dimElem.offsetWidth) {
      element.style.transform = 'translateX(+50%)';
      element.style.right = `calc(50% - ${offset}px)`;
    } else {
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%)';
    }

  }

  private static isTopInView(el: HTMLElement): boolean {
    const {top} = el.getBoundingClientRect();
    return (top >= 0);
  }

  private static isBottomInView(el: HTMLElement): boolean {
    const {bottom} = el.getBoundingClientRect();
    return (bottom <= window.innerHeight);
  }

  private static isLeftInView(el: HTMLElement): boolean {
    const {left} = el.getBoundingClientRect();
    return (left >= 0);
  }

  private static isRightInView(el: HTMLElement): boolean {
    const {right} = el.getBoundingClientRect();
    return (right <= window.innerWidth);
  }

  appendElementToPosition(config: IAppendToArgs): void {
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

  setElementPositionAsModal({ element, container }: IAppendToArgs) {
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

  setElementPosition({element, container, anchor, dimElem, drops, opens}: IAppendToArgs) {
    DomHelper.setYAxisPosition(element, container, anchor, 'down');
    DomHelper.setXAxisPosition(element, container, anchor, dimElem, 'right');

    if (drops !== 'down' && drops !== 'up') {
      if (DomHelper.isBottomInView(dimElem)) {
        DomHelper.setYAxisPosition(element, container, anchor, 'down');
      } else if (DomHelper.isTopInView(dimElem)) {
        DomHelper.setYAxisPosition(element, container, anchor, 'up');
      }
    } else {
      DomHelper.setYAxisPosition(element, container, anchor, drops);
    }

    if (opens !== 'left' && opens !== 'right') {
      if (DomHelper.isRightInView(dimElem)) {
        DomHelper.setXAxisPosition(element, container, anchor, dimElem, 'right');
      } else if (DomHelper.isLeftInView(dimElem)) {
        DomHelper.setXAxisPosition(element, container, anchor, dimElem, 'left');
      }
    } else {
      DomHelper.setXAxisPosition(element, container, anchor, dimElem, opens);
    }
  }
}

export interface IAppendToArgs {
  container: HTMLElement;
  element: HTMLElement;
  anchor: HTMLElement;
  dimElem: HTMLElement;
  drops: TDrops;
  opens: TOpens;
}