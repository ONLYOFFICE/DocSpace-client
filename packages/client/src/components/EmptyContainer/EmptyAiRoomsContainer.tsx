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

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { EmptyView } from "@onlyoffice/apps-ui-kit/components/empty-view";
import type { EmptyViewOptionsType } from "@onlyoffice/apps-ui-kit/components/empty-view";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { Events } from "@docspace/shared/enums";

import EmptyAiRoomsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import EmptyAiRoomsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";
import CreateRoomIcon from "PUBLIC_DIR/images/emptyview/create.room.svg";

import { canManageProjects } from "SRC_DIR/pages/AiProjects/utils";

type EmptyAiRoomsContainerProps = {
  canManage: boolean;
  isWarningRoomsDialog: boolean;
  setQuotaWarningDialogVisible: (visible: boolean) => void;
  selectedFolderId?: number | string | null;
};

/**
 * The empty state of the "AI rooms" root. A room admin can create an
 * Instructions room, a Knowledge room or an AI project (the "AI rooms"
 * chooser), a user or guest only waits for an invitation.
 */
const EmptyAiRoomsContainer = ({
  canManage,
  isWarningRoomsDialog,
  setQuotaWarningDialogVisible,
  selectedFolderId,
}: EmptyAiRoomsContainerProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const onCreate = () => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }
    const event = new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId: selectedFolderId, context: "empty_state" },
    }) as CustomEvent & { payload?: { isAiRoomsCreate?: boolean } };
    event.payload = { isAiRoomsCreate: true };
    window.dispatchEvent(event);
  };

  const icon = isBase ? <EmptyAiRoomsLightIcon /> : <EmptyAiRoomsDarkIcon />;

  const options: EmptyViewOptionsType = canManage
    ? [
        {
          key: "create-ai-room",
          title: t("Common:NewRoom"),
          description: t("Common:AiRoomsCreateDescription"),
          icon: <CreateRoomIcon />,
          onClick: onCreate,
        },
      ]
    : [];

  return (
    <EmptyView
      icon={icon}
      title={canManage ? t("Common:AiRoomsEmpty") : t("Common:AiRoomsEmptyUser")}
      description={
        canManage
          ? t("Common:AiRoomsEmptyDescription")
          : t("Common:AiRoomsEmptyUserDescription")
      }
      options={options}
    />
  );
};

export default inject(
  ({ userStore, currentQuotaStore, dialogsStore, selectedFolderStore }: TStore) => ({
    canManage: canManageProjects(userStore.user),
    isWarningRoomsDialog: currentQuotaStore.isWarningRoomsDialog,
    setQuotaWarningDialogVisible: dialogsStore.setQuotaWarningDialogVisible,
    selectedFolderId: selectedFolderStore.id,
  }),
)(observer(EmptyAiRoomsContainer));
