# WorldCup Live Design System

## 1. Atmosphere & Identity

WorldCup Live is a premium tournament companion for Korean football fans. It should feel like the FIFA World Cup official app: deep, dignified, and globally recognizable. The signature is **"trophy room lighting"** — rich pitch-green darkness warmed by touches of gold, with clean white typography that feels broadcast-ready. No neon, no gaming aesthetic: this is the highest stage in football.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Surface/page | `--bg` | `#081410` | Page background — deep tournament green |
| Surface/primary | `--surface` | `#11221a` | Cards, panels |
| Surface/elevated | `--surface-elevated` | `#1a2e24` | Elevated cards, dialog |
| Surface/hover | `--surface-hover` | `#223b2e` | Hover state |
| Text/primary | `--text-primary` | `#f2f7f4` | Body, labels — warm white |
| Text/heading | `--text-heading` | `#ffffff` | Headlines, score values |
| Text/secondary | `--text-secondary` | `#8fa89c` | Metadata, helper copy |
| Text/tertiary | `--text-tertiary` | `#526b60` | Very muted text |
| Accent/gold | `--gold` | `#e8c547` | Primary accent — trophy gold |
| Accent/gold-hover | `--gold-hover` | `#f0d878` | Hover state |
| Accent/gold-dim | `--gold-dim` | `rgba(232,197,71,0.10)` | Subtle gold backgrounds |
| Accent/green | `--green` | `#2a9d5c` | Field green for live/CTA |
| Accent/green-soft | `--green-soft` | `rgba(42,157,92,0.12)` | Live badge backgrounds |
| Status/live | `--live` | `#ff4d4d` | Live indicator |
| Status/live-dim | `--live-dim` | `rgba(255,77,77,0.10)` | Live card background |
| Status/orange | `--orange` | `#e67e22` | Upcoming emphasis |
| Status/blue | `--blue` | `#4a90e2` | Info badges |
| Border/default | `--border` | `#1e3328` | Card borders |
| Border/light | `--border-light` | `#2d4538` | More visible borders |
| Border/gold | `--border-gold` | `rgba(232,197,71,0.25)` | Gold accent borders |

### Rules

- Gold is the single signature accent — used for CTAs, 1st place, and premium moments.
- Green is reserved for live/active states and football-field references.
- Red is for LIVE state only.
- No neon colors. All accents are desaturated and premium.

## 3. Typography

### Font Stack

- Primary: `"Pretendard Variable", Pretendard, "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif`
- Mono (for scores): `"JetBrains Mono", "Pretendard Variable", monospace`

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(2.6rem, 5vw, 4.4rem)` | 800 | 0.96 | -0.02em | Hero title |
| Section H2 | `clamp(1.5rem, 3vw, 2.4rem)` | 700 | 1.05 | -0.02em | Section headings |
| Score number | `clamp(1.8rem, 4vw, 3rem)` | 800 | 0.9 | -0.02em | Match card scores |
| Status number | `clamp(1.8rem, 3.5vw, 2.8rem)` | 800 | 0.95 | -0.02em | Stats in hero |
| Card title | `0.94rem` | 700 | 1.3 | 0 | Team names |
| Body | `0.94rem` | 500 | 1.6 | 0 | Description, info |
| Body/sm | `0.82rem` | 500 | 1.5 | 0 | Metadata, venue |
| Overline | `0.7rem` | 700 | 1.2 | 0.1em | Section labels (uppercase) |
| Badge | `0.72rem` | 800 | 1.2 | 0.04em | Match status badges |

### Rules

- Scores use tabular numbers for consistent width.
- All numbers in data contexts use weight 800.
- Keep Korean body text at or above 0.82rem.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a base of 4px.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline gaps |
| `--space-2` | 8px | Icon gaps, compact padding |
| `--space-3` | 12px | Card internal gaps |
| `--space-4` | 16px | Panel padding, card padding |
| `--space-5` | 20px | Section heading margin |
| `--space-6` | 24px | Dialog padding, hero padding |
| `--space-8` | 32px | Large internal spacing |
| `--space-10` | 40px | Major stack spacing |
| `--space-16` | 64px | Page section separation |

### Grid

- Max content width: 1200px.
- Page gutter: `calc(100% - 32px)` desktop, `calc(100% - 20px)` mobile.
- Desktop dashboard: main column + 340px scorer rail.
- Hero: content + 270px live panel.
- Breakpoints: 1024px collapses navigation and dashboard; 768px collapses all multi-column cards.

### Rules

- CSS Grid for all card layouts.
- Single column by 768px.
- Use `min-height: 100dvh` if a full-viewport section is needed.

## 5. Components

### Header
- Sticky glass pill with gold border on hover.
- Nav links use gold text on hover.

### Button
- Primary: gold fill with dark text.
- Secondary: gold border with gold text.
- Ghost: subtle border, green hover.

### Match Card
- Dark green surface, subtle border.
- Gold top accent line.
- Live variant: red accent line + soft red border.
- Hover: slight lift with gold border glow.

### Status Card
- Compact data card.
- Numbers in white, labels in muted green.

### Scorer Row
- Rank #1 gets gold gradient badge.
- Top 3 get podium highlight.
- Empty headshot falls back to default avatar.

### Schedule Item
- Time, teams, status.
- Hover: gold border accent.

### Dialog
- Dark elevated surface with gold border.
- Blurred backdrop.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease-out | Button press |
| Standard | 250ms | cubic-bezier(0.22, 1, 0.36, 1) | Card hover |
| Emphasis | 400ms | cubic-bezier(0.16, 1, 0.3, 1) | Dialog open |
| Stagger | 60ms delay | — | Card list entry |

### Rules

- Animate only `transform`, `opacity`, `filter`, and `box-shadow`.
- Every interactive element has hover + active + focus states.
- Live dot pulses.
- Respect `prefers-reduced-motion`.

## 7. Depth & Surface

### Strategy

**Tonal-shift + refined borders + gold glow.** Surfaces separate by brightness. Interactive elements get a warm gold glow on hover.

| Level | Value | Usage |
|-------|-------|-------|
| Surface | `--surface` | Default panels |
| Elevated | `--surface-elevated` | Cards, dialog |
| Hover | `--surface-hover` | Hovered cards |
| Glow/gold | `0 0 24px rgba(232,197,71,0.10)` | Gold glow at rest |
| Glow/gold-strong | `0 0 40px rgba(232,197,71,0.22)` | Gold glow on hover |
| Modal | `0 24px 80px rgba(0,0,0,0.55)` | Dialog |

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xl` | 18px | Hero panels, dialogs |
| `--radius-lg` | 14px | Cards |
| `--radius-md` | 10px | Status cards, scorer rows |
| `--radius-sm` | 8px | Buttons, badges |
| `--radius-pill` | 9999px | Nav pill, status badges |
