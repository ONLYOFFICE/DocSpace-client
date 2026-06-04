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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TPathParts } from "@docspace/shared/types";
import type { TLogo } from "@docspace/ui-kit/types";
import api from "@docspace/shared/api";
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import {
  CreateCustomRoomIllustrationIcon,
  UseRoomTemplateIllustrationIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import TemplateReactSvgUrl from "PUBLIC_DIR/images/template.react.svg?url";

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
import { normalizeRoomLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";

import RoomsList from "../rooms-list";
import RoomsFilter from "../rooms-filter";
import CreateEditRoomDialog from "../create-edit-room-dialog";
import { useRoomsTagsStore } from "../../_store/RoomsTagsStore";
import {
  InfoPanelBody as DocsInfoPanelBody,
  InfoPanelHeader as DocsInfoPanelHeader,
  InfoPanelEditLinkDialog,
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
  }: RoomsLayoutProps) => {
    const { t } = useTranslation(["Common"]);
    const router = useRouter();
    const { isEmptyList } = useSettingsStore();
    const { headerOffset, frameHeaderVars } = useFrameHeaderConfig();
    const infoPanelStore = useInfoPanelStore();
    const filesListStore = useFilesListStore();
    const tagsStore = useRoomsTagsStore();

    // Re-fetch the room after tags are bound/unbound inside the info panel and
    // update both the panel's selection (so Tags row refreshes) and the room
    // entry in the files list store (so the table/row view updates).
    // Also merge any newly-added tags into the global tags cache so the filter
    // dropdown picks them up without a reload.
    const onInfoPanelTagsChanged = React.useCallback(async () => {
      const sel = infoPanelStore.selection;
      if (!sel || !("isRoom" in sel) || !sel.isRoom) return;
      try {
        const updated = (await api.rooms.getRoomInfo(
          sel.id,
        )) as unknown as TFolder;
        const rawLogo = (updated as unknown as { logo?: TLogo }).logo;
        infoPanelStore.setSelection({
          ...updated,
          isRoom: true,
          ...normalizeRoomLogo(rawLogo),
        } as unknown as TFolder);
        const existing = filesListStore.items.find((i) => i.id === sel.id);
        if (existing) {
          const merged = {
            ...existing,
            ...(updated as unknown as Record<string, unknown>),
          } as unknown as typeof existing;
          filesListStore.replaceItem(sel.id, merged);
        }
        const updatedTags = (updated as unknown as { tags?: string[] }).tags;
        if (Array.isArray(updatedTags) && updatedTags.length > 0) {
          tagsStore.upsertTags(updatedTags);
        }
      } catch {
        // ignore
      }
    }, [infoPanelStore, filesListStore, tagsStore]);

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

    const onRoomCreated = (roomId: number) => {
      router.push(`/rooms/${roomId}`);
    };

    const quickActionItems = React.useMemo<QuickActionItem[]>(
      () =>
        isArchive || !canCreateRooms
          ? []
          : [
              {
                id: "custom-room",
                icon: <CreateCustomRoomIllustrationIcon />,
                label: t("Common:NewRoom"),
                onClick: createCustomRoom,
                disabled: isArchive,
              },
              {
                id: "use-template",
                icon: <UseRoomTemplateIllustrationIcon />,
                label: t("Common:UseTemplate"),
                disabled: true,
              },
            ],
      [t, createCustomRoom, isArchive],
    );

    // const mainButtonModel = React.useMemo<ContextMenuModel[]>(
    //   () => [
    //     {
    //       id: "actions_create-custom-room",
    //       key: "custom-room",
    //       label: t("Common:NewRoom"),
    //       icon: CreateRoomReactSvgUrl,
    //       onClick: createCustomRoom,
    //     },
    //     {
    //       id: "actions_use-template",
    //       key: "use-template",
    //       label: t("Common:UseTemplate"),
    //       icon: TemplateReactSvgUrl,
    //       disabled: true,
    //     },
    //   ],
    //   [t, createCustomRoom],
    // );

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
                <RoomsFilter
                  filesFilter={filesFilter}
                  isArchive={isArchive}
                  user={user}
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
                infoPanelVisible={infoPanelStore.isVisible}
              />
            }
            infoPanelHeaderContent={<DocsInfoPanelHeader />}
            infoPanelBodyContent={
              <DocsInfoPanelBody onTagsChanged={onInfoPanelTagsChanged} />
            }
            isInfoPanelVisible={infoPanelStore.isVisible}
            setIsInfoPanelVisible={infoPanelStore.setVisible}
            isEmptyPage={isEmptyList}
            filesFilter={filesFilter}
          />
          <CreateEditRoomDialog
            visible={dialogsStore.isDialogOpen(SDKDialogs.CreateRoom)}
            onClose={closeCreateRoomDialog}
            onRoomCreated={onRoomCreated}
          />
          <SelectionArea isRooms />
          <DeviceTypeObserver />
          <InfoPanelEditLinkDialog />
        </RootScrollbar>
      </div>
    );
  },
);

export default RoomsLayout;
