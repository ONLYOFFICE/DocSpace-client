// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";

import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

// Non-reactive container for ai-agents layout commonData that descendant
// pages need but don't get via Next.js props. Used by `alias-files-list`
// to source `filesSettings.displayFileExtension` and `portalSettings.timezone`
// when rendering Knowledge / Result tabs (no SSR-prefetch path) — Recent /
// Favorites / Trash still receive these as explicit props from their own
// server components.
export type AgentsCommonDataValue = {
  filesSettings: TFilesSettings | null;
  portalSettings: TSettings | null;
};

const Ctx = React.createContext<AgentsCommonDataValue>({
  filesSettings: null,
  portalSettings: null,
});

export const AgentsCommonDataProvider = ({
  value,
  children,
}: {
  value: AgentsCommonDataValue;
  children: React.ReactNode;
}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;

export const useAgentsCommonData = () => React.useContext(Ctx);
