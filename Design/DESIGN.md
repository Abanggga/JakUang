---
name: Jakuang Financial OS
colors:
  surface: '#f6f9ff'
  surface-dim: '#d4dbe3'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fd'
  surface-container: '#e8eef7'
  surface-container-high: '#e2e9f1'
  surface-container-highest: '#dce3ec'
  on-surface: '#151c22'
  on-surface-variant: '#474554'
  inverse-surface: '#2a3138'
  inverse-on-surface: '#ebf1fa'
  outline: '#787585'
  outline-variant: '#c9c4d6'
  surface-tint: '#5c47cd'
  primary: '#5a45cb'
  on-primary: '#ffffff'
  primary-container: '#7360e5'
  on-primary-container: '#fffbff'
  inverse-primary: '#c8bfff'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#855000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a76500'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c8bfff'
  on-primary-fixed: '#190064'
  on-primary-fixed-variant: '#442bb5'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdcbc'
  tertiary-fixed-dim: '#ffb86a'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#683d00'
  background: '#f6f9ff'
  on-background: '#151c22'
  surface-variant: '#dce3ec'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  financial-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  financial-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
This design system is engineered for a "Financial OS" experience—a high-utility environment that balances rigorous professional standards with an accessible, modern interface. The aesthetic is **Corporate / Modern** with a focus on data density and clarity. It avoids excessive ornamentation in favor of precise alignments, purposeful whitespace, and a high-contrast functional palette.

The goal is to evoke a sense of absolute control and reliability. The UI should feel like a sophisticated instrument—sharp, responsive, and systematic—while maintaining a welcoming entry point for non-expert users through soft rounding and a clear color hierarchy.

## Colors
The color palette is built on a foundation of high-contrast functionalism. 

*   **Primary (#7B68EE):** Used for structural navigation (sidebar), primary actions, and brand identification. It provides a modern, tech-forward alternative to traditional banking blues.
*   **Secondary (#FFD700):** Reserved for high-priority "Snap & Record" CTAs and active states that require immediate user attention. It serves as a visual "spark" against the cooler primary tones.
*   **Semantic Colors:** Success, Danger, and Warning colors are tuned for high legibility against the light background to ensure financial statuses are unmistakable.
*   **Neutral Palette:** The background (#F8F9FA) and surface (#FFFFFF) create a distinct "layered" effect, allowing content cards to pop. Grays are used for secondary text and borders to maintain a clean hierarchy.

## Typography
The typographic system utilizes a dual-font approach to maximize both readability and data precision.

1.  **Inter:** The primary workhorse. Its neutral, humanist qualities ensure that long-form text and interface labels remain highly legible at small sizes.
2.  **JetBrains Mono:** Dedicated exclusively to financial figures, currency symbols, and data tables. The monospaced nature ensures that decimal points align vertically in tables, providing the "tabular lining" essential for professional financial analysis.

Use **Display** styles for dashboard hero numbers, **Headline** styles for section titling, and **Financial** styles for any dynamic numeric value.

## Layout & Spacing
This design system employs an **8px grid system** to ensure mathematical consistency across all components.

*   **Dashboard Layout:** Use a 12-column fluid grid for desktop with 20px gutters. On mobile, transition to a single-column stack with 16px side margins.
*   **Sidebar:** The sidebar is fixed at 260px on desktop, collapsing to a bottom navigation bar or a hidden drawer on mobile devices.
*   **Padding:** Standardize card internal padding at `md` (16px) for compact data or `lg` (24px) for marketing or overview cards.
*   **Alignment:** All financial data in tables should be right-aligned to the JetBrains Mono typeface to ensure ease of comparison.

## Elevation & Depth
Depth is created through **Tonal Layering** supplemented by extremely subtle ambient shadows. 

1.  **Level 0 (Background):** #F8F9FA. The canvas on which the app sits.
2.  **Level 1 (Surface):** #FFFFFF. Used for the primary content cards and sidebar. These use a 1px border (#E9ECEF) instead of heavy shadows to maintain a "flat-modern" feel.
3.  **Level 2 (Interaction):** When a card is hovered or an element is active, apply a soft, diffused shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`.
4.  **Level 3 (Overlay):** Modals and dropdowns use a more pronounced shadow to separate them from the work surface: `0px 12px 32px rgba(0, 0, 0, 0.1)`.

Backdrop blurs (10px) are used sparingly for modal overlays to maintain context while focusing the user.

## Shapes
The shape language is a strategic mix of "Soft" and "Pill-shaped" elements to distinguish between regular UI and primary actions.

*   **Cards & Containers:** Use a 12px (0.75rem) corner radius. This provides a modern, friendly feel without becoming overly bubbly.
*   **Standard Inputs/Buttons:** Use an 8px radius for a sharper, more professional utility look.
*   **Main CTAs:** Use a "Full" (Pill) radius for high-priority actions like "Snap & Record" or "Add Transaction." This distinct shape makes these actions immediately identifiable.

## Components

### Buttons & CTAs
*   **Primary Button:** Solid #7B68EE with white text. 8px radius.
*   **Main CTA (Snap & Record):** Solid #FFD700 with dark (#212529) text. Fully rounded (pill).
*   **Ghost Button:** Transparent background with Primary color border and text.

### Cards
*   **Financial Card:** White surface, 12px radius, 1px light gray border. Headers should use Inter Semibold; currency values should use JetBrains Mono.

### Input Fields
*   **Text Input:** 8px radius, white background, 1px border (#DEE2E6). Active state uses a 2px Primary (#7B68EE) border.
*   **Financial Input:** Large-scale JetBrains Mono text, right-aligned, with the currency symbol fixed to the left or right as a suffix/prefix.

### Lists & Tables
*   **Data Rows:** 56px minimum height. Zebra striping is not used; instead, use thin 1px horizontal dividers. On hover, the entire row should shift to a very light gray (#F1F3F5).

### Status Chips
*   **Success/Danger/Warning:** Use a low-opacity background of the semantic color with high-opacity text of the same color (e.g., Success chip: Light green bg, dark green text). 4px radius.