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
  showRightNav = input<boolean>(true);
  leftNavDisabled = input<boolean>(false);
  rightNavDisabled = input<boolean>(false);
  showGoToCurrent = input<boolean>(true);
  theme = input<string>('');
  locale = input<string>('fa');
  labelAction = input<string>('');
  previousLabel = input<string>('');
  nextLabel = input<string>('');
  currentLabel = input<string>('');

  private readonly labelsByLocale: Record<string, Record<string, string>> = {
    fa: {
      prev: 'قبلی',
      next: 'بعدی',
      today: 'برو به امروز'
    },
    en: {
      prev: 'Previous',
      next: 'Next',
      today: 'Go to today'
    }
  };

  labels = computed(() => this.labelsByLocale[this.locale()] || this.labelsByLocale['en']);
  displayLabel = computed(() => this.locale() === 'fa'
    ? this.label().replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
    : this.label());
  headerAction = computed(() => this.labelAction() || (this.locale() === 'fa' ? 'انتخاب ماه و سال' : 'Choose month and year'));

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
  onRightNav = output<void>();
  onLabelClick = output<void>();
  onGoToCurrent = output<void>();

  leftNavClicked() {
    this.onLeftNav.emit();
  }

  rightNavClicked() {
    this.onRightNav.emit();
  }

  labelClicked() {
    this.onLabelClick.emit();
  }
}
