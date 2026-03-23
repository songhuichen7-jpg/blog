# Design System: The Quiet Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

This system moves away from the aggressive, loud patterns of standard web design toward a high-end editorial experience akin to a boutique gallery or a luxury print magazine. We achieve this through "The Breathable Layout"—rejecting rigid, boxed-in grids in favor of intentional asymmetry and expansive white space. By overlapping serif display type with soft, tonal surfaces, we create a sense of depth and curated intent. This isn't just a blog; it is a digital sanctuary where content is elevated to art.

## 2. Colors & Surface Philosophy
The palette is rooted in soft neutrals and warm greys to mimic high-quality cotton paper. We use a "Tonal First" approach to define hierarchy.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f4f1) section should sit directly against a `background` (#faf9f7) to create a soft, natural break.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create nested depth:
- **Base Layer:** `surface` (#faf9f7) for the main canvas.
- **Mid-Tier:** `surface-container` (#edeeeb) for secondary sections or sidebar areas.
- **Top-Tier:** `surface-container-lowest` (#ffffff) for the most prominent content cards to provide a "clean" lift.

### The "Glass & Gradient" Rule
To avoid a flat "Bootstrap" feel, floating elements (like navigation bars or modals) should utilize Glassmorphism. Use `surface` at 80% opacity with a `backdrop-blur` of 12px. For primary CTAs, apply a subtle linear gradient from `primary` (#5f5e5e) to `primary-dim` (#535252) at a 45-degree angle to add a metallic, premium "sheen."

## 3. Typography
The typographic soul of this system lies in the tension between the classical **Noto Serif** and the modern, architectural **Manrope**.

- **Display & Headlines (Noto Serif):** Used for `display-lg` through `headline-sm`. These should feel authoritative. Use tighter letter-spacing (-0.02em) for large headers to create a "locked-in" editorial look.
- **Body & Titles (Manrope):** Used for all functional text. Manrope’s clean geometry provides high legibility. 
- **The Hierarchy Narrative:** Use `display-lg` for article titles to command attention, while using `label-md` in all-caps with 0.1rem letter-spacing for categories (e.g., "LIFESTYLE") to mimic the headers of a luxury periodical.

## 4. Elevation & Depth
We eschew traditional "drop shadows" for a more sophisticated, ambient lighting model.

- **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` background. This "Tonal Lift" is the primary method of separation.
- **Ambient Shadows:** For floating elements, use an extra-diffused shadow: `box-shadow: 0 10px 40px rgba(47, 51, 49, 0.05);`. The shadow color is a tinted version of `on-surface` (#2f3331) at 5% opacity, never pure black.
- **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., an input field), use the `outline-variant` (#afb3b0) at **15% opacity**. 100% opaque borders are too "heavy" for this aesthetic.
- **Glassmorphism:** Apply to top-level navigation. Use `surface_bright` at 70% opacity with a heavy blur to allow the warm neutrals of the content to bleed through as the user scrolls.

## 5. Components

### Buttons
- **Primary:** Background `primary` (#5f5e5e), Text `on_primary`. Roundedness `md` (0.375rem). Use a subtle scale-up transform (1.02) on hover.
- **Secondary:** Background `secondary_container` (#d4e7d9), Text `on_secondary_container`. No border.
- **Tertiary:** Text `primary`. No background. Hover state: A subtle underline of `primary` with a 2px offset.

### Cards (The "Editorial Tile")
- **Visuals:** No borders. Background `surface-container-lowest`. 
- **Spacing:** Use `spacing-6` (2rem) for internal padding.
- **Hover State:** Instead of a heavy shadow, the card should shift to `surface-container-high` (#e6e9e6) with a smooth 300ms transition.

### Input Fields
- **Base:** Background `surface-container-low`. Ghost border (15% opacity `outline-variant`).
- **Focus:** Transition the border to 100% `outline` (#777c79). Use `label-sm` for floating labels to maintain the minimalist footprint.

### Lists & Dividers
- **Rule:** Forbid 1px horizontal dividers. 
- **Alternative:** Separate list items using `spacing-4` (1.4rem) of vertical white space or by alternating background tints between `surface` and `surface-container-low`.

### Chips (Category Tags)
- **Style:** Small caps `label-sm`. Background `secondary_fixed` (#d4e7d9) for a muted sage accent. Roundedness `full` (9999px) for a soft, organic feel.

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** Let images bleed off one side of the grid while text remains centered.
- **Use "The Breath":** If you think there is enough white space, add `spacing-4` more. 
- **Micro-interactions:** Use "ease-in-out" for all hover transitions to mimic the slow, deliberate movement of luxury brand interactions.

### Don't:
- **Avoid Pure Black:** Never use #000000. Use `on_surface` (#2f3331) for maximum readability and a softer, high-end feel.
- **No Heavy Borders:** Never use a 100% opaque border to separate content. It breaks the "Quiet Editorial" flow.
- **No Stock Shadows:** Avoid the default Figma or CSS shadow values. They are too "dirty." Stick to the tinted, ambient shadows defined in Section 4.