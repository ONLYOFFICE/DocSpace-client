---
name: audit-stories
description: Audit ui-kit components against their Storybook stories — find components without stories, props and states no story shows, stories that drifted from the component's real API or behavior. Invoked without a named component it always starts by asking which one to audit — a menu of component folders, never a scope picked on its own. Use for a component, a folder, or (deliberately) the whole library.
argument-hint: "<component | folder> [all]"
---

# Stories audit

In `libs/ui-kit` the stories are the only written description of a
component — there are no rule files to lean on. This skill compares
each component's actual code with its stories and reports where they
disagree. Everything found here is fixed in the submodule's own
repository (edit its working tree), never in the client repo.

Scope: the component or folder from the argument. When neither the
argument nor the request names one, **the scope question is
mandatory**: ask it with the interactive option dialog before opening
a single file. Discovering that only one candidate looks relevant is
research, not an answer — the dialog still runs, with that candidate
first, marked "(Recommended)". Options are real component folders
from `libs/ui-kit` — the dialog holds four, so offer the most recently
changed ones and let the built-in "Other" cover the rest. Never pick a
scope yourself. `all` sweeps the whole library — offer it only when
the user asks for a full audit, and warn that it is a long run and
prefer batching by folder.

## Checks, per component

1. **A story exists at all.** The ui-kit convention is one
   `.stories.tsx` per component; a component without one is a finding
   by itself.
2. **Props coverage.** Compare the exported props type
   (`<Name>.types.ts`) with what the stories exercise through `args`,
   `argTypes` and controls:
   - a prop no story ever sets — especially enum/variant props, where
     each variant deserves a story or a control;
   - callbacks that are wired in the component but invisible in every
     story (no action, no interaction).
3. **State coverage.** Conditional renders in the component (disabled,
   loading, error, empty, RTL-sensitive layout) that no story puts on
   screen.
4. **Staleness.** The reverse direction:
   - story `args` or `argTypes` naming props the component no longer
     has (spreads and loose typing let these survive compilation);
   - defaults shown in `argTypes`/docs that differ from the component's
     real defaults;
   - prose in the story or `.docs.mdx` claiming behavior the component
     code does not implement (verify each claim against the deciding
     code, never against other prose).
5. **Naming and placement** only when broken: the story must live next
   to the component and follow `<Name>.stories.tsx`.

## Report and fixes

- Rank: missing story file, then stale claims and dead args (actively
  misleading), then coverage gaps (merely incomplete).
- The report is an itemized list, never paragraphs of prose. Every
  item follows the same labeled skeleton, so the reader never guesses
  which side is speaking: **"The story shows:"** (or **"The story
  lacks:"** for coverage gaps) — what it renders or misses, with
  clickable `[file:line](path#LN)` links; **"The component actually:"**
  — the deciding code, with links; **"Fix:"** — the exact change when
  it fits in a line or two, otherwise a one-phrase description. Every
  item has a Fix line.
- Plain statements, written for a reader who has not seen the code: no
  metaphors, no imagery, no clever headlines ("the baseline PNG is a
  blank page" — never "the tests guard an empty page"). A causal chain
  is spelled out step by step in words ("the story never wires the
  prop the component needs to render, so it shows nothing, so the
  committed baselines are blank"), never compressed into a list of
  props the reader must decode.
- Apply fixes when asked: new or corrected stories follow the library's
  own conventions (see `libs/ui-kit/CLAUDE.md`) and land as ui-kit
  commits. Behavior that looks wrong in the *component* is reported as
  a potential bug, not papered over in the story.
