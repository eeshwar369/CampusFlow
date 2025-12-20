# Apple-Level Design System for CampusFlow

## Overview
This design system implements Apple-level professional elegance with sophisticated visual hierarchy, refined color palettes, and micro-interactions that create an extraordinary user experience.

## Core Principles

### 1. The 8pt Grid System
All spacing, padding, and margins use multiples of 8px for perfect mathematical balance:
- `--space-1: 8px`
- `--space-2: 16px`
- `--space-3: 24px`
- `--space-4: 32px`
- `--space-5: 40px`
- `--space-6: 48px`
- `--space-7: 56px`
- `--space-8: 64px`

### 2. Typography - Subtle Weight Differences
Using Inter/SF Pro fonts with carefully chosen weights:
- **Regular (400)**: Body text
- **Medium (500)**: Subtle emphasis
- **Semibold (600)**: Headings, labels
- **Bold (700)**: Primary headings

Font sizes follow a consistent scale:
- `xs: 12px` - Small labels, captions
- `sm: 14px` - Secondary text
- `base: 16px` - Body text
- `lg: 18px` - Large body
- `xl: 20px` - Small headings
- `2xl: 24px` - Medium headings
- `3xl: 32px` - Large headings
- `4xl: 40px` - Hero headings

### 3. Neutral + 1 Color Palette
**Neutral Grays** (50-900 scale):
- Light mode: Gray 50 (lightest) → Gray 900 (darkest)
- Dark mode: Inverted scale for consistency

**Accent Color** (Sophisticated Blue):
- Primary: `--color-accent-600` (#2563EB)
- Hover: `--color-accent-700` (#1D4ED8)
- Light: `--color-accent-50` to `--color-accent-200`

**Semantic Colors**:
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Blue)

### 4. Soft Shadows - Ambient Depth
Replace heavy shadows with soft, large-blur ambient shadows:
- `--shadow-xs`: Minimal depth
- `--shadow-sm`: Subtle elevation
- `--shadow-md`: Standard cards
- `--shadow-lg`: Elevated elements
- `--shadow-xl`: Modals, popovers
- `--shadow-2xl`: Maximum depth

### 5. Micro-Interactions (200ms ease-in-out)
All interactive elements use consistent timing:
- `--transition-fast: 150ms` - Quick feedback
- `--transition-base: 200ms` - Standard interactions
- `--transition-slow: 300ms` - Complex animations

### 6. Border Radius
Consistent rounding for modern feel:
- `--radius-sm: 6px` - Small elements
- `--radius-md: 8px` - Standard
- `--radius-lg: 12px` - Cards, inputs
- `--radius-xl: 16px` - Large cards
- `--radius-2xl: 24px` - Hero elements
- `--radius-full: 9999px` - Pills, circles

## Implementation Examples

### Login Component (Refactored)
The login component demonstrates all principles:

**Visual Hierarchy**:
- Hero title: 40px bold with gradient
- Subtitle: 16px medium in gray-500
- Labels: 14px semibold in gray-700
- Body: 16px regular

**Spacing (8pt Grid)**:
- Card padding: 48px (space-6)
- Form group margin: 24px (space-3)
- Input padding: 14px vertical, 16px horizontal
- Button padding: 14px vertical, 24px horizontal

**Micro-Interactions**:
- Input focus: 1px lift + soft shadow (200ms)
- Button hover: 1px lift + darker shade (200ms)
- Icon transitions: 2px slide on hover (200ms)
- Error shake: 6px amplitude (300ms)

**Soft Shadows**:
- Card: `shadow-2xl` (25px blur, 0.25 opacity)
- Input focus: 3px ring with 8% opacity
- Button: `shadow-md` → `shadow-lg` on hover

**Accessibility**:
- All text meets WCAG AA contrast ratios
- Focus states clearly visible
- Error messages with icons and color
- Semantic HTML structure

## Component Refactoring Checklist

When refactoring other components, follow this checklist:

### Spacing
- [ ] Replace all hardcoded px values with CSS variables
- [ ] Ensure all spacing is multiples of 8px
- [ ] Use `var(--space-X)` consistently

### Typography
- [ ] Use `var(--font-size-X)` for all font sizes
- [ ] Apply appropriate font weights (400, 500, 600, 700)
- [ ] Set line-height: tight (1.25), normal (1.5), or relaxed (1.75)
- [ ] Add letter-spacing: -0.01em to -0.03em for headings

### Colors
- [ ] Replace all color values with CSS variables
- [ ] Use gray scale (50-900) for neutrals
- [ ] Use accent colors for interactive elements
- [ ] Ensure WCAG AA contrast (4.5:1 for text)

### Shadows
- [ ] Replace heavy shadows with soft ambient shadows
- [ ] Use `var(--shadow-X)` variables
- [ ] Add subtle shadows on hover states

### Borders
- [ ] Use 1px or 1.5px borders (not 2px+)
- [ ] Apply `var(--radius-X)` for border-radius
- [ ] Use gray-200 for light borders, gray-300 for emphasis

### Interactions
- [ ] Add `transition: all var(--transition-base)`
- [ ] Implement hover states (1px lift, darker shade)
- [ ] Add focus states (ring shadow, border color change)
- [ ] Include active states (return to base position)

### Animations
- [ ] Keep animations subtle (2-5% scale, 1-2px movement)
- [ ] Use cubic-bezier(0.4, 0, 0.2, 1) easing
- [ ] Duration: 150-300ms for most interactions

## Next Steps

### Priority Components to Refactor:
1. **Dashboard Components** (Student, Faculty, Admin)
   - Stat cards with refined shadows
   - Navigation with subtle hover states
   - Data tables with soft borders

2. **Form Components**
   - All input fields with consistent styling
   - Buttons with micro-interactions
   - Validation messages with soft colors

3. **Data Display**
   - Tables with refined typography
   - Cards with ambient shadows
   - Lists with subtle separators

4. **Navigation**
   - Header with refined spacing
   - Sidebar with soft hover states
   - Breadcrumbs with subtle typography

### Phased Approach:
**Phase 1**: Core Components (Login ✓, Dashboard, Header)
**Phase 2**: Forms & Inputs (All form components)
**Phase 3**: Data Display (Tables, Cards, Lists)
**Phase 4**: Specialized Components (Charts, Modals, Tooltips)

## Design Tokens Reference

All design tokens are defined in `frontend/src/styles.scss` under the `:root` selector. Import and use them throughout your components:

```scss
.my-component {
  padding: var(--space-3);
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}
```

## Accessibility Standards

All components must meet:
- **WCAG AA**: 4.5:1 contrast for normal text, 3:1 for large text
- **Focus indicators**: Visible on all interactive elements
- **Keyboard navigation**: Full support with logical tab order
- **Screen readers**: Semantic HTML and ARIA labels
- **Color independence**: Information not conveyed by color alone

## Resources

- **Inter Font**: https://rsms.me/inter/
- **SF Pro**: Apple's system font (auto-loaded on Apple devices)
- **WCAG Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **8pt Grid Guide**: https://spec.fm/specifics/8-pt-grid

---

**Status**: Login component refactored ✓
**Next**: Select one component to refactor as proof of concept
