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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TPathParts } from "@docspace/shared/types";
import api from "@docspace/shared/api";
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import {
  CreateCustomRoomIllustrationIcon,
  UseRoomTemplateIllustrationIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";

import { SectionWrapper } from "@/app/(docspace)/_components/section";
import Header from "@/app/(docspace)/_components/header";
import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import { Filter } from "@/app/(docspace)/_components/filter";
import SelectionArea from "@/app/(docspace)/_components/selection-area";
import { DeviceTypeObserver } from "@/app/(docspace)/_components/DeviceTypeObserver";
import RootScrollbar from "@/app/(docspace)/_components/RootScrollbar";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import RoomsList from "../rooms-list";
import CreateEditRoomDialog from "../create-edit-room-dialog";
import {
  InfoPanelBody as DocsInfoPanelBody,
  InfoPanelHeader as DocsInfoPanelHeader,
} from "@/app/(docspace)/_components/info-panel";
import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";

import styles from "./RoomsLayout.module.scss";

type RoomsLayoutProps = {
  folders: TFolder[];
  files: TFile[];
  total: number;
  current: TFolder;
  pathParts: TPathParts[];
  filesSettings: TFilesSettings;
  portalSettings: TSettings;
  filesFilter: string;
  user?: TUser;
  isArchive?: boolean;
  isPrivate?: boolean;
  hasEncryptionKeys?: boolean;
  infoPanelHeader?: React.ReactNode;
  infoPanelBody?: React.ReactNode;
  emptyView?: React.ReactNode;
  titleOverride?: string;
  onPrivateInviteRoom?: (room: TFolder) => void;
  onPrivateChangeOwner?: (room: TFolder) => void;
  renderCreateRoomDialog?: (args: {
    visible: boolean;
    onClose: () => void;
    onRoomCreated: () => void;
    isPrivate?: boolean;
    hasEncryptionKeys?: boolean;
  }) => React.ReactNode;
};

const RoomsLayout = observer(
  ({
    folders,
    files,
    total,
    current,
    pathParts,
    filesSettings,
    portalSettings,
    filesFilter,
    user,
    isArchive,
    isPrivate,
    hasEncryptionKeys,
    infoPanelHeader,
    infoPanelBody,
    emptyView,
    titleOverride,
    onPrivateInviteRoom,
    onPrivateChangeOwner,
    renderCreateRoomDialog,
  }: RoomsLayoutProps) => {
    const { t } = useTranslation(["Common"]);
    const { isEmptyList } = useSettingsStore();
    const { headerOffset, frameHeaderVars } = useFrameHeaderConfig();
    const infoPanelStore = useInfoPanelStore();
    const filesListStore = useFilesListStore();

    const onInfoPanelTagsChanged = React.useCallback(async () => {
      const sel = infoPanelStore.selection;
      if (!sel || !("isRoom" in sel) || !sel.isRoom) return;
      try {
        const updated = (await api.rooms.getRoomInfo(
          sel.id,
        )) as unknown as TFolder;
        infoPanelStore.setSelection({ ...updated, isRoom: true } as unknown as TFolder);
        const existing = filesListStore.items.find((i) => i.id === sel.id);
        if (existing) {
          const merged = {
            ...existing,
            ...(updated as unknown as Record<string, unknown>),
          } as unknown as typeof existing;
          filesListStore.replaceItem(sel.id, merged);
        }
      } catch {}
    }, [infoPanelStore, filesListStore]);

    const canCreateRooms = !!(
      user?.isAdmin ||
      user?.isOwner ||
      user?.isRoomAdmin
    );

    const dialogsStore = useDialogsStore();
    const refreshRef = React.useRef<(() => void) | null>(null);

    const createCustomRoom = React.useCallback(() => {
      dialogsStore.openDialog(SDKDialogs.CreateRoom);
    }, [dialogsStore]);

    const closeCreateRoomDialog = React.useCallback(() => {
      dialogsStore.closeDialog(SDKDialogs.CreateRoom);
    }, [dialogsStore]);

    const quickActionItems = React.useMemo<QuickActionItem[]>(() => {
      if (isArchive || !canCreateRooms) return [];
      const items: QuickActionItem[] = [
        {
          id: "custom-room",
          icon: <CreateCustomRoomIllustrationIcon />,
          label: t("Common:NewRoom"),
          onClick: createCustomRoom,
          disabled: isArchive,
        },
      ];
      if (!isPrivate) {
        items.push({
          id: "use-template",
          icon: <UseRoomTemplateIllustrationIcon />,
          label: t("Common:UseTemplate"),
          disabled: true,
        });
      }
      return items;
    }, [t, createCustomRoom, isArchive, canCreateRooms, isPrivate]);

    return (
      <div className={styles.root} style={frameHeaderVars}>
        <RootScrollbar>
          <SectionWrapper
            sectionHeaderContent={
              <Header
                current={current}
                pathParts={pathParts}
                isEmptyList={isEmptyList}
                headerOffset={headerOffset}
                isInfoPanelVisible={infoPanelStore.isVisible}
                onToggleInfoPanel={infoPanelStore.toggle}
              />
            }
            sectionFilterContent={
              <>
                {!isArchive && (
                  <QuickActions
                    items={quickActionItems}
                    className={styles.quickActions}
                  />
                )}
                <Filter
                  filesFilter={filesFilter}
                  showMainButton={!isArchive && canCreateRooms}
                  mainButtonProps={{
                    isDropdown: false,
                    text: t("Common:NewRoom"),
                    onAction: createCustomRoom,
                    model: [],
                    isDisabled: isArchive,
                    hideArrow: true,
                  }}
                />
              </>
            }
            sectionBodyContent={
              <RoomsList
                total={total}
                folders={folders}
                files={files}
                filesSettings={filesSettings}
                portalSettings={portalSettings}
                filesFilter={filesFilter}
                current={current}
                user={user}
                isArchive={isArchive}
                refreshRef={refreshRef}
                emptyView={emptyView}
                titleOverride={titleOverride}
                hasEncryptionKeys={isPrivate ? hasEncryptionKeys : undefined}
                onPrivateInviteRoom={onPrivateInviteRoom}
                onPrivateChangeOwner={onPrivateChangeOwner}
                infoPanelVisible={infoPanelStore.isVisible}
              />
            }
            infoPanelHeaderContent={infoPanelHeader ?? <DocsInfoPanelHeader />}
            infoPanelBodyContent={
              infoPanelBody ?? (
                <DocsInfoPanelBody onTagsChanged={onInfoPanelTagsChanged} />
              )
            }
            isInfoPanelVisible={infoPanelStore.isVisible}
            setIsInfoPanelVisible={infoPanelStore.setVisible}
            isEmptyPage={isEmptyList}
            filesFilter={filesFilter}
          />
          {renderCreateRoomDialog ? (
            renderCreateRoomDialog({
              visible: dialogsStore.isDialogOpen(SDKDialogs.CreateRoom),
              onClose: closeCreateRoomDialog,
              onRoomCreated: () => refreshRef.current?.(),
              isPrivate,
              hasEncryptionKeys,
            })
          ) : (
            <CreateEditRoomDialog
              visible={dialogsStore.isDialogOpen(SDKDialogs.CreateRoom)}
              onClose={closeCreateRoomDialog}
              onRoomCreated={() => refreshRef.current?.()}
              isPrivate={isPrivate}
              hasEncryptionKeys={hasEncryptionKeys}
            />
          )}
          <SelectionArea isRooms />
          <DeviceTypeObserver />
        </RootScrollbar>
      </div>
    );
  },
);

export default RoomsLayout;

