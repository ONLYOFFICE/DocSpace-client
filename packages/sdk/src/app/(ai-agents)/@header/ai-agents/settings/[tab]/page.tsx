// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useTranslation } from "react-i18next";

import AgentsHeader from "../../../../_components/agents-header";

// Settings/[tab] shares the same header treatment as /settings — no
// breadcrumb, no back arrow. See ../page.tsx for the rationale.
export default function SettingsTabHeader() {
  const { t } = useTranslation(["Common"]);
  return <AgentsHeader title={t("Common:Settings")} />;
}
