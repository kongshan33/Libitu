# Web visual system

## Neutral interface palette — 2026-11-06

Replace the warm UI gray ramp with neutral shared tokens: ink #0C0C0C, hover #262626, links #404040, descriptions #525252, muted text #6B6B6B, strong borders #D4D4D4, lines #E5E5E5, soft surfaces #EDEDED, cards #FAFAFA and video/dark inset #191919. Practice, Loadout, Mission, reports, skeletons, playback controls and dialog backdrops now inherit or reference these tokens instead of copied warm palettes or literals. The reference Rhythm envelope uses the shared soft gray. Sound phenomenon colors and status/brand palettes remain independent; saved content, layout and interactions are unchanged. The extension's existing gray UI already has equal RGB channels.

Base gray tokens are owned by `packages/ui/src/tokens.css`. Their RGB channels must be equal; features reference these tokens or semantic aliases rather than declaring another base palette. Component-specific neutral states, such as Corpus filter options, follow section 4 of `libitu_设计规范_v2_1_统一版_.md`. Keep ordinary text at least 4.5:1 against its actual background. Brand, status and Sound category colors are explicit exceptions; Sound's WK beige must not become a generic control background.

## Typography

Type scale (2026-11-20): application pages use one step smaller sizes, owned by `--text-*` tokens in `packages/ui/src/tokens.css`: H1 24, H2 18, H3 15, reading/transcript 16, body 14, help 13, meta 12, label and minimum HTML text 11, metrics 24, Review score 32, Stage 2 practice prompt 22 (19 on narrow screens). Web CSS references these tokens instead of literal pixel sizes; exceptions are the Landing marketing display sizes, SVG chart text scaled by its viewBox, icon glyphs, avatar initials and the 20px wordmark. Section 5 of `libitu_设计规范_v2_1_统一版_.md` holds the role table.

The user approved loading Inter on 2026-10-04. The root layout loads the locally bundled Inter 4.1 normal and italic variable fonts with `next/font/local`, `display: swap` and an adjusted Arial fallback. The `--font-ui` token selects this family across headers, body text and controls. Fonts and their OFL license live in `apps/web/app/fonts`; there are no remote font requests at runtime or build time. Unsupported glyphs fall back to system fonts. Metadata, pronunciation marks, IPA and structure templates also use `--font-ui`; `--font-mono` is a compatibility alias, not a monospace stack.

Existing grids, ordering, spacing, control dimensions and responsive breakpoints remain. Font metrics can change text wrapping; check narrow viewports after typography changes. The shared landing wordmark keeps its proportions, purple color and dot.

## Fields

Use `Input`, `Textarea` and `NativeSelect` from `apps/web/components/ui/field.tsx`. Existing Radix Select triggers share the same field appearance. Feature CSS still owns dimensions, padding, line height and resize behavior. `field.css` owns white surfaces, neutral borders, placeholder color, a single black focus boundary, invalid red borders, disabled states and reduced motion.

Inputs inside a search/video wrapper use `appearance="bare"`. Put `className="ui-field-surface"`, `data-field-surface` and `data-input-group` on the existing wrapper, preserving its existing feature class. Focus and invalid/disabled appearance then belong to the wrapper. Chat keeps its existing pill shape with `shape="pill"`. Keep native form semantics, labels, aria descriptions and handlers. Checkboxes, radios and file controls remain native; their purple accent and common disabled/focus feedback come from global tokens.

## Selection and learning colors

`--selection-background`, `--selection-text` and `--selection-border` define purple selected chips, segments and cards. Underline tabs retain their underline presentation. `aria-pressed`, `aria-selected` and the existing check marks communicate selection beyond color. Corpus kinds, success/warning and Sound/Rhythm/Melody teaching colors remain separate semantic roles; never apply generic purple selection styling indiscriminately to them.

## Actions

Follow [the button system](BUTTON_SYSTEM.md). Shared components own action paint; feature classes retain geometry. This follow-up removes 135 redundant appearance declarations from 50 rules used exclusively by shared buttons. Rules also used by native learning or selection controls remain where they are needed.

Auxiliary corpus deletion/sync, assessment retries, recording setup/finalization, saved-take playback/deletion/pagination and reference-analysis controls now show pending feedback. Only the action being performed shows progress; other conflicting actions remain disabled. Cancellable listening/preparation and continuous media states retain their existing explicit status and cancellation controls. Idle button content reserves the loading footprint.

## Verification

Verified 2026-10-04: root lint, production build and 1,185 tests pass (761 API, 306 web, 118 extension; unchanged tasks may use the build cache). All nine screens pass at 1440 and 390 px, with actual locally served Inter rendering and no horizontal page overflow. Inspected desktop/mobile screenshots include form error/edit/focus and the speaking composer.

`apps/web/tests/visual-system.browser.mjs` covers the nine principal web screens at desktop/mobile widths, verifies actual custom Inter glyph rendering through Chrome's font inspection, checks locally served font requests and horizontal overflow, and exercises field validation, search, editing and native selects. `buttons.browser.mjs` covers primary/destructive/recording states, focus, loading geometry, repeat-click prevention and reduced motion. Browser identity, API responses and microphone input are fixtures, not real provider acceptance.

Run root `pnpm lint`, `pnpm build` and `pnpm test`. Font or shared-style changes also require desktop/mobile visual inspection. Provider authentication and live microphone/service integration remain separate product checks.

## Page canvas

