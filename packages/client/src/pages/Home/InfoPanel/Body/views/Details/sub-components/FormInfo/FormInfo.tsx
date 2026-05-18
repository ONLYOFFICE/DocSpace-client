// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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

