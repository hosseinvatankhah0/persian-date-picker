# Persian Date Picker (Angular)

A customizable Jalali (Persian) date and time picker component for modern Angular applications.

## Features
- **Modal & Inline modes**: Display as a popup input or embed as an inline calendar.
- **Multiple Modes**: Support for `day`, `month`, `time`, and `daytime` selection.
- **Range selection**: `selectionMode="range"` turns the day or month calendar into a
  from-to picker with a connected range band and live hover preview.
- **ControlValueAccessor Integration**: Seamless integration with Angular Reactive Forms and `ngModel`.
- **Locale Support**: Persian (`fa`) and English (`en`) locale support via `jalali-moment`.
- **Date Constraints**: Easy min/max date and time boundaries.
- **Modern Styling**: Styled with clean UI guidelines inspired by modern date-time pickers.
- **Accessible by default**: the modal traps and restores keyboard focus, calendar cells carry full localized labels, and controls meet WCAG touch-target sizing.

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

Inline calendars remain visible without an input or a backdrop.

## Accessibility

- The modal exposes `role="dialog"` / `aria-modal="true"`, traps Tab focus while open,
  and returns focus to the triggering element on close.
- The input opens the calendar on `ArrowDown` or `Enter` and closes it on `Escape`,
  so the picker is reachable without a mouse. Focus alone does not open it while the
  field is typeable — otherwise the dialog would steal the caret from anyone typing
  a date by hand.
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

## Installation

Ensure you have `jalali-moment` installed in your project:

```bash
npm install persian-date-picker-angular jalali-moment
```

## Development

| Script | Purpose |
|---|---|
| `npm start` | Serves the playground app (`projects/playground`), which exercises every mode side by side. |
| `npm test` | Runs the unit suite (Vitest) — 112 specs across the calendar, range, format and keyboard-navigation behaviour. |
| `npm run test:navigation` | Runs the standalone month-navigation script (`scripts/test-navigation.cjs`) on its own. |
| `npm run build:lib` | Builds the publishable package into `dist/persian-date-picker`. |
| `npm run build:playground` | Production-builds the playground app. |
| `npm run publish:lib` | Builds the library and publishes `dist/persian-date-picker` to npm. |

The root `package.json` is a dev workspace, not the published artifact — `ng-packagr`
compiles the library into `dist/persian-date-picker` with its own generated
`package.json` (scripts and devDependencies stripped). Always publish from there, e.g.
via `npm run publish:lib`; publishing directly from the repo root ships raw TypeScript
source instead of the compiled package and is blocked by a `prepublishOnly` guard.

## Usage

Import `PersianDatePickerComponent` into your standalone component or Angular module:

```typescript
import { Component } from '@angular/core';
import { PersianDatePickerComponent } from 'persian-date-picker-angular';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [PersianDatePickerComponent, ReactiveFormsModule],
  template: `
    <app-persian-date-picker 
      [formControl]="dateControl"
      mode="day"
      pickerType="modal"
      placeholder="انتخاب تاریخ">
    </app-persian-date-picker>
  `
})
export class ExampleComponent {
  dateControl = new FormControl('');
}
```

## API Reference

### Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `mode` | `'day' \| 'month' \| 'time' \| 'daytime'` | `'day'` | The selection mode of the picker. |
| `pickerType` | `'modal' \| 'inline'` | `'modal'` | Display style: input with modal overlay or inline component. |
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
| `fontSize` | `number` | `23` | Icon font size in px. |
| `selectionMode` | `'single' \| 'range'` | `'single'` | Range selection for `day` and `month` modes. |
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
the user reads in the box.

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
```

Which calendar a bare `YYYY-MM-DD` string belongs to is decided by its year: a
four-digit year above 1500 is Gregorian, anything lower is read as Jalali.

### Setting `format` turns detection off

Declaring a format says you already know the shape, so nothing is guessed and
the model keeps that format's own calendar:

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

If you set `--dp-input-border: none`, give the field its own focus indicator: the
built-in one is a tinted border plus a soft halo, and removing the border leaves
only the halo.

## License
MIT — see [LICENSE](LICENSE).
