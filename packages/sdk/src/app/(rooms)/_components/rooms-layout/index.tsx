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
import { Filter } from "@/app/(docspace)/_components/filter";
import SelectionArea from "@/app/(docspace)/_components/selection-area";
import { DeviceTypeObserver } from "@/app/(docspace)/_components/DeviceTypeObserver";
import RootScrollbar from "@/app/(docspace)/_components/RootScrollbar";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import RoomsList from "../rooms-list";
import CreateRoomDialog from "../create-edit-room-dialog";

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
    const { isEmptyList } = useSettingsStore();
    const { headerOffset, frameHeaderVars } = useFrameHeaderConfig();

    const [isCreateRoomDialogVisible, setIsCreateRoomDialogVisible] =
      React.useState(false);

    const createCustomRoom = React.useCallback(() => {
      setIsCreateRoomDialogVisible(true);
    }, []);

    const quickActionItems = React.useMemo<QuickActionItem[]>(
      () => [
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

    const mainButtonModel = React.useMemo<ContextMenuModel[]>(
      () => [
        {
          id: "actions_create-custom-room",
          key: "custom-room",
          label: t("Common:NewRoom"),
          icon: CreateRoomReactSvgUrl,
          onClick: createCustomRoom,
        },
        {
          id: "actions_use-template",
          key: "use-template",
          label: t("Common:UseTemplate"),
          icon: TemplateReactSvgUrl,
          disabled: true,
        },
      ],
      [t, createCustomRoom],
    );

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
              />
            }
            sectionFilterContent={
              <>
                <QuickActions
                  items={quickActionItems}
                  className={styles.quickActions}
                />
                <Filter
                  filesFilter={filesFilter}
                  showMainButton
                  mainButtonProps={{
                    isDropdown: true,
                    model: mainButtonModel,
                    text: t("Common:New"),
                    isDisabled: isArchive,
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
              />
            }
            isEmptyPage={isEmptyList}
            filesFilter={filesFilter}
          />
          <SelectionArea />
          <DeviceTypeObserver />
        </RootScrollbar>
        <CreateRoomDialog
          visible={isCreateRoomDialogVisible}
          onClose={() => setIsCreateRoomDialogVisible(false)}
        />
      </div>
    );
  },
);

export default RoomsLayout;

