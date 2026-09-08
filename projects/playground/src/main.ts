import {bootstrapApplication} from '@angular/platform-browser';
import {provideZonelessChangeDetection} from '@angular/core';
import {PlaygroundComponent} from './playground.component';

bootstrapApplication(PlaygroundComponent, {
  providers: [provideZonelessChangeDetection()]
}).catch(err => console.error(err));
