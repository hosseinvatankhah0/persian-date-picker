# Persian Date Picker for Angular

A standalone Angular 22 date picker for the Persian (Jalali/Shamsi) calendar: day, month, time and date-time selection, date ranges, keyboard access, and Reactive Forms. تقویم شمسی با امکان انتخاب تاریخ و ساعت.

[npm package](https://www.npmjs.com/package/persian-date-picker-angular) · [Source and issues](https://github.com/hosseinvatankhah0/persian-date-picker)

## Features
- **Modal & dropdown modes**: Open a dialog or an input-anchored dropdown with `pickerType="inline"`.
- **Multiple Modes**: Support for `day`, `month`, `time`, and `daytime` selection.
- **Range selection**: `selectionMode="range"` turns the day or month calendar into a
  from-to picker with a connected range band and live hover preview.
- **ControlValueAccessor Integration**: Seamless integration with Angular Reactive Forms and `ngModel`.
- **Locale Support**: Persian (`fa`) and English (`en`) locale support via `jalali-moment`.
- **Date Constraints**: Easy min/max date and time boundaries.
- **Modern Styling**: Styled with clean UI guidelines inspired by modern date-time pickers.
- **Accessible by default**: the modal traps and restores keyboard focus, calendar cells carry full localized labels, and controls meet WCAG touch-target sizing.
- **Direct date entry**: Type or paste Jalali dates, or bind Gregorian ISO 8601 and .NET date strings from a form or API.

## Quick start

Use this package in an Angular 22 application. Install the picker and its Jalali and CDK peers:

```bash
npm install persian-date-picker-angular jalali-moment @angular/cdk
```

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PersianDatePickerComponent } from 'persian-date-picker-angular';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ReactiveFormsModule, PersianDatePickerComponent],
  template: `
    <app-persian-date-picker
      [formControl]="dateControl"
      mode="day"
      placeholder="انتخاب تاریخ">
    </app-persian-date-picker>
    <p>{{ dateControl.value }}</p>
  `
})
export class ExampleComponent {
  dateControl = new FormControl('');
}
```

The input is editable and centered. By default, clicking or focusing it does not open the calendar; the calendar icon does. To also open it from the field, set `[openOnClick]="true"` or `[openOnFocus]="true"`.

**Upgrading from 2.x:** The input used to open the picker on click and focus. Set both inputs to `true` if your app relies on that behavior. See [CHANGELOG.md](CHANGELOG.md).

## Calendar navigation

Click the calendar heading to switch from days to months, then click the year
heading to browse a 21-year page. Select a year, then a month to return to days.
Month buttons use a three-column layout; months and years outside `minDate` and
`maxDate` are disabled. Persian and English calendars use their own month boundaries.
In `fa` the heading's numerals are rendered as Persian digits.

Composing `CalendarNavComponent` directly? Its `labelAction`, `previousLabel`,
`nextLabel` and `currentLabel` inputs replace the built-in wording of the heading
button and the prev/next/today controls; left unset, each falls back to the
active locale's default.

## Selecting a range

```html
<app-persian-date-picker
  [formControl]="rangeControl"
  mode="day"
  selectionMode="range">
