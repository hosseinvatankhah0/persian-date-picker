# Changelog

## 3.0.2

### Fixed

- Fix `minDate`/`maxDate` enforcement on the typed-input field silently misreading the value on a page where anything (this library or a host app) had set jalali-moment's global locale to `fa` — the bare `moment()` constructor used to parse against that ambient state instead of the picker's own configured locale.
- Fix a bound value carrying a trailing time-of-day (e.g. `1405-07-05 11:53:28`, what a host's own "N days from now" datetime helper commonly formats) being silently dropped instead of bound when the picker's mode is date-only (`day`/`month`) and no explicit `format` is set — the auto-detected Jalali fallback only tried date-only formats, so it never matched and the picker rendered empty.
- Fix `getValidMomentArray` reading a typed date against jalali-moment's ambient global locale instead of the locale it was actually given, the same class of bug as above.

## 3.0.1

### Fixed

- Fix a data-corruption bug where an `en`-locale picker could silently misread a typed date (e.g. `1405/06/05`) as Jalali digits instead of Gregorian, landing hundreds of years off with no error shown.
- Accept unpadded Jalali dates (e.g. `1405/6/5`) typed directly into the field, matching what bound values already accepted.
- Detect unpadded Gregorian dates (e.g. `2026-9-5`) the same way as their zero-padded form.

## 3.0.0

### Breaking change

- Clicking or focusing the input no longer opens the calendar by default. The calendar icon opens it. Set `[openOnClick]="true"` and/or `[openOnFocus]="true"` to restore the previous behavior.

### Added and fixed

- Add `openOnClick` and `openOnFocus` signal inputs for explicit control over the field triggers.
- Accept compact, slash separated, and hyphen separated Jalali dates in bound values and typed entry.
- Parse Gregorian ISO 8601 and common .NET date strings consistently even when the global Jalali locale is active.
- Preserve incomplete text while typing; reject unsupported numeric years without throwing.
- Use a lighter input focus edge and add preview cases for icon-only, click, focus, inline, and common input formats.
- Refresh the package README and metadata; run navigation regressions through the active Vitest runner.