Reader footer follow-up (2026-10-04): the Stage 2 entry bar spans the viewport horizontally, canceling the reader gutter only for this footer. Its content keeps internal padding; other reader sections retain their responsive gutters.

Page backgrounds and outer gutters use the white primary background. Keep neutral secondary backgrounds for inner surfaces only; do not change the secondary token to recolor page canvases. Existing spacing and framing remain unchanged.

## Application header

`AppHeader` owns global navigation, Logo size, 32/20/16 px horizontal gutters and account actions on library, profile and mission pages. At 900 px and below, navigation occupies a second row; current-section links use purple selection colors. Mission-specific controls remain within the content.

## Select and directional controls

Use `SelectField` for controlled option lists and the Radix primitives for custom compositions. Empty values are encoded internally so All sources remains a selectable choice. Trigger arrows have 16 px horizontal inset; options have background highlights without borders or outlines, with a light 1 px menu edge and soft shadow. Native visible selects are no longer used.

Use `DirectionButton` and `DirectionLink` for back/next navigation: 36 px minimum height (`md`, 10 px `--radius-control` default radius), 16 px icons and 8 px gaps. Retain multiline card dimensions. Reader bottom padding is zero, with shell height accounting only for the top gutter.

Loadout follow-up: draft-save status keeps its layout footprint when hidden, with delayed visual feedback for normal-motion users. Textarea focus uses one 1 px black inset outline with a transparent border and no shadow. Directional links default to secondary outlined styling. Existing navigation wording is unchanged.

## Shared token cleanup — 2026-11-23

`packages/ui/src/tokens.css` adds optical neutral alpha tokens (`--surface-tint`, `--surface-hover`, `--border-subtle`, `--border-control`, `--border-strong`) strictly for borders and subtle fills while keeping text on opaque tokens (`>= 4.5:1` contrast). It also adds missing intermediate radius tokens (`--radius-control: 10px`, `--radius-card: 14px`, `--radius-full`), multi-stop optical shadow tokens (`--shadow-natural-xs/sm/md`, aliasing `--shadow-soft`, `--shadow-warm`, `--shadow-popover`, `--shadow-dialog`), and global motion tokens (`--motion-fast`, `--motion-normal`, `--ease-standard`, `--ease-decelerate`) so shared transitions in `globals.css`, `button.css` and `field.css` resolve outside `.practice-redesign`. `apps/web/app/globals.css` resets legacy `body` tracking from `0.14px` to `0`, and `apps/web/components/ui/field.css` scopes keyboard purple focus rings to Radix Select triggers so dead input/textarea focus rules no longer contradict the single 1 px black inset focus boundary.

## Shared Tabs and EmptyState primitives — 2026-11-24

`apps/web/components/ui/Tabs.tsx` (`Tabs.module.css`, `tabs-navigation.ts`) provides dual-mode WAI-ARIA `Tabs` (`underline` with animated bottom indicator for panel/section dimensions, and `segmented` with a `--line-soft` track and elevated `--bg` active pill using `--shadow-natural-xs`), plus `SegmentedControl` for navigation (`as="nav"` with `aria-current="page"`) and toggle-group (`role="group"` with `aria-pressed`) switches that share the segmented surface. `apps/web/components/ui/EmptyState.tsx` (`EmptyState.module.css`) provides a shared empty-state card (`--surface-tint`, `--border-subtle`, `--radius-card`, configurable heading level and compact/default density). Initial adoption covers Corpus Library, Corpus Detail, Stage 2 Shadow mode / Review empty state, and Profile Activity / Practice History.

## Floating Composer and Toast primitives — 2026-11-24

`apps/web/components/ui/Composer.tsx` (`Composer.module.css`) introduces the floating focal input surface (`variant="stacked"` for multi-line speaking/prompt cards and `variant="inline"` for single-line entry bars), pairing a crisp `--bg` surface, `--border-subtle` edge and `--shadow-natural-sm/md` optical diffusion while preserving the 1 px black inset focus boundary in `field.css` (`data-composer`). Initial adoption covers Stage 4 Speaking (`ConversationWorkspace` + `ConversationPreview`), Corpus Detail follow-up (`CorpusFollowup`), and the Landing YouTube entry bar (`VideoEntry`). `apps/web/components/ui/Toast.tsx` (`Toast.module.css`, `toast-store.ts`) provides a dark glassmorphic notification pill (6-layer optical glass shadow, tone-colored status dot, hover/focus auto-dismiss pause, Escape dismissal, polite/assertive live regions, zero DOM footprint when empty), mounted once in `apps/web/app/layout.tsx` and wired to non-blocking corpus save/remove, batch delete, and note-save confirmations.

## Action button system alignment — 2026-11-24

Shared buttons (`apps/web/components/ui/button.css`, `button-appearance.ts`, `design/docs/BUTTON_SYSTEM.md`) now default to a `10px` soft rounded corner (`--radius-control`), tighten the height ladder to `32 / 36 / 42 px` (`sm` / `md` / `lg`), use `90ms` (`--motion-instant`) transitions with `--ease-standard`, preserve per-variant disabled hierarchy, and support `shape="square"` alongside `circle` and `pill` for symmetrical icon buttons. `.ui-button-group` respects declared sibling sizes rather than forcing `lg`. Feature CSS overrides across Corpus, Loadout, Profile, Stage 1, Stage 2, Speaking, and shared navigation were cleaned up and remaining raw action `<button>` controls migrated onto `<Button>` / `<ButtonLink>` / `<DirectionLink>` (while keeping tabs, filter chips, `aria-pressed` toggles, and selectable cards independent).



