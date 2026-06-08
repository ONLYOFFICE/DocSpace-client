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

// PARITY-SOURCE: packages/sdk/src/app/(docspace)/_components/info-panel/Body.tsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko
// NOTE: Drops the Share tab entirely and swaps the Members tab implementation
// for PrivateMembersView (revoke + add-users with encryption pre-checks).
// Details and History views are reused from (docspace) — they're tab-agnostic.

"use client";

import React from "react";
import { observer } from "mobx-react";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import {
  InfoPanelView,
  useInfoPanelStore,
  type InfoPanelViewType,
} from "@/app/(docspace)/_store/InfoPanelStore";
import { InfoPanelHeader } from "@/app/(docspace)/_components/info-panel";
import Details from "@/app/(docspace)/_components/info-panel/views/Details";
import History from "@/app/(docspace)/_components/info-panel/views/History";
import {
  NoItem,
  SeveralItems,
} from "@/app/(docspace)/_components/info-panel/views/EmptyStates";
import commonStyles from "@/app/(docspace)/_components/info-panel/helpers/Common.module.scss";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";

import RoomHeader from "@/app/(docspace)/_components/info-panel/sub-components/RoomHeader";

import PrivateMembersView from "../members/PrivateMembersView";
import { usePrivateDialogsStore } from "../../_store/PrivateDialogsStore";

function getPrivateAvailableTabs(
  selection: TFile | TFolder | null,
): InfoPanelViewType[] {
  if (!selection) return [InfoPanelView.infoDetails];

  const isRoom = "isRoom" in selection && Boolean(selection.isRoom);
  if (isRoom) {
    // No infoShare — private rooms have no external links / public sharing.
    return [
      InfoPanelView.infoMembers,
      InfoPanelView.infoHistory,
      InfoPanelView.infoDetails,
    ];
  }

  // Files: no Share tab either. Encrypted files cannot be shared via link
  // (recipient needs a wrapped DEK on file_keys, not a URL).
  return [InfoPanelView.infoHistory, InfoPanelView.infoDetails];
}

type PrivateInfoPanelBodyProps = {
  onTagsChanged?: () => void;
};

const PrivateInfoPanelBody = observer(
  ({ onTagsChanged }: PrivateInfoPanelBodyProps) => {
    const infoPanelStore = useInfoPanelStore();
    const filesSelectionStore = useFilesSelectionStore();
    const dialogs = usePrivateDialogsStore();
    const docsUser = useDocsUserStore();
    const user = docsUser.user as TUser | null;
    const { selection, fileView, isVisible } = infoPanelStore;

    const selectedCount = filesSelectionStore.selection.length;
    const isSeveralItems = selectedCount > 1;

    const [memberSearch, setMemberSearch] = React.useState("");

    React.useEffect(() => {
      setMemberSearch("");
    }, [selection?.id]);

    // Mirrors (docspace) Body sync logic — keeps infoPanel.selection in line
    // with FilesSelectionStore.
    React.useEffect(() => {
      if (!isVisible) return;

      if (isSeveralItems) {
        if (selection !== null) infoPanelStore.setSelection(null);
        return;
      }

      const next =
        selectedCount === 1
          ? filesSelectionStore.selection[0]
          : (filesSelectionStore.bufferSelection ?? null);

      if (!next) {
        if (selection !== null) infoPanelStore.setSelection(null);
        return;
      }

      if (selection && selection.id === next.id) return;
      infoPanelStore.setSelection(next);
    }, [
      isVisible,
      isSeveralItems,
      selectedCount,
      filesSelectionStore.selection,
      filesSelectionStore.bufferSelection,
      selection,
      infoPanelStore,
    ]);

    const handleAddUsers = React.useCallback(() => {
      if (!selection || !("isRoom" in selection) || !selection.isRoom) return;
      dialogs.openInvitePanel({ roomId: Number(selection.id) });
    }, [dialogs, selection]);

    const isRoomSelection =
      !!selection &&
      "isRoom" in selection &&
      Boolean((selection as TFolder).isRoom);
    const availableTabs = selection ? getPrivateAvailableTabs(selection) : [];
    const currentView = availableTabs.includes(fileView)
      ? fileView
      : (availableTabs[0] ?? InfoPanelView.infoDetails);
    const isMembersView = currentView === InfoPanelView.infoMembers;
    const roomSecurity = isRoomSelection
      ? ((selection as TFolder).security as { EditRoom?: boolean } | undefined)
      : undefined;
    const hasEditAccess = !!roomSecurity?.EditRoom;
    const showHeader = !isSeveralItems && isRoomSelection;

    const renderContent = () => {
      if (isSeveralItems) return <SeveralItems count={selectedCount} />;
      if (!selection) return <NoItem />;

      if (currentView === InfoPanelView.infoMembers) {
        if (!isRoomSelection) return <NoItem />;
        return (
          <PrivateMembersView
            roomId={Number(selection.id)}
            currentUserId={user?.id ?? ""}
            canInvite={hasEditAccess}
            canEditMembers={hasEditAccess}
            filterValue={memberSearch}
          />
        );
      }
      if (currentView === InfoPanelView.infoHistory)
        return <History selection={selection} />;
      return <Details selection={selection} onTagsChanged={onTagsChanged} />;
    };

    return (
      <div
        className={commonStyles.infoPanelBody}
        data-info-panel-scroll
        data-testid="private_info_panel_body"
      >
        {showHeader && selection ? (
          <RoomHeader
            selection={selection as TFolder}
            isMembersView={isMembersView}
            hasEditAccess={hasEditAccess}
            setSearchValue={setMemberSearch}
            onInvite={handleAddUsers}
          />
        ) : null}
        {renderContent()}
      </div>
    );
  },
);

export { InfoPanelHeader as PrivateInfoPanelHeader };
export { PrivateInfoPanelBody };
export default PrivateInfoPanelBody;
