# Persian Date Picker (Angular)

A customizable Jalali (Persian) date and time picker component for modern Angular applications.

## Features
- **Modal & Inline modes**: Display as a popup input or embed as an inline calendar.
- **Multiple Modes**: Support for `day`, `month`, `time`, and `daytime` selection.
- **ControlValueAccessor Integration**: Seamless integration with Angular Reactive Forms and `ngModel`.
- **Locale Support**: Persian (`fa`) and English (`en`) locale support via `jalali-moment`.
- **Date Constraints**: Easy min/max date and time boundaries.
- **Modern Styling**: Styled with clean UI guidelines inspired by modern date-time pickers.

## Calendar navigation

Click the calendar heading to switch from days to months, then click the year
heading to browse a 21-year page. Select a year, then a month to return to days.
Month buttons use a three-column layout; months and years outside `minDate` and
`maxDate` are disabled. Persian and English calendars use their own month boundaries.

In `time` and `daytime` modes, use **Set / تأیید** to commit the time. Changing the
time does not close the picker. Closing the modal discards unconfirmed changes.
Inline calendars remain visible without an input or a backdrop.

Run `npm run test:navigation` for focused calendar regression tests and
`npm run build:lib` to validate Angular templates and build the package.

## Installation

Ensure you have `jalali-moment` installed in your project:

```bash
npm install jalali-moment
```

## Usage

Import `PersianDatePickerComponent` into your standalone component or Angular module:

```typescript
import { Component } from '@angular/core';
import { PersianDatePickerComponent } from 'persian-date-picker';
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
| `locale` | `'fa' \| 'en'` | `'fa'` | Locale used for formatting dates. |
| `placeholder` | `string` | `'تاریخ'` | Input placeholder text. |
| `minDate` | `Moment \| string` | 100 years ago | Minimum selectable date. |
| `maxDate` | `Moment \| string` | +20 years | Maximum selectable date. |
| `required` | `boolean` | `false` | Marks input as required. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `fontSize` | `number` | `23` | Icon font size in px. |

### Outputs
| Output | Type | Description |
|---|---|---|
| `inputModelChange` | `EventEmitter<string>` | Emits formatted date string whenever the value changes. |

## License
MIT
