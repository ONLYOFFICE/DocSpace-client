// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import AgentsHeader from "../../../_components/agents-header";
import { useAgentsListStore } from "../../../_store";

export default observer(function FavoritesHeader() {
  const { t } = useTranslation(["Common"]);
  const store = useAgentsListStore();
  const isEmpty = !store.isLoading && store.agents.length === 0;
  return <AgentsHeader title={t("Common:Favorites")} isEmptyList={isEmpty} />;
});