</app-persian-date-picker>
```

The first click opens the range, the second closes it (the ends swap if you pick
backwards), and a third click starts a new one. The value is an array of two
formatted strings; the input shows them joined by `rangeSeparator` (default `" - "`)
and is read-only, since free-text editing of a joined range is ambiguous.
`selectionMode` works in `day` and `month` modes; `daytime` always selects a single
moment.

Above the grid the picker shows which end it is waiting for: a one-line
instruction plus the two endpoints, with the one the next click will fill
outlined. It is announced to screen readers via `aria-live`, so the step is not
carried by the outline alone. Nothing is written to the form until both ends
exist — a half-picked range never reaches the host.

## Confirming a selection

There is one action row, and only where it earns its place:

| Mode | Action row | When `onChange` fires |
|---|---|---|
| `day` / `month`, single | hidden | immediately on click, then the modal closes |
| `day` / `month`, range | shown | on **تایید / Confirm** |
| `time`, `daytime` | shown | on **تایید / Confirm** |

Modes that build a value over several interactions keep it *pending*: the host sees
no half-finished values, and **انصراف / Cancel** restores the last confirmed value.
Set `showActionButtons` on the component (or in `config`) to override this.

`pickerType="inline"` opens an input-anchored dropdown without a full-screen backdrop. It uses the same icon and field-trigger inputs as the modal mode.

## Accessibility

- The modal exposes `role="dialog"` / `aria-modal="true"`, traps Tab focus while open,
  and returns focus to the triggering element on close.
- The input opens the calendar on `ArrowDown` or `Enter` and closes it on `Escape`,
  so the picker is reachable without a mouse. Click and focus opening are disabled
  by default, leaving the caret in place for typing; they can be enabled separately.
- Day and month buttons carry a full localized `aria-label` (weekday, day, month, year),
  not just the short number shown on the chip, plus `aria-current="date"` for today and
  `aria-pressed` for the selected state.
- Navigation buttons (previous/next/today) are labeled in the active locale rather than a
  hardcoded language.
- The day grid is one Tab stop, not 42: arrow keys move by a day (following the
  right-to-left grid in `fa`), Up/Down by a week, PageUp/PageDown by a month, and
  Home/End to the ends of the week. Paging past the edge of the month brings the
  view along, and disabled dates are stepped over rather than blocking the cursor.
- Animations are skipped for users with `prefers-reduced-motion` set.
- Day cells, month chips, and the time steppers grow to ~44px under
  `(pointer: coarse)` so touch targets meet WCAG 2.5.5 without changing the visual size
  on desktop.

## Development

| Script | Purpose |
|---|---|
| `npm start` | Serves the playground app (`projects/playground`), which exercises every mode side by side. |
| `npm test` | Runs the Vitest unit and regression suite. |
| `npm run test:navigation` | Runs the month-navigation regression spec with the same Vitest runner as `npm test`. |
| `npm run build:lib` | Builds the publishable package into `dist/persian-date-picker`. |
| `npm run build:playground` | Production-builds the playground app. |
| `npm run publish:lib` | Builds the library and publishes `dist/persian-date-picker` to npm. |

The root `package.json` is a dev workspace, not the published artifact — `ng-packagr`
compiles the library into `dist/persian-date-picker` with its own generated
`package.json` (scripts and devDependencies stripped). Always publish from there, e.g.
via `npm run publish:lib`; publishing directly from the repo root ships raw TypeScript
source instead of the compiled package and is blocked by a `prepublishOnly` guard.

## API Reference

### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `mode` | `'day' \| 'month' \| 'time' \| 'daytime'` | `'day'` | The selection mode of the picker. |
| `pickerType` | `'modal' \| 'inline'` | `'modal'` | Full dialog or an input-anchored dropdown. |
| `locale` | `'fa' \| 'en'` | `'fa'` | Locale of the calendar UI and of the default `display-format`. |
| `format` | `string` | Jalali, from `mode` | Format of the **model** value (`ngModel` / form control). See [Value formats](#value-formats). |
| `display-format` | `string` | from `mode` + `locale` | Format shown in the **text box**. Independent of `format`. |
| `placeholder` | `string` | `'تاریخ'` | Input placeholder text. |
| `minDate` | `Moment \| string` | 100 years ago | Minimum selectable date. |
| `maxDate` | `Moment \| string` | +20 years | Maximum selectable date. |
| `minTime` | `Moment \| string` | — | Minimum selectable time, for `time` and `daytime` modes. |
| `maxTime` | `Moment \| string` | — | Maximum selectable time, for `time` and `daytime` modes. |
| `required` | `boolean` | `false` | Marks input as required. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `fontSize` | `number` | `23` | Calendar icon size in px. |
| `showCalendarIcon` | `boolean` | `true` | Show the icon button that opens the calendar. If hidden, enable a field trigger or use the keyboard. |
| `selectionMode` | `'single' \| 'range'` | `'single'` | Range selection for `day` and `month` modes. |
| `openOnClick` | `boolean` | `false` | Allow clicking the date field to open the picker. The calendar icon works independently. |
| `openOnFocus` | `boolean` | `false` | Allow focusing the date field to open the picker. |
| `showActionButtons` | `boolean` | auto | Forces the confirm/close row on or off. |
| `rangeSeparator` | `string` | `' - '` | Joins the two ends in the input display. |

### Outputs
| Output | Type | Description |
|---|---|---|
| `inputModelChange` | `EventEmitter<string>` | Emits the formatted date string whenever the value changes; in range mode the two ends joined by `rangeSeparator`. |

In range mode the form control value is a `string[]` of two formatted dates
(empty array when cleared).

## Value formats

Two separate formats: `format` is what the model holds, `display-format` is what
the user reads in the box. The field stays editable in single-date mode; range
mode uses a read-only field because it represents two values.

```html
<app-persian-date-picker
  [formControl]="control"
  format="jYYYY-jMM-jDD"
  display-format="jYYYY/jMM/jDD">
