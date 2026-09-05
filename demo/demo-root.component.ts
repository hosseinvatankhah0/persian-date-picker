import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  standalone: true,
  selector: 'dp-demo-root',
  imports: [
    CommonModule,
    RouterOutlet
  ],
  template: '<router-outlet></router-outlet>'
})
export class DemoRootComponent {
}
