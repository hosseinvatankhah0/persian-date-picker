import {Component, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {PersianDatePickerComponent} from '../../../persian-date-picker/index.component';

interface IDemo {
  title: string;
  hint: string;
  mode: 'day' | 'month' | 'time' | 'daytime';
  selectionMode: 'single' | 'range';
  control: FormControl;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, PersianDatePickerComponent],
  styleUrls: ['./playground.component.scss'],
  template: `
    <header class="pg-header">
      <h1>Persian Date Picker</h1>
      <p>هر کارت یک حالت را نشان می‌دهد؛ مقدار زیر هر کارت همان چیزی است که فرم دریافت می‌کند.</p>
    </header>

    <section class="pg-grid">
      @for (demo of demos; track demo.title) {
        <article class="pg-card">
          <h2>{{ demo.title }}</h2>
          <p class="pg-hint">{{ demo.hint }}</p>
          <app-persian-date-picker
            [formControl]="demo.control"
            [mode]="demo.mode"
            [selectionMode]="demo.selectionMode"
            placeholder="انتخاب کنید">
          </app-persian-date-picker>
          <pre class="pg-value">{{ format(demo.control.value) }}</pre>
        </article>
      }
    </section>

    <section class="pg-card pg-inline">
      <h2>Inline — بازهٔ روز</h2>
      <p class="pg-hint">بدون اینپوت؛ تقویم همیشه باز است.</p>
      <app-persian-date-picker
        [formControl]="inlineRange"
        mode="day"
        selectionMode="range"
        pickerType="inline">
      </app-persian-date-picker>
      <pre class="pg-value">{{ format(inlineRange.value) }}</pre>
    </section>

    <section class="pg-grid" style="margin-top:16px">
      <article class="pg-card">
        <h2>آیکون تقویم فعال</h2>
        <p class="pg-hint">
          پیش‌فرض بدون آیکون است — کلیک/فوکوس روی خود اینپوت تقویم را باز می‌کند.
          اینجا <code>showCalendarIcon</code> روشن است تا محل آیکون (راست) و دکمهٔ
          پاک‌کردن (چپ) — که هیچ‌وقت روی هم نمی‌افتند — دیده شود.
        </p>
        <app-persian-date-picker
          [formControl]="iconDemo"
          mode="day"
          [showCalendarIcon]="true"
          placeholder="انتخاب کنید">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(iconDemo.value) }}</pre>
      </article>

      <article class="pg-card" dir="ltr">
        <h2>English locale (LTR)</h2>
        <p class="pg-hint">
          Nav bar direction is now explicit per-instance instead of inherited
          from the host page — this stays LTR even if a host global stylesheet
          sets <code>direction</code> on plain <code>div</code>s.
        </p>
        <app-persian-date-picker
          [formControl]="ltrDemo"
          mode="month"
          locale="en"
          placeholder="Pick a month">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(ltrDemo.value) }}</pre>
      </article>
    </section>

    <p class="pg-note">تعداد رویدادهای onChange در حالت بازه: {{ rangeChanges() }}</p>
  `
})
export class PlaygroundComponent {
  readonly rangeChanges = signal(0);

  readonly dayRange = new FormControl<string[] | null>(null);

  readonly demos: IDemo[] = [
    {
      title: 'Day — تک تاریخ',
      hint: 'بدون دکمهٔ تایید؛ انتخاب بلافاصله ثبت و بسته می‌شود.',
      mode: 'day',
      selectionMode: 'single',
      control: new FormControl('')
    },
    {
      title: 'Day — بازه',
      hint: 'کلیک اول شروع، کلیک دوم پایان؛ فقط با «تایید» ثبت می‌شود.',
      mode: 'day',
      selectionMode: 'range',
      control: this.dayRange
    },
    {
      title: 'Month — بازه',
      hint: 'همان منطق روی شبکهٔ ماه‌ها.',
      mode: 'month',
      selectionMode: 'range',
      control: new FormControl<string[] | null>(null)
    },
    {
      title: 'Daytime',
      hint: 'تاریخ و ساعت با یک ردیف تایید/بستن.',
      mode: 'daytime',
      selectionMode: 'single',
      control: new FormControl('')
    },
    {
      title: 'Time',
      hint: 'فقط ساعت؛ تغییر مقدار تا زمان تایید ثبت نمی‌شود.',
      mode: 'time',
      selectionMode: 'single',
      control: new FormControl('')
    }
  ];

  readonly inlineRange = new FormControl<string[] | null>(null);
  readonly iconDemo = new FormControl('');
  readonly ltrDemo = new FormControl('');

  constructor() {
    this.dayRange.valueChanges.subscribe(() => this.rangeChanges.update(n => n + 1));
  }

  format(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return Array.isArray(value) ? value.join('  →  ') : String(value);
  }
}
