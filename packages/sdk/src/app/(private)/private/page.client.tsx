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
  TFilesSettings,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import { OpenFolderContext } from "@/app/(docspace)/_contexts/OpenFolderContext";
import RoomsLayout from "@/app/(rooms)/_components/rooms-layout";
import EmptyPrivateRoomsList from "@docspace/shared/components/empty-views/empty-private-rooms-list";
import type { TFolder } from "@docspace/shared/api/files/types";

import { usePrivateRoomsPageInit } from "../_hooks/usePrivateRoomsPageInit";
import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import { usePrivateDialogsStore } from "../_store/PrivateDialogsStore";
import {
  PrivateInfoPanelBody,
  PrivateInfoPanelHeader,
} from "../_components/info-panel";

type PrivateRoomsPageProps = {
  authToken: string;
  filesSettings: TFilesSettings;
  folderData: TGetFolder;
  portalSettings: TSettings;
  filesFilter: string;
  user?: TUser;
  isArchive?: boolean;
};

const PrivateRoomsPageInner: React.FC<PrivateRoomsPageProps> = ({
  authToken,
  filesSettings,
  folderData,
  portalSettings,
  filesFilter,
  user,
  isArchive,
}) => {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const identityStore = useEncryptionIdentityStore();
  const dialogsStore = usePrivateDialogsStore();
  const isReady = usePrivateRoomsPageInit({
    authToken,
    filesSettings,
    portalSettings,
    user,
  });

  const openRoom = React.useCallback(
    (roomId: number | string) => {
      router.push(`/private/${roomId}`);
      return true;
    },
    [router],
  );

  const handlePrivateInviteRoom = React.useCallback(
    (room: TFolder) => {
      dialogsStore.openInvitePanel({ roomId: Number(room.id) });
    },
    [dialogsStore],
  );

  const handlePrivateChangeOwner = React.useCallback(
    (room: TFolder) => {
      const ownerId =
        (room as TFolder & { createdBy?: { id?: string } }).createdBy?.id ??
        undefined;
      dialogsStore.openChangeOwner({
        roomId: Number(room.id),
        roomOwnerId: ownerId,
      });
    },
    [dialogsStore],
  );

  const headerTitle = isArchive
    ? t("Common:Archive")
    : t("Common:DashboardE2eRoomsTitle");
  const currentWithTitle = React.useMemo(
    () => ({ ...folderData.current, title: headerTitle }),
    [folderData.current, headerTitle],
  );

  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Loader type={LoaderTypes.dualRing} size="40px" />
      </div>
    );
  }

  const { folders, files, total, pathParts } = folderData;

  return (
    <OpenFolderContext.Provider value={openRoom}>
      <RoomsLayout
        folders={folders}
        files={files}
        total={total}
        current={currentWithTitle}
        pathParts={pathParts}
        filesSettings={filesSettings}
        portalSettings={portalSettings}
        filesFilter={filesFilter}
        user={user}
        isArchive={isArchive}
        isPrivate
        hasEncryptionKeys={identityStore.hasKeys}
        titleOverride={headerTitle}
        infoPanelHeader={<PrivateInfoPanelHeader />}
        infoPanelBody={<PrivateInfoPanelBody />}
        emptyView={<EmptyPrivateRoomsList />}
        onPrivateInviteRoom={handlePrivateInviteRoom}
        onPrivateChangeOwner={handlePrivateChangeOwner}
      />
    </OpenFolderContext.Provider>
  );
};

const PrivateRoomsPage = observer(PrivateRoomsPageInner);

export default PrivateRoomsPage;
