// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

// Explicit empty submenu for the root list. Without this, Next.js parallel
// routes keep the previous slot (AiRoomTabs from /ai-agents/[id]) on soft
// navigation back to /ai-agents — `default.tsx` is only used as the
// fallback for unmatched slot trees, not for routes that are matched at a
// sibling level.
export default function ListSubmenu() {
  return null;
}
