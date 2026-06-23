# WorldCup Live Design System

## 1. Atmosphere & Identity

WorldCup Live is a compact match command center for Korean football fans. It should feel fast, fresh, and matchday-ready: clear enough to scan during live play, but polished enough to feel like an official tournament surface. The signature is glassy pitch-side depth: white panels, saturated football green, small flashes of lime and orange, and ball-texture details used only where they support live context.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/page | `--bg` | `#f3f6f4` | n/a | Page base |
| Surface/primary | `--surface` | `#ffffff` | n/a | Cards, panels, dialog |
| Surface/secondary | `--surface-soft` | `#f8faf8` | n/a | Team rows, nested panels |
| Text/primary | `--ink` | `#111a16` | n/a | Body and primary labels |
| Text/heading | `--heading` | `#0b1711` | n/a | H1, H2, score values |
| Text/secondary | `--muted` | `#66746c` | n/a | Metadata, helper copy |
| Border/default | `--line` | `#e3ebe6` | n/a | Cards, dividers, controls |
| Accent/primary | `--green` | `#0f8a4b` | n/a | Primary CTA, live state |
| Accent/hover | `--green-dark` | `#075f34` | n/a | Hover text, secondary CTA |
| Accent/soft | `--green-soft` | `#e7f7ed` | n/a | Eyebrows, live badge bg |
| Accent/highlight | `--lime` | `#b7f05a` | n/a | Match-card top stripe only |
| Status/warning | `--orange` | `#ff6b35` | n/a | Goal count, stripe accent |
| Status/info | `--blue` | `#2563eb` | n/a | Scheduled badge |

### Rules

- Green is the primary identity and interaction color.
- Lime and orange are supporting matchday accents, not general-purpose decoration.
- Raw colors may appear only as alpha variants of these tokens or in generated image assets.
- The page is light-only for now; add dark tokens before adding dark mode.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(2.8rem, 4.8vw, 4.8rem)` | 950 | 0.94 | -0.05em | Hero title |
| H1 modal | `clamp(2rem, 5vw, 4rem)` | 950 | 0.96 | -0.05em | Dialog title |
| H2 | `clamp(1.6rem, 3vw, 2.8rem)` | 950 | 1.0-1.1 | -0.05em | Section headings |
| H4 | `1.05rem-1.08rem` | 950 | 1.2 | -0.05em | Panel subheads |
| Body/lg | `1rem-1.16rem` | 400-760 | 1.55-1.68 | 0 | Hero copy |
| Body | `1rem` | 400-850 | 1.5 | 0 | Default text |
| Body/sm | `0.82rem-0.94rem` | 700-950 | 1.45-1.55 | 0 | Metadata, rows |
| Overline | `0.72rem` | 950 | 1.3 | 0.14em | Section labels |

### Font Stack

- Primary: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Mono: none currently used.
- Serif: none.

### Rules

- Keep all visible UI in Korean unless the label is a globally understood football/status term.
- Body text must stay at or above `0.82rem`; never shrink to solve overflow.
- Heading scale uses `clamp()` so hero and dialog titles do not overflow mobile widths.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a base of 4px.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline gaps |
| `--space-2` | 8px | Header padding, compact controls |
| `--space-3` | 12px | Card gaps, alert padding |
| `--space-4` | 16px | Default panel gaps and card padding |
| `--space-5` | 20px | Panel padding |
| `--space-6` | 24px | Dialog and live panel padding |
| `--space-8` | 32px | Large internal spacing |
| `--space-10` | 40px | Major stack spacing |
| `--space-14` | 56px | Page bottom padding |

### Grid

- Max content width: 1280px.
- Page gutter: `calc(100% - 32px)` desktop, `calc(100% - 20px)` mobile.
- Desktop dashboard: main column plus 370px scorer rail.
- Hero: content plus 270px live panel.
- Breakpoints: 1100px collapses navigation/dashboard; 760px collapses all multi-column cards.

### Rules

- Prefer CSS Grid for match cards, schedules, status summaries, lineups, and dashboard composition.
- Use one-column mobile fallbacks by 760px.
- Full-height sections are not used; avoid `h-screen`.

## 5. Components

### Header

- **Structure**: brand, section navigation, refresh button.
- **Variants**: sticky desktop pill; compact mobile with hidden nav and brand text.
- **Spacing**: `--space-2` shell padding, `--space-3` brand gap.
- **States**: nav hover, refresh disabled loading text.
- **Accessibility**: header links use anchors, refresh is a button.
- **Motion**: no entrance motion.

### Button

- **Structure**: `.button` plus variant class.
- **Variants**: primary, secondary, ghost, small.
- **Spacing**: 46px minimum height, 18px inline padding; small uses 36px and 14px.
- **States**: hover inherited by parent where applicable, disabled on refresh.
- **Accessibility**: visible text labels, no icon-only buttons except dialog close with `aria-label`.
- **Motion**: hover motion should use transform/box-shadow only.

### Panel And Card

- **Structure**: `.panel`, `.status-card`, `.match-card`, `.lineup-card`.
- **Variants**: match card, schedule day, scorer row, live panel.
- **Spacing**: panels use 20px; compact nested cards use 9-16px.
- **States**: match cards and schedule items have hover borders/backgrounds.
- **Accessibility**: match cards are keyboard-openable with Enter and Space.
- **Motion**: 160ms transform and shadow for match-card hover.

### Dialog

- **Structure**: native `dialog` containing sticky close button and detail sections.
- **Variants**: loading, goals present, goals empty, lineup unavailable.
- **Spacing**: 24px content padding, 16px nested panels.
- **States**: backdrop click closes, close button is keyboard reachable.
- **Accessibility**: dialog title uses `aria-labelledby`.
- **Motion**: no custom animation yet.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 160ms | ease | Match card hover |
| Standard | 200-300ms | ease-in-out | Future dialog or filter transitions |
| Emphasis | 400-600ms | cubic-bezier(0.16, 1, 0.3, 1) | Reserved for future hero state changes |

### Rules

- Animate only `transform`, `opacity`, `filter`, and shadow intensity.
- Every clickable card must be reachable by keyboard or be a real button.
- Respect reduced motion before adding any new non-essential animation.

## 7. Depth & Surface

### Strategy

Mixed, with a strict rule: primary page panels use white glass with soft green-tinted shadow; nested content uses tonal shift and light borders. Do not add unrelated shadow colors.

| Level | Value | Usage |
|-------|-------|-------|
| Default | `0 18px 50px rgba(18, 53, 34, 0.10)` | Panels and cards |
| Header | `0 14px 36px rgba(18, 53, 34, 0.09)` | Sticky header |
| Hover | `0 18px 38px rgba(18, 53, 34, 0.14)` | Match cards |
| Modal | `0 32px 90px rgba(0,0,0,0.26)` | Dialog surface |

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xl` | 30px | Hero panels, dialogs, primary panels |
| `--radius-lg` | 22px | Status cards, match cards, schedule days |
| `--radius-md` | 16px | Alerts, scorer rows |

### Rules

- Keep rounded geometry consistent: pills for controls and badges, 16-30px for panels.
- Do not nest decorative cards inside decorative cards unless the inner card is a data row.
