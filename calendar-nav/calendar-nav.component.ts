import {ChangeDetectionStrategy, Component, computed, HostBinding, input, output, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  standalone: true,
  selector: 'dp-calendar-nav',
  templateUrl: './calendar-nav.component.html',
  styleUrls: ['./calendar-nav.component.less'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarNavComponent {
  label = input<string>('');
  isLabelClickable = input<boolean>(false);
  showLeftNav = input<boolean>(true);
  showLeftSecondaryNav = input<boolean>(false);
  showRightNav = input<boolean>(true);
  showRightSecondaryNav = input<boolean>(false);
  leftNavDisabled = input<boolean>(false);
  leftSecondaryNavDisabled = input<boolean>(false);
  rightNavDisabled = input<boolean>(false);
  rightSecondaryNavDisabled = input<boolean>(false);
  showGoToCurrent = input<boolean>(true);
  theme = input<string>('');
  locale = input<string>('fa');

  private readonly labelsByLocale: Record<string, Record<string, string>> = {
    fa: {
      prev: 'قبلی',
      next: 'بعدی',
      prevYears: 'سال‌های قبل',
      nextYears: 'سال‌های بعد',
      today: 'برو به امروز'
    },
    en: {
      prev: 'Previous',
      next: 'Next',
      prevYears: 'Previous years',
      nextYears: 'Next years',
      today: 'Go to today'
    }
  };

  labels = computed(() => this.labelsByLocale[this.locale()] || this.labelsByLocale['en']);

  /** Drives the nav bar's own direction explicitly (see the .rtl class in
   * calendar-nav.component.less) instead of leaving it to whatever direction
   * happens to be ambient in the host page — a bare, unscoped `div { direction:
   * rtl }` in a consumer's own global styles previously had nothing of ours to
   * out-specify at this element, so it silently flipped the nav bar even on
   * otherwise-LTR pages. */
  isRtl = computed(() => this.locale() === 'fa');

  @HostBinding('class') get themeClass() {
    return [this.theme(), this.isRtl() ? 'rtl' : ''].filter(Boolean).join(' ');
  }

  onLeftNav = output<void>();
  onLeftSecondaryNav = output<void>();
  onRightNav = output<void>();
  onRightSecondaryNav = output<void>();
  onLabelClick = output<void>();
  onGoToCurrent = output<void>();

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
}
