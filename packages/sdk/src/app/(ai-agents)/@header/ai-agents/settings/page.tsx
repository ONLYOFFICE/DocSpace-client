// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useTranslation } from "react-i18next";

import AgentsHeader from "../../../_components/agents-header";

// Settings sits at the same catalog level as Recent / Favorites / Trash —
// root-level entries with no breadcrumb chain and no back arrow. Path-parts
// are reserved for agent detail pages.
export default function SettingsHeader() {
  const { t } = useTranslation(["Common"]);
  return <AgentsHeader title={t("Common:Settings")} />;
}
