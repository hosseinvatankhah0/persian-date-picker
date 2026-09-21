import {Component, computed, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import moment from 'jalali-moment';
import {PersianDatePickerComponent} from '../../../persian-date-picker/index.component';
import {DayCalendarComponent} from '../../../day-calendar/day-calendar.component';
import {IDayCalendarConfig} from '../../../day-calendar/day-calendar-config.model';
import {ECalendarValue} from '../../../common/types/calendar-value-enum';

// Mirrors the user's own `JDate.now.addDays(6).format('YYYY-MM-DD HH:mm:ss')`:
// a jalali-moment instance locale'd to 'fa' formats jYear/jMonth/jDate through
// the plain 'YYYY-MM-DD' tokens, so this string is a real Jalali date wearing
// Gregorian-looking token names plus a trailing time the picker's default
// 'YYYY-MM-DD' format doesn't include.
const jDatePlus6Value = moment().locale('fa').add(6, 'days').format('YYYY-MM-DD HH:mm:ss');

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
  imports: [ReactiveFormsModule, PersianDatePickerComponent, DayCalendarComponent],
  styleUrls: ['./playground.component.scss'],
  template: `
    <a class="skip-link" href="#preview">رفتن به تقویم</a>
    <header class="site-header">
      <a class="brand" href="#" aria-label="روزنگار، صفحه اصلی">
        <span class="brand-mark" aria-hidden="true">ر</span>
        <span>روزنگار<small>Persian Date Picker</small></span>
      </a>
      <nav aria-label="ناوبری اصلی">
        <a href="#preview">امتحان کنید</a>
        <a href="#examples">نمونه‌ها</a>
        <a href="https://github.com/hosseinvatankhah0/persian-date-picker" class="github-link">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <span class="eyebrow"><span aria-hidden="true"></span> برای روزهایی که پیش رو دارید</span>
        <h1 id="hero-title">انتخاب یک روز،<br><em>به همین سادگی.</em></h1>
        <p class="hero-description">از یک قرار کوتاه تا یک سفر چندروزه؛ تاریخ و ساعت را راحت انتخاب کنید. با تقویمی که زبان شما را می‌فهمد.</p>
        <a class="primary-link" href="#preview">تقویم را امتحان کنید <span aria-hidden="true">←</span></a>
        <div class="hero-features"><span>تقویم شمسی و میلادی</span><span>سازگار با موبایل</span><span>راست‌به‌چپ</span></div>
        <div class="hero-footnote"><span class="little-line" aria-hidden="true"></span> یک انتخاب کوچک، شروع یک برنامهٔ تازه.</div>
      </div>
      <div class="preview-stage" id="preview">
        <div class="preview-label"><span>تقویم شما</span><span class="live-label"><i aria-hidden="true"></i> پیش‌نمایش زنده</span></div>
        <section class="calendar-card" aria-label="تقویم تعاملی">
          <div class="calendar-card-heading"><div><span class="eyebrow">از اینجا شروع کنید</span><h2>چه روزی را در نظر دارید؟</h2></div><span class="mini-calendar" aria-hidden="true">▦</span></div>
          <div class="mode-switch" role="group" aria-label="نوع انتخاب تاریخ">
            <button type="button" [attr.aria-pressed]="previewMode() === 'single'" (click)="setPreviewMode('single')">یک روز</button>
            <button type="button" [attr.aria-pressed]="previewMode() === 'range'" (click)="setPreviewMode('range')">بازهٔ زمانی</button>
          </div>
          <div class="calendar-live">
            <dp-day-calendar [formControl]="previewControl" [config]="previewConfig()" theme="dp-default"></dp-day-calendar>
          </div>
          <div class="calendar-legend"><span><i class="today-dot"></i> امروز</span><span><i class="selected-dot"></i> انتخاب شما</span><span>با کلیدهای جهت هم انتخاب کنید</span></div>
          <div class="selection-result" role="status" aria-live="polite">
            <div><span>{{ previewMode() === 'range' ? 'بازهٔ انتخابی شما' : 'تاریخ انتخابی شما' }}</span><strong [class.empty]="!previewControl.value?.length"><bdi>{{ previewLabel() }}</bdi></strong></div>
            <button type="button" class="reset-selection" [disabled]="!previewControl.value?.length" (click)="previewControl.reset()">پاک کردن</button>
          </div>
        </section>
        <p class="preview-caption">{{ previewMode() === 'range' ? 'ابتدا روز شروع و سپس روز پایان را انتخاب کنید.' : 'روی نام ماه بزنید تا سریع‌تر به ماه و سال دلخواه برسید.' }}</p>
      </div>
    </section>

    <section class="examples-section" id="examples" aria-labelledby="examples-title">
    <header class="pg-header">
      <div><span class="eyebrow">برای هر نوع برنامه</span><h2 id="examples-title">یک تقویم، چند جور انتخاب</h2></div>
      <p>حالت دلخواهتان را باز کنید و امتحان کنید.</p>
    </header>

    <section class="pg-grid">
      @for (demo of demos; track demo.title; let i = $index) {
        <article class="pg-card">
          <span class="card-number" aria-hidden="true">{{ ['۰۱', '۰۲', '۰۳', '۰۴', '۰۵'][i] }}</span>
          <h2>{{ demo.title }}</h2>
          <p class="pg-hint">{{ demo.hint }}</p>
          <app-persian-date-picker
            [formControl]="demo.control"
            [mode]="demo.mode"
            [selectionMode]="demo.selectionMode"
            [showCalendarIcon]="true"
            [placeholder]="demo.title">
          </app-persian-date-picker>
          <div class="demo-selection" role="status"><span>انتخاب شما</span><bdi>{{ demo.control.value ? format(demo.control.value) : 'هنوز انتخاب نشده' }}</bdi></div>
        </article>
      }
    </section>
    </section>

    <details class="developer-examples">
    <summary>نمونه‌های پیشرفته و بررسی خروجی <span>برای توسعه‌دهندگان</span></summary>
    <section class="pg-card pg-inline">
      <h2>بازهٔ روز در منوی بازشونده</h2>
      <p class="pg-hint">اینجا باز شدن با کلیک روی ورودی صریحاً فعال شده است؛ تقویم زیر فیلد باز می‌شود.</p>
      <app-persian-date-picker
        [formControl]="inlineRange"
        mode="day"
        selectionMode="range"
        [openOnClick]="true"
        pickerType="inline">
      </app-persian-date-picker>
      <pre class="pg-value">{{ format(inlineRange.value) }}</pre>
    </section>

    <section class="pg-grid" style="margin-top:16px">
      <article class="pg-card">
        <h2>رفتار پیش‌فرض: باز شدن فقط با آیکون</h2>
        <p class="pg-hint">روی فیلد کلیک کنید و 1405/06/28 را تایپ یا پیست کنید؛ تقویم فقط با آیکون باز می‌شود.</p>
        <app-persian-date-picker
          [formControl]="iconOnlyDemo"
          [showCalendarIcon]="true"
          placeholder="تاریخ را تایپ کنید">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(iconOnlyDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>باز شدن با کلیک روی فیلد</h2>
        <p class="pg-hint">فقط <code>openOnClick</code> روشن است؛ کلیک روی فیلد یا آیکون باید تقویم را باز کند.</p>
        <app-persian-date-picker
          [formControl]="iconDemo"
          mode="day"
          [openOnClick]="true"
          placeholder="انتخاب کنید">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(iconDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>باز شدن با فوکوس</h2>
        <p class="pg-hint">فقط <code>openOnFocus</code> روشن است؛ با Tab به فیلد بروید و باز شدن تقویم را بررسی کنید.</p>
        <app-persian-date-picker
          [formControl]="focusDemo"
          [openOnFocus]="true"
          placeholder="با Tab وارد شوید">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(focusDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>منوی بازشونده، فقط آیکون</h2>
        <p class="pg-hint">در حالت <code>inline</code> هم کلیک و فوکوس فیلد باید بی‌اثر باشد و آیکون منو را باز کند.</p>
        <app-persian-date-picker
          [formControl]="inlineIconOnly"
          pickerType="inline"
          placeholder="تاریخ را تایپ کنید">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(inlineIconOnly.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>فرمت‌های ورودی شمسی</h2>
        <p class="pg-hint">هر دکمه یک مقدار را از طریق FormControl ست می‌کند؛ همه باید به <code>1405/02/02</code> برسند.</p>
        <div class="pg-btn-row">
          @for (sample of jalaliSamples; track sample) {
            <button type="button" class="pg-btn" (click)="jalaliInput.setValue(sample)">{{ sample }}</button>
          }
        </div>
        <app-persian-date-picker [formControl]="jalaliInput" placeholder="یا تاریخ را تایپ کنید"></app-persian-date-picker>
        <pre class="pg-value">{{ format(jalaliInput.value) }}</pre>
      </article>

      <article class="pg-card" dir="ltr">
        <h2>English locale (LTR)</h2>
        <p class="pg-hint">
          Nav bar direction is now explicit per-instance instead of inherited
          from the host page — this stays LTR even if a host global stylesheet
          sets <code>direction</code> on plain <code>div</code>s. Also check
          the month grid: no more "jump 10 years" double-arrow next to the
          single-arrow nav — that feature is gone.
        </p>
        <app-persian-date-picker
          [formControl]="ltrDemo"
          mode="month"
          locale="en"
          placeholder="Pick a month">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(ltrDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>مقدار میلادی از سرور، locale فارسی</h2>
        <p class="pg-hint">
          دکمه را بزنید تا مقدار فرم مثل یک پاسخ سرور به‌صورت میلادی ست شود
          (<code>2026-09-09</code>) — پیکر با locale="fa" است، پس باید همان لحظه
          به‌صورت شمسی نمایش داده شود و همان‌طور هم خروجی بدهد.
        </p>
        <button type="button" class="pg-btn" (click)="loadFromServer()">
          شبیه‌سازی پاسخ سرور (میلادی)
        </button>
        <app-persian-date-picker
          [formControl]="serverDemo"
          mode="day"
          locale="fa"
          placeholder="تاریخ">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(serverDemo.value) }}</pre>
      </article>
    </section>

    <section class="pg-grid" style="margin-top:16px">
      <article class="pg-card">
        <h2>تشخیص خودکار ورودی میلادی</h2>
        <p class="pg-hint">
          هر دکمه یک شکل متفاوت از تاریخ میلادی را در فرم می‌گذارد — اسلش‌دار،
          خط‌تیره‌دار، ISO و فرمت استاندارد سی‌شارپ. هیچ‌کدام
          <code>format</code> ندارند، پس هر چهار مورد باید به یک خروجی شمسی
          یکسان تبدیل شوند.
        </p>
        <div class="pg-btn-row">
          @for (sample of gregorianSamples; track sample) {
            <button type="button" class="pg-btn" (click)="autoDetect.setValue(sample)">
              {{ sample }}
            </button>
          }
        </div>
        <app-persian-date-picker
          [formControl]="autoDetect"
          mode="day"
          placeholder="تاریخ">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(autoDetect.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>format صریح — خروجی میلادی می‌ماند</h2>
        <p class="pg-hint">
          وقتی <code>format="YYYY-MM-DD"</code> صراحتاً داده شود، تشخیص خودکار
          خاموش می‌شود و مقدار فرم هم میلادی باقی می‌ماند — ولی
          <code>display-format="jYYYY/jMM/jDD"</code> باعث می‌شود کاربر همچنان
          تاریخ شمسی ببیند.
        </p>
        <button type="button" class="pg-btn" (click)="explicitFormat.setValue('2026-06-12')">
          ست کردن ‎2026-06-12‎
        </button>
        <app-persian-date-picker
          [formControl]="explicitFormat"
          mode="day"
          format="YYYY-MM-DD"
          display-format="jYYYY/jMM/jDD"
          placeholder="تاریخ">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(explicitFormat.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>format شمسی سفارشی</h2>
        <p class="pg-hint">
          <code>format="jYYYY-jMM-jDD"</code> — همان تقویم شمسی، فقط با
          جداکنندهٔ خط‌تیره به‌جای اسلشِ پیش‌فرض.
        </p>
        <app-persian-date-picker
          [formControl]="jalaliDashed"
          mode="day"
          format="jYYYY-jMM-jDD"
          placeholder="تاریخ">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(jalaliDashed.value) }}</pre>
      </article>
    </section>

    <section class="pg-grid" style="margin-top:16px">
      <article class="pg-card">
        <h2>حداقل/حداکثر تاریخ روی فیلد تایپی</h2>
        <p class="pg-hint">
          بازه مجاز ‎1405/01/01‎ تا ‎1405/12/29‎ است. داخل فیلد یک تاریخ خارج
          از بازه (مثلاً <code>1300/01/01</code>) یا داخل بازه (مثلاً
          <code>1405/06/15</code>) تایپ کنید — خارج از بازه باید رد شود و
          پیام خطا نشان دهد.
        </p>
        <app-persian-date-picker
          [formControl]="minMaxDemo"
          mode="day"
          [minDate]="'1405/01/01'"
          [maxDate]="'1405/12/29'"
          placeholder="بین 1405/01/01 و 1405/12/29">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(minMaxDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>تایپ بدون صفر پیشوند</h2>
        <p class="pg-hint">
          داخل فیلد <code>1405/6/5</code> (بدون صفر پیشوند ماه/روز) تایپ کنید
          — باید همان‌طور که <code>1405/06/05</code> قبول می‌شود، پذیرفته شود.
        </p>
        <app-persian-date-picker
          [formControl]="unpaddedDemo"
          mode="day"
          placeholder="مثلاً 1405/6/5">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(unpaddedDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>تایپ بدون صفر پیشوند + ساعت</h2>
        <p class="pg-hint">
          داخل فیلد <code>1405/6/5 8:30:5</code> تایپ کنید — تاریخ و ساعت هر
          دو باید بدون صفر پیشوند پذیرفته شوند.
        </p>
        <app-persian-date-picker
          [formControl]="unpaddedDaytimeDemo"
          mode="daytime"
          placeholder="مثلاً 1405/6/5 8:30:5">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(unpaddedDaytimeDemo.value) }}</pre>
      </article>

      <article class="pg-card" dir="ltr">
        <h2>locale="en" — low-year Gregorian typed directly</h2>
        <p class="pg-hint">
          Type <code>1405/06/05</code> directly into the field — this picker
          is Gregorian (<code>locale="en"</code>), so it must read as
          Gregorian year 1405, not silently become 2026-08-27.
        </p>
        <app-persian-date-picker
          [formControl]="enLowYearDemo"
          mode="day"
          locale="en"
          placeholder="e.g. 1405/06/05">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(enLowYearDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>ISO ساده / با آفست، روی format سفارشی</h2>
        <p class="pg-hint">
          <code>format="DD-MM-YYYY"</code> ست شده. دکمه‌ها یک تاریخ ISO ساده
          و یک تاریخ‌زمان ISO با آفست عددی (سبک .NET) را در فرم می‌گذارند —
          هر دو باید پذیرفته و نمایش داده شوند، نه اینکه بی‌صدا حذف شوند.
        </p>
        <div class="pg-btn-row">
          <button type="button" class="pg-btn" (click)="isoFormatDemo.setValue('2026-06-12')">
            ISO ساده: 2026-06-12
          </button>
          <button type="button" class="pg-btn" (click)="isoFormatDemo.setValue('2026-06-12T08:30:00+03:30')">
            با آفست: ...+03:30
          </button>
        </div>
        <app-persian-date-picker
          [formControl]="isoFormatDemo"
          mode="day"
          format="DD-MM-YYYY"
          placeholder="تاریخ">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(isoFormatDemo.value) }}</pre>
      </article>

      <article class="pg-card">
        <h2>مقدار اولیه فرم (JDate.now.addDays(6))</h2>
        <p class="pg-hint">
          کنترل این فیلد از همان ابتدا (نه با دکمه) با
          <code>{{ jDatePlus6Value }}</code>
          مقداردهی شده — همان چیزی که
          <code>JDate.now.addDays(6).format('YYYY-MM-DD HH:mm:ss')</code>
          تولید می‌کند. باید همین حالا تاریخ درست را نشان دهد.
        </p>
        <app-persian-date-picker
          [formControl]="jDateInitialDemo"
          mode="day"
          placeholder="تاریخ">
        </app-persian-date-picker>
        <pre class="pg-value">{{ format(jDateInitialDemo.value) }}</pre>
      </article>
    </section>

    <p class="pg-note">تعداد رویدادهای onChange در حالت بازه: {{ rangeChanges() }}</p>
    </details>
    </main>
    <footer class="site-footer"><span>روزنگار <span aria-hidden="true">/</span> زمان، به زبان شما.</span><span>ساخته‌شده برای وب فارسی · متن‌باز</span></footer>
  `
})
export class PlaygroundComponent {
  readonly previewMode = signal<'single' | 'range'>('single');
  readonly previewControl = new FormControl<string[] | null>(null);
  readonly previewConfig = computed<IDayCalendarConfig>(() => ({
    locale: 'fa', format: 'jYYYY/jMM/jDD', monthFormat: 'jMMMM jYYYY',
    dayBtnFormat: 'jD', selectionMode: this.previewMode(),
    returnedValueType: ECalendarValue.StringArr, showGoToCurrent: true,
    showNearMonthDays: true,
    dayBtnFormatter: day => day.format('jD').replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]),
    monthFormatter: month => month.locale('fa').format('jMMMM jYYYY').replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
  }));

  setPreviewMode(mode: 'single' | 'range'): void {
    if (mode === this.previewMode()) return;
    this.previewControl.reset();
    this.previewMode.set(mode);
  }

  previewLabel(): string {
    const dates = this.previewControl.value;
    if (!dates?.length) return 'هنوز روزی انتخاب نکرده‌اید';
    const label = dates.join(' تا ') + (this.previewMode() === 'range' && dates.length === 1 ? ' — روز پایان را انتخاب کنید' : '');
    return label.replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
  }
  readonly rangeChanges = signal(0);

  readonly dayRange = new FormControl<string[] | null>(null);

  readonly demos: IDemo[] = [
    {
      title: 'انتخاب تاریخ',
      hint: 'برای یک قرار یا یادآوری؛ یک روز انتخاب کنید و تمام.',
      mode: 'day',
      selectionMode: 'single',
      control: new FormControl('')
    },
    {
      title: 'بازهٔ روزها',
      hint: 'برای سفر یا مرخصی؛ شروع و پایان را انتخاب و تایید کنید.',
      mode: 'day',
      selectionMode: 'range',
      control: this.dayRange
    },
    {
      title: 'بازهٔ ماه‌ها',
      hint: 'برای گزارش یا برنامه‌ریزی؛ از یک ماه تا ماه دیگر.',
      mode: 'month',
      selectionMode: 'range',
      control: new FormControl<string[] | null>(null)
    },
    {
      title: 'تاریخ و ساعت',
      hint: 'برای یک قرار دقیق؛ روز و ساعت را با هم مشخص کنید.',
      mode: 'daytime',
      selectionMode: 'single',
      control: new FormControl('')
    },
    {
      title: 'انتخاب ساعت',
      hint: 'برای برنامهٔ روزانه؛ زمان دلخواه را تنظیم و تایید کنید.',
      mode: 'time',
      selectionMode: 'single',
      control: new FormControl('')
    }
  ];

  readonly inlineRange = new FormControl<string[] | null>(null);
  readonly iconDemo = new FormControl('');
  readonly iconOnlyDemo = new FormControl('');
  readonly focusDemo = new FormControl('');
  readonly inlineIconOnly = new FormControl('');
  readonly jalaliInput = new FormControl('');
  readonly ltrDemo = new FormControl('');
  readonly serverDemo = new FormControl('');
  readonly autoDetect = new FormControl('');
  readonly explicitFormat = new FormControl('');
  readonly jalaliDashed = new FormControl('');
  readonly minMaxDemo = new FormControl('');
  readonly unpaddedDemo = new FormControl('');
  readonly unpaddedDaytimeDemo = new FormControl('');
  readonly enLowYearDemo = new FormControl('');
  readonly isoFormatDemo = new FormControl('');
  readonly jDatePlus6Value = jDatePlus6Value;
  readonly jDateInitialDemo = new FormControl(jDatePlus6Value);

  readonly gregorianSamples = [
    '2026/06/12',
    '2026-06-12',
    '2026-06-12T00:00:00.000Z',
    '2026-06-12T08:30:00',
    '2026-06-12 08:30:00'
  ];

  readonly jalaliSamples = ['14050202', '1405-02-02', '1405/02/02'];

  constructor() {
    this.dayRange.valueChanges.subscribe(() => this.rangeChanges.update(n => n + 1));
  }

  loadFromServer(): void {
    this.serverDemo.setValue('2026-09-09');
  }

  format(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return Array.isArray(value) ? value.join('  →  ') : String(value);
  }
}
