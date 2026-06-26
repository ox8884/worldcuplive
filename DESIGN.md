# WorldCup Live Design System

## 1. Atmosphere & Identity

WorldCup Live is a premium match command center for Korean football fans. Like a stadium jumbotron at night — dark, focused, electrifying. The signature is **"stadium floodlight"**: deep pitch-dark surfaces make scores and live indicators glow like they're lit on a scoreboard. High contrast ensures everything is scannable at a glance, even during live play. The green field tone runs through the palette as a warm nod to the pitch, not as decoration.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Surface/page | `--bg` | `#080d0a` | Page background — deep pitch green-black |
| Surface/primary | `--surface` | `#141e18` | Cards, panels — dark field green |
| Surface/elevated | `--surface-elevated` | `#1d2b22` | Elevated cards, dialog content |
| Surface/hover | `--surface-hover` | `#25382c` | Card/button hover state |
| Text/primary | `--text-primary` | `#eef5f1` | Body, labels — off-white |
| Text/heading | `--text-heading` | `#ffffff` | H1, H2, score values — pure white |
| Text/secondary | `--text-secondary` | `#8baa9a` | Metadata, helper copy |
| Text/tertiary | `--text-tertiary` | `#4a6a58` | Very muted text |
| Accent/green | `--accent` | `#22ff7e` | Primary accent — electric field green |
| Accent/hover | `--accent-hover` | `#5cff9f` | Hover state |
| Accent/dim | `--accent-dim` | `rgba(34,255,126,0.12)` | Subtle glow backgrounds |
| Status/live | `--live` | `#ff3744` | Live indicator, live match border |
| Status/live-dim | `--live-dim` | `rgba(255,55,68,0.12)` | Live card background |
| Status/gold | `--gold` | `#ffd43b` | 1st place, winners |
| Status/orange | `--orange` | `#ff8c3a` | Warning, upcoming emphasis |
| Status/blue | `--blue` | `#3b82f6` | Info badges |
| Border/default | `--border` | `#1e2d25` | Card borders |
| Border/light | `--border-light` | `#2d4035` | More visible borders |
| Border/accent | `--border-accent` | `rgba(34,255,126,0.25)` | Accent borders |

### Rules

- Green accent is the single signature color — used for CTAs, active states, and decorative energy.
- Gold is reserved exclusively for 1st place / top rank. Not decorative.
- Red is for LIVE state only — don't use for errors or warnings.
- All surfaces are dark. No light mode. This is a scoreboard.

## 3. Typography

### Font Stack

