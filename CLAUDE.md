# Spotlight — Project Notes

This file tracks context for Claude Code sessions working in this repo. Keep it updated as work progresses.

## Stack

React Native (Expo 53) + NativeWind (Tailwind for RN), Redux, TanStack Query, Supabase, Prisma. Package manager is **Bun**. Not a web app — "shadcn" in this repo means a hand-rolled internal component kit at `src/shared/ui/`, not react-native-reusables (the actual RN port of shadcn). That was an explicit choice, not an oversight — see "Decisions" below.

## Status: UI/DRY/pre-commit overhaul (2026-08-16)

A full pass was done to (1) fix real bugs found during a codebase scan, (2) build a shared component kit and apply it everywhere, (3) redesign the card/grid components, and (4) add a pre-commit hook. All five phases below are **done**, but **the app has never actually been launched or visually checked** — everything was verified statically (`tsc --noEmit`, `eslint`). That's the first thing to do before trusting the visual result.

### Phase 0 — bug fixes

- Double-nested `Spotlight` gradient wrap on 13 screens (a global one already lives in `app/_layout.tsx`) — removed the per-screen duplicates.
- Black-on-black/invisible text from dead `dark:` Tailwind variants on an app that has no light mode (permanent black background) — stripped across ~18 files.
- White-on-white avatar-fallback text bug in `FollowRequestItem`.
- A literal `// comment` that was rendering as visible text in `ClosetScreen` (wasn't wrapped in `{/* */}`).
- A duplicated error-message render in `ForgetPasswordScreen`.
- Dead code removed: unused `useColorScheme`, an unreachable `PrimaryButton` `icon` prop (later properly implemented since one screen needed it), `GoogleButton`'s `String` vs `string` type bug, two fully orphaned/unrouted files (`NewItemScreen.tsx`, `useLoadUser.ts`).
- `tailwind.config.js` cleaned: removed dead Radix CSS-variable keyframes left from a copied web boilerplate (meaningless in RN/NativeWind), fixed the `destructive` token which was nonsensically white/black instead of red.
- Adopted the tailwind semantic tokens (`bg-background`, `text-foreground`, `bg-muted`, `border-border`, etc.) that existed in the config but had **zero** references anywhere in the app before this work.

### Phase 1 — the kit (`src/shared/ui/`)

`Button` (primary/outline/destructive variants, loading/icon support), `Input` (floating-label, replaces old `InputField`), `Divider`, `Avatar` (image-or-initials fallback), `Badge` (`VerifiedBadge` + `PillBadge`), `cn()` helper (clsx + tailwind-merge — both newly installed deps). All exported from `src/shared/ui/index.ts`.

### Phase 2 — Card / MediaGrid redesign

`Card` (row-list primitive: circle/square image, badge slot, title/subtitle/meta stack, trailing slot) and `MediaGrid` (square gallery grid). Collapsed `BrandCard`/`ProductCard`/`UserCard` → `Card`, and `BrandProductGrid`/`ProfileContentGrid` → `MediaGrid`.

Design call: kept both quiet — no shadows, no per-row glow. The app's one visual signature (the global `Spotlight` gradient) is already spent app-wide; `Card`/`MediaGrid` are supporting cast, not competing spotlights. One deliberate UX change: the video indicator moved from a dead-center overlay to a corner badge (doesn't cover the thumbnail's actual subject, unlike the generic default everywhere else).

### Phase 3 — full migration

Every remaining `InputField`/`PrimaryButton` consumer, plus hand-rolled full-width submit buttons, empty-state CTAs, and follow/accept/decline toggle buttons swept onto the kit across ~20 more files. `PrimaryButton.tsx`, `InputField.tsx`, and the old `shared/components/Divider.tsx` were deleted once zero references remained.

### Phase 4 — pre-commit hook

husky + lint-staged. `.husky/pre-commit` runs `bunx lint-staged` (eslint --fix + prettier --write on staged files) then `bunx tsc --noEmit` (full-project typecheck). Verified end-to-end (staged everything, ran both steps, then `git reset` to unstage since committing wasn't requested).

## Incidents this session (all resolved, worth knowing about)

- **`perfectionist/sort-objects` broke TanStack Query type inference.** Running `eslint --fix` alphabetized `useMutation`/`useInfiniteQuery` option-object keys. TanStack Query infers generics (`TContext`, `TPageParam`) from property _declaration order_ in those calls — alphabetizing silently broke it across ~10-13 hook files (`Property 'X' does not exist on type '{}'` errors). Fixed by reverting those files and **disabling `perfectionist/sort-objects` entirely** in `.eslintrc.js` (see the comment there). Don't re-enable it without addressing this.
- `package.json` got corrupted once mid-session (`"expo-auth-session"` → `"expo-auth-sesseas on"`), likely a race between an Edit and a concurrent `bun install`. Fixed; just worth knowing this can happen if editing `package.json` while an install runs in the background.
- Added `.eslintignore` (didn't exist before) — ESLint was hanging on `src/generated/prisma`'s 30MB generated tree (includes a 2.6MB base64 WASM blob).
- `tsconfig.json` now excludes `supabase/functions` (Deno runtime, was producing permanent false-positive noise in the RN project's typecheck).

## What's left

- **Launch the app and visually check it.** Not done yet. Look at `SearchScreen` (all 3 card types), a brand product grid, a profile media grid, and the auth flow.
- **35 pre-existing ESLint warnings** (not errors, don't block the commit hook), left as-is because they're outside this session's scope: `app/(app)/_layout.tsx` (missing `router` dep ×3), `onboarding.tsx` (unused `width`), `app/(app)/user/[id]/_layout.tsx` (unused `id`), `BrandIdentity.tsx` (unused `loading` prop), `BrandProfileScreen.tsx` + `MemoryDetailScreen.tsx` + `OwnershipDetailScreen.tsx` (missing deps in `useLayoutEffect`), `CameraScreen.tsx` (unused `authUser`), `CommunityProductFormScreen.tsx` (dead `isCompressing` state), `ItemFormScreen.tsx` (several unused types/vars), `NotificationsScreen.tsx` (unused `result`), `SearchScreen.tsx` (unused `handleClearSearch`/`handleUserPress` — look like incomplete features, not just dead code).
- **Segmented-control/chip pattern** (condition/size/color pickers, tab selectors) deliberately left out of the kit sweep — different interaction pattern than a `Button`. Would need a `ToggleGroup`/`Chip` primitive if unified later.
- `ProfileScreen.tsx` / `UserProfileScreen.tsx` have their own third grid implementation (FlatList-based, not `MediaGrid`) because it's entangled with scroll-driven header animations. Deliberately not unified.
- `src/shared/components/AvatarSpotlight.tsx` is a fully-built, well-crafted, **completely unused** component — a circular radial spotlight glow + bright ring, clearly meant for hero avatars. Never wired in. Would fit `ProfileIdentity`'s and `BrandIdentity`'s large avatar/logo nicely if doing more visual polish later.
- ~192 files are **uncommitted**. A large chunk of that diff is whitespace/line-ending normalization from an early whole-repo `bun run format` pass, not logic changes — worth its own commit, separate from the actual fixes.

## Decisions to respect

- **Hand-rolled `src/shared/ui/` kit, not react-native-reusables.** Explicit choice — don't suggest swapping to a component library.
- **"Better but not AI lookish."** Explicit design bar for any card/visual redesign — avoid the generic shadcn-flat-card-with-shadow template look. Lean into what's already distinctive here (translucent white fills, hairline borders, no shadows, the Spotlight gradient) rather than adding new decoration.
- **Strict pre-commit** (typecheck + prettier + eslint) was the chosen option over a more lenient one — this user is willing to eat upfront cleanup cost for a stronger gate.

## Before making changes

Re-run `bunx tsc --noEmit` and `bunx eslint src app --format compact` first to confirm the baseline is still clean (35 warnings, 0 errors).