</app-persian-date-picker>
```

### Gregorian input is detected automatically

Leave `format` unset and a Gregorian value bound in from a server is recognised
and converted — the model ends up holding the Jalali string, not just the box.
All of these produce `1405/03/22`:

```ts
control.setValue('2026/06/12');
control.setValue('2026-06-12');
control.setValue('2026-06-12T00:00:00.000Z');  // ISO 8601
control.setValue('2026-06-12T08:30:00');       // .NET DateTime
control.setValue('2026-06-12 08:30:00');       // .NET DateTime with a space
```

Which calendar a bare `YYYY-MM-DD` string belongs to is decided by its year: a
four-digit year above 1500 is Gregorian, anything lower is read as Jalali.

The same rule covers every date you hand the picker, not just the bound value —
`minDate` / `maxDate`, `displayDate`, and the `min` / `max` in a `config` passed
to the exported services underneath. So `minDate="2016-10-25"` means October 2016 in
a `locale="fa"` picker rather than a Jalali year 2016 six centuries away.

### Typing and pasting dates

The input accepts `14050202`, `1405-02-02`, and `1405/02/02` as Jalali dates.
It also accepts Gregorian `2026-04-22T00:00:00.000Z`,
`2026-04-22T00:00:00`, and `2026-04-22 00:00:00`. A four-digit year above
1500 is read as Gregorian; lower years are read as Jalali. Partial text remains
visible while typing and updates the form only when it becomes a valid date.
The field displays the selected date using `display-format`; the form value
uses `format` (Jalali by default).

### Setting `format` turns detection off

Declaring a format says you already know the shape, so the model keeps that
format's own calendar. Gregorian formats also accept ISO date-time strings
from a backend:

```html
<!-- model stays Gregorian: "2026-06-12" -->
<app-persian-date-picker [formControl]="control" format="YYYY-MM-DD">
```

A format containing `j`-prefixed tokens (`jYYYY`) is Jalali, one without is
Gregorian — regardless of `locale`, which only drives the calendar UI. Set
`display-format` to show the user one calendar while the form holds the other.

## Theming the input box

The text box reads its own box metrics from custom properties, so a host design
system sets them once instead of having to out-specify the library's rules:

| Property | Default | Notes |
|---|---|---|
| `--dp-input-height` | `48px` | Set `auto` to size from padding instead. |
| `--dp-input-padding` | `8px 12px` | |
| `--dp-input-border` | `1px solid #dfe7e2` | |
| `--dp-input-radius` | `8px` | |

```css
app-persian-date-picker {
  --dp-input-height: 40px;
  --dp-input-border: 1px solid var(--my-field-border);
  --dp-input-radius: 4px;
}
```

The height default is a real `48px` rather than `auto` deliberately: at this font
size, padding-only sizing lands near 31px, which is under the 44px touch target
the rest of the picker honours at `(pointer: coarse)`. Opt into intrinsic sizing
if your own layout already guarantees the target.

`font-family` is not a variable — it is `inherit`, which is what pulls in the
host's typeface, since inputs do not inherit the page font on their own.

Input text is left-to-right and centered for dates and times. Mouse focus gets
a thin edge; keyboard focus gets an additional visible outline. If you replace
the input border with `--dp-input-border: none`, verify the focus indicator in
your host theme.

## License
MIT — see [LICENSE](LICENSE).
