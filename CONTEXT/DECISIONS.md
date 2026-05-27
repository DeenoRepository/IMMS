# DECISIONS

## 1. Custom Global Fields Storage and Lifecycle
- **Decision**: Store administrator-defined custom global standard fields in a single JSONB column (`customFields` named `custom_fields` in DB) on the `Equipment` entity, rather than performing dynamic SQL ALTER TABLE migrations.
- **Rationale**: Dynamic schema alterations pose migration hazards, code generator inconsistencies, and potential schema lockups in enterprise environments. Storing dynamic fields in a flexible JSONB column allows schema-less additions at runtime.
- **Field Deletion**: When a custom standard field is deleted from the template configuration, it is removed from the active template settings. Existing records in the database retain their stored keys within the JSONB column for historical and audit purposes, but the UI filters them out since they are no longer defined in the standard template.

## 2. Enterprise Light Theme & Dynamic Text Accessibility Contrast Variables
- **Decision**: Redesign the light theme to follow modern, high-contrast, premium corporate guidelines (slate-white layout backgrounds, pure white card overlays, professional slate-blue input fields, and deeper primary brand colors like royal indigo blue, forest green, crimson, and ochre).
- **Text Color Variables**: Introduce dynamic text contrast CSS variables (`--color-primary-text`, `--color-success-text`, etc.) inside HSL token sheets instead of hardcoding button text colors in the core component CSS.
- **Rationale**: Standardizing contrast text colors as theme variables resolves the accessibility contrast problem where buttons with medium-dark backgrounds (like royal blue or crimson) in light theme would otherwise suffer from poor legibility if dark button text colors were hardcoded globally. It permits clean, high-contrast white text on buttons in Light Theme, and dark text on neon-shaded buttons in Dark Theme.

## 3. High-Fidelity Modal Windows UI/UX Redesign
- **Decision**: Refine the visual design of modal components using premium SaaS conventions (translucent dark overlays, deep backdrop blurs, organic spring-like scale transitions, perfect circular close buttons, and seamless footers).
- **Rationale**: Elevating visual presentation, animations, and transitions reinforces application high quality and builds trust in enterprise users. Heavy dark backdrops and sharp entry transitions are replaced with smooth animations (`scale(0.96) translateY(12px) -> scale(1) translateY(0)`) and generous backdrop blurs (`blur(8px)`). Raw text close markers are swapped for beautifully proportioned vector graphics to ensure crisp, scalable displays.

## 4. Input Wrapper Layout Standardisation & wrapperStyle Implementation
- **Decision**: Introduce a `wrapperStyle` prop to `Input` and `Select` components to enable outer layout override control (specifically bottom margins) on form field elements when aligning them side-by-side or in horizontal layouts.
- **Rationale**: Passing standard `style` props directly to inputs applies them to the inner `<input>` or `<select>` HTML tag rather than the parent layout `div.mech-input-wrapper`. This caused horizontal inline filter cards to retain the default `margin-bottom: 20px` spacing from the wrapper, causing alignment anomalies. The `wrapperStyle` prop elegantly resolves layout spacing discrepancies while maintaining self-contained, clean design system components.


