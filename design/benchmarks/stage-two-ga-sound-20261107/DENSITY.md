# Sound category density and filter opacity — 2026-11-07

## Scope

The user explicitly deferred audio phenomenon detection and evidence integration. This follow-up changes only category density, expansion and filtering in Detailed / Review. Existing text candidates remain unverified; this report does not claim audio detection or approve the earlier interpretation of duplicated candidate rows.

## Behavior

- Compact word labels show at most two distinct categories. Multiple independent events in the same category do not consume additional category slots; all original events remain in the explanation.
- A separate native `+N` button reports the number of additional categories and toggles the full category list in the existing explanation card. The word flow remains compact. Each button has a word/voice-specific name, `aria-controls`, `aria-expanded`, visible focus styling and a 44px mobile touch target. It is a sibling of the word button, never a nested button.
- Enter and Space use native button behavior. Repeating the toggle closes the card; selecting a different word/arc, changing filters, or hiding the text resets expansion. Concealed words expose no `+N` controls or category lists.
- Nonmatching inline badges and linking arcs remain at 20% opacity after filtering, including hover, keyboard focus and expanded arcs. Source words, status, category descriptions and explanation content keep their normal readability.
- Review reserves space beside each word for the independent control; a following pause does not move `+N` away from its word.

## Verification

- TypeScript check passed.
- Root lint passed.
- Root tests passed: API 1,996; Web 540; Extension 124. The category test now verifies distinct-category compaction, alternative selection and preservation of the source events.
- Final root build passed, including the positioning adjustment and TypeScript validation.
- Existing density browser regression updated for 1400px / 390px, Detailed / Review: two labels, `+N` click/Enter/Space toggle, complete category list, strict opacity through hover/focus/arc selection, no nested buttons, concealment and overflow. Node syntax check passed.
- Browser execution and screenshots are pending: computer-use inventory returned no available browsers or native applications and reported a service startup failure. The browser regression was not executed in this follow-up. Code checks do not replace responsive visual acceptance.
