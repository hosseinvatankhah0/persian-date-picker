# Changelog

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
