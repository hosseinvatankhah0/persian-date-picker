# Refined Plan: Create and Improve PersianDatePickerComponent

## Context
Create a `PersianDatePickerComponent` wrapper around `DatePickerModalComponent` to support both `inline` and `modal` modes, resolve missing utilities, and improve styling.

## Implementation Steps

### Phase 1: Component Structure
- Create `PersianDatePickerComponent` as a wrapper for `DatePickerModalComponent`.
- Add `@Input() inline: boolean = false` to `PersianDatePickerComponent`.

### Phase 2: Configuration & Utility Setup
- Configure `DatePickerModalComponent` within the wrapper to render as `inline` when requested.
- Replace all instances of `GDate` with standard `Moment` or `IDate` types.
- Ensure all necessary utilities are imported from `common/services/utils/utils.service.ts`.

### Phase 3: Style Improvement
- Utilize variables from `common/styles/variables.less`.
- Ensure styles are scoped correctly to avoid leaking.

### Phase 4: Documentation
- Create a comprehensive `README.md` documenting component inputs, outputs, and usage examples for both modes.

### Phase 5: Verification
- Verify the wrapper component correctly delegates inputs/outputs.
- Test inline rendering vs. modal triggering.