- Primary: `"Pretendard Variable", Pretendard, "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif`
- Mono (for scores): `"JetBrains Mono", "Pretendard Variable", monospace`

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(2.8rem, 5vw, 4.8rem)` | 800 | 0.95 | -0.03em | Hero title |
| Section H2 | `clamp(1.6rem, 3vw, 2.6rem)` | 700 | 1.05 | -0.02em | Section headings |
| Score number | `clamp(2rem, 4vw, 3.2rem)` | 800 | 0.9 | -0.03em | Match card scores |
| Status number | `clamp(2rem, 3.5vw, 3rem)` | 800 | 0.95 | -0.02em | Stats in hero |
| Card title | `1rem` | 700 | 1.3 | 0 | Team names |
| Body | `0.94rem` | 500 | 1.6 | 0 | Description, info |
| Body/sm | `0.82rem` | 500 | 1.5 | 0 | Metadata, venue |
| Overline | `0.7rem` | 700 | 1.2 | 0.1em | Section labels (uppercase) |
| Badge | `0.72rem` | 800 | 1.2 | 0.04em | Match status badges |

### Rules

- Scores use tabular numbers (`font-variant-numeric: tabular-nums`) for consistent width.
- All numbers in data contexts (scores, rankings, counts) use weight 800 for impact.
- Keep Korean body text at or above 0.82rem.
- Never use Inter for headlines — Pretendard has better Korean glyphs.

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

- CSS Grid for all card layouts. No flex percentage hacks.
- Single column by 768px. No exceptions.
- Use `min-height: 100dvh` if a full-viewport section is needed, never `height: 100vh`.

## 5. Components

### Header
- **Structure**: brand logo, nav links, refresh button.
- **Variants**: sticky desktop pill; compact mobile with hidden text brand.
- **States**: nav link hover with accent glow; refresh button disabled state.
- **Motion**: backdrop-filter blur on scroll.

### Button
- **Structure**: `.btn` + variant class.
- **Variants**: primary (accent green fill), secondary (border only with glow on hover), ghost (text only).
- **States**: hover lifts 1px + glow intensifies; active scale(0.97).
- **Motion**: 200ms ease-out transform, box-shadow.

### Match Card
- **Structure**: article with topline (badge + time), teams rows (logo + name + score), venue, action.
- **Variants**: default, is-live (red border + glow), is-next (orange accent).
- **States**: hover lifts 3px with increased glow; cards are keyboard-activatable.
- **Motion**: 250ms cubic-bezier spring on hover; staggered entry on page load.

### Status Card
- **Structure**: compact data card with number and label.
- **Variants**: default, wide (for last-updated).
- **Motion**: counter animation on number change.

### Scorer Row
- **Structure**: rank badge, team logo, player name + team, goal count.
- **Variants**: podium (top 3) with gold gradient on rank #1.
- **Spacing**: compact 8px internal padding.

### Schedule Item
- **Structure**: time, team vs team, status/group.
- **States**: hover lift with border accent.
- **Spacing**: 10px padding, 8px gap.

### Dialog
- **Structure**: native `<dialog>` with sticky close, goal timeline, lineup cards.
- **States**: backdrop click closes; close button sticky at top.
- **Motion**: fade in with backdrop blur; 200ms ease.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease-out | Button press, toggle |
| Standard | 250ms | cubic-bezier(0.22, 1, 0.36, 1) | Card hover, panel transitions |
| Emphasis | 400ms | cubic-bezier(0.16, 1, 0.3, 1) | Dialog open, hero entry |
| Stagger | 60ms delay | — | Card list entry (each card delays 60ms) |

### Rules

- Animate only `transform`, `opacity`, `filter`, and `box-shadow`.
- Every interactive element has hover + active + focus states.
- Live dot pulses continuously (slow breathe: 2s).
- Respect `prefers-reduced-motion` — disable non-essential animation.
- Spring-like cubic-bezier for all hover effects (overshoot then settle).

## 7. Depth & Surface

### Strategy

**Glow + Tonal-shift** — dark surfaces separate by brightness, not borders. Interactive elements use colored glows (green for accent, red for live) that intensify on hover.

| Level | Value | Usage |
|-------|-------|-------|
| Surface | `--surface` | Default panels |
| Elevated | `--surface-elevated` | Cards, dialog |
| Hover | `--surface-hover` | Hovered cards |
| Glow/green | `0 0 24px rgba(34,255,126,0.12)` | Accent glow at rest |
| Glow/green-strong | `0 0 40px rgba(34,255,126,0.25)` | Accent glow on hover |
| Glow/red | `0 0 24px rgba(255,55,68,0.15)` | Live card glow |
| Modal | `0 24px 80px rgba(0,0,0,0.6)` | Dialog backdrop |

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xl` | 20px | Hero panels, dialogs |
| `--radius-lg` | 16px | Cards, match cards, schedule days |
| `--radius-md` | 12px | Status cards, scorer rows, inputs |
| `--radius-sm` | 8px | Buttons, badges |
| `--radius-pill` | 9999px | Nav pill, status badges |

### Rules

- Consistent radius hierarchy — outer panels larger, inner elements smaller.
- Glow replaces shadow as the primary depth cue.
- No nested decorative cards — data rows are flat.
