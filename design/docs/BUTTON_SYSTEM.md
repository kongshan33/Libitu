# Shared button system

Established 2026-10-04; color rules revised 2026-11-06 and geometry, motion, and state rules aligned 2026-11-24 with the unified v2.1 spec (`design/docs/libitu_设计规范_v2_1_统一版_.md`). Primary actions use black with white text; secondary and soft actions use shared neutral grays. Learning and status semantic colors remain independent.

## Roles

| Variant | Use | Appearance |
|---|---|---|
| `primary` | Main action in a task or dialog | `--ink` / white; hover `--ink-hover`; pressed `--ink-2` |
| `secondary` | Alternative action | White / `--border-control` thin edge; hover `--surface-hover` + `--border-strong` edge |
| `soft` | Supporting action | `--surface`; hover `--line-soft`; pressed `--line` |
| `ghost` | Close, back and quiet tools | Transparent; hover `--surface-hover` |
| `danger` | Entry to destructive confirmation | Red text; hover `--color-danger-subtle` |
| `danger-outline` | Destructive action needing a visible boundary on a surface | White / red thin edge |
| `danger-solid` | Final destructive confirmation | Red / white; hover `--color-danger-strong`; pressed `--color-danger-pressed` |
| `record` | Start voice or recording | `--ink` / white; hover `--ink-hover`; pressed `--ink-2` |

## Implementation

Use `Button` and `ButtonLink` from `apps/web/components/ui/button.tsx` (and `DirectionButton` / `DirectionLink` from `apps/web/components/ui/direction-button.tsx`, fixed at `md` 36 px with default 10 px radius for back/next navigation); use `buttonAppearance` for native external anchors. Navigation stays an anchor. Button defaults to `type="button"`; forms explicitly set `type="submit"`.

Shared paint and interaction rules live in `button.css`; semantic colors and motion use `packages/ui/src/tokens.css` (transitions use `--motion-instant` with `--ease-standard`). Feature styles retain geometry during migration; shared appearance attributes override their legacy paint. New actions should not add per-page color, shadow, focus or disabled rules (dark-surface overrides such as the loadout hero may set `--button-*` custom properties). Disabled states preserve variant hierarchy: filled variants (`primary`, `danger-solid`, `record`) use `--line`/`--muted`, `secondary`/`danger-outline` keep a light surface with `--border-subtle`, `soft` keeps `--surface`, and `ghost`/`danger` stay transparent with `--muted` text. Do not recreate warm gray surfaces in feature overrides.

The mobile stage navigation explicitly permits shrinking inside its existing horizontal scroll area so the unified weight does not widen the page.

Existing controls use `size="inherit"` to retain padding, font size, width and height. New controls use `sm`, `md` or `lg` (32/36/42 px minimum height). Shared buttons default to a soft rounded corner (`--radius-control`, 10 px); explicit `shape="pill"` opts into pill geometry, and icon-only tools use explicit `shape="circle"` or `shape="square"` (`--radius-control`), which render symmetrically at 32/36/42 px with zero horizontal padding. Supply an accessible name for icon-only controls.

Pass stable idle children with `loading` and `loadingLabel`. The idle content reserves space while an overlay displays progress. Loading disables native clicks and exposes `aria-busy`; it does not replace application-level idempotency. Hover, pressed, keyboard focus, disabled and reduced-motion behavior are shared. Existing learning tabs, filters, switches and selectable cards retain their own selection semantics.

```tsx
<Button variant="primary" size="inherit" className={styles.save}
  type="submit" loading={saving} loadingLabel="Saving…">
  Save changes
</Button>
<ButtonLink variant="secondary" href="/corpus">Open corpus</ButtonLink>
```

## Current dimensions and focus (2026-11-24)

Shared sm/md/lg sizes use 12/13/14 px text, 18/20/20 px line heights, 10 px default corner radius (`--radius-control`) and 32/36/42 px minimum heights. Vertical/horizontal padding is 6/10, 7/12 and 10/16 px; icons are 14/16/18 px. Weight is 500. `.ui-button-group` coordinates group gaps (12 px) and vertical alignment while respecting each button's declared `size`; sibling controls in a group should declare the same size. Coarse-pointer targets are at least 44 px. Keyboard focus uses the shared 2 px brand outline with a 3 px offset. Text fields instead use a single 1 px black inset boundary. Historical verification below is dated evidence, not a fresh test of these rules.

## Verification

Verified 2026-10-04: desktop (1440 px) and mobile (390 px) button regressions pass. The mobile topbar and stage navigation now permit shrinking inside their existing layout, eliminating a 2 px regression introduced by uniform button weight.

Run root `pnpm lint`, `pnpm build` and `pnpm test`. The optional `apps/web/tests/buttons.browser.mjs` regression uses Playwright with Chrome and a running local web server. Set `LIBITU_PLAYWRIGHT_MODULE` when Playwright is outside the workspace. It checks desktop/mobile submit and link semantics, focus/hover colors, stable loading geometry, repeat-click prevention, reduced motion, destructive confirmation and recording state colors. Identity and API responses are fixtures; microphone input is synthetic. These checks do not verify real authentication or provider integrations.

Button backgrounds clip to the padding box so inherited transparent border widths do not produce an outer white halo around the inset edge. Saved Shadow practice uses small outlined actions and grouped metadata/actions.
