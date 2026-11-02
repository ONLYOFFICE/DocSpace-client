# Proposal

## Why

The merge of release/v4.1.0 on 2026-11-02 removed the AI Agents sidebar section and brought the "AI rooms" item (Common:AiRooms) in its place, after Forms. The Private item kept its position: after Forms and before the AI section, which is now AI rooms. `private-rooms/sidebar-section`, "Sidebar item" still names AI Agents, and the E2E case "Section available" still looks for the AI Agents item, so it fails on the merged branch although the order is right.

## What Changes

- "Sidebar item" names AI rooms (Common:AiRooms) as the item the Private item precedes, shown while AI services are on, instead of AI Agents.
- The E2E case "Section available" in `packages/client/__tests__/private-rooms-section.spec.ts` expects Forms, Private and AI rooms in that order.
- No production code changes: the sidebar already places the item this way.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sidebar-section`: "Sidebar item" places the Private item before AI rooms instead of AI Agents.

## Impact

- E2E: `packages/client/__tests__/private-rooms-section.spec.ts`.
- Server (`../server`), Document Server, locales: no work.

## Out of scope

- Any change to the AI rooms section itself or to its position among the apps.

## Decisions for a human

- Decided 2026-11-02 by the owner: make this change now, with its implementation and archive.
