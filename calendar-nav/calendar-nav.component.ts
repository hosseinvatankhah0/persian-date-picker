import {ChangeDetectionStrategy, Component, HostBinding, input, output, ViewEncapsulation} from '@angular/core';
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

  @HostBinding('class') get themeClass() {
    return this.theme() || '';
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
