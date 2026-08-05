/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FC } from "react";
import { inject, observer } from "mobx-react";

import { AICard } from "./AICard";

import { CollectionCard } from "./CollectionCard";
import { useFormInfoActions } from "./hooks/useFormInfoActions";
import { useFormInfoState } from "./hooks/useFormInfoState";

import styles from "./FormInfo.module.scss";
import { shouldShow } from "./FormInfo.utils";
import type {
  ExternalFormInfoProps,
  FormRoomInfoBlocksProps,
  InjectedFormInfoProps,
} from "./FormInfo.types";

function FormInfoComponent(props: FormRoomInfoBlocksProps) {
  const {
    selection,
    askAIAction,
    isAdmin,
    aiReady,
    externalDbEnabled,
    infoPanelRoomSelection,
    openLocationAction,
    onClickLinkFillForm,
  } = props;

  const state = useFormInfoState({
    selection,
    infoPanelRoomSelection,
    externalDbEnabled,
    aiReady,
  });

  const actions = useFormInfoActions({
    selection,
    infoPanelRoomSelection,
    openLocationAction,
    onClickLinkFillForm,
  });

  if (!shouldShow(selection)) return null;

  return (
    <div className={styles.container}>
      <AICard
        selection={selection}
        state={state}
        isAdmin={isAdmin}
        aiReady={aiReady}
        externalDbEnabled={externalDbEnabled}
        askAIAction={askAIAction}
        onConnect={actions.handleConnect}
      />
      <CollectionCard
        selection={selection}
        state={state}
        onGoToCompleteFolder={actions.goToCompleteFolder}
        onFillForm={actions.fillForm}
        onConnect={actions.handleConnect}
      />
    </div>
  );
}

export const FormInfo = inject<
  TStore,
  ExternalFormInfoProps,
  InjectedFormInfoProps
>(
  ({
    filesActionsStore,
    settingsStore,
    contextOptionsStore,
    infoPanelStore,
    userStore,
  }) => ({
    askAIAction: filesActionsStore.askAIAction,
    openLocationAction: filesActionsStore.openLocationAction,
    externalDbEnabled: settingsStore.externalDbEnabled,
    aiReady: Boolean(settingsStore.aiConfig?.aiReady),
    onClickLinkFillForm: contextOptionsStore.onClickLinkFillForm,
    infoPanelRoomSelection: infoPanelStore.infoPanelRoomSelection,
    isAdmin: !!(userStore?.user?.isAdmin || userStore?.user?.isOwner),
  }),
)(observer(FormInfoComponent as FC<ExternalFormInfoProps>));

