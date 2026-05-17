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

import FolderIcon from "PUBLIC_DIR/images/icons/12/folder.svg";
import AIAgentsIcon from "PUBLIC_DIR/images/icons/12/AI.svg";
import ManageAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.access.rights.dark.svg";
import ManageAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.access.rights.light.svg";

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { RoomSearchArea } from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { EmptyView } from "@docspace/shared/components/empty-view";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "@docspace/shared/constants";
import { TTheme } from "@docspace/ui-kit/providers/theme/themes";
import { TTranslation } from "@docspace/shared/types";
import { EmptyViewProps } from "@docspace/ui-kit/components/empty-view";

export enum NoAccessContainerType {
  Room,
  Agent,
  Account,
}

type Props = {
  type: NoAccessContainerType;
  t: TTranslation;
  setIsLoading: (param: boolean) => void;
  theme: TTheme;
  isFrame: boolean;
  userId: string;
};

const NoAccessContainer = (props: Props) => {
  const { t, setIsLoading, theme, isFrame, userId, type } = props;

  let emptyViewProps: EmptyViewProps | null = null;

  const onGoTo = (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event?.preventDefault();

    if (isFrame) return;
    setIsLoading(true);

    let path = "";
    let filterParamsStr = "";

    switch (type) {
      case NoAccessContainerType.Room:
      case NoAccessContainerType.Account:
        {
          const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);
          filterParamsStr = filter.toUrlParams();
          path = getCategoryUrl(CategoryType.Shared);
        }
        break;
      case NoAccessContainerType.Agent:
        {
          const filter = RoomsFilter.getDefault(
            userId,
            RoomSearchArea.AIAgents,
          );
          filterParamsStr = filter.toUrlParams();
          path = getCategoryUrl(CategoryType.AIAgents);
        }
        break;
    }

    navigate(`${path}?${filterParamsStr}`);
  };

  React.useEffect(() => {
    const timer = setTimeout(onGoTo, 5000);
    return () => clearTimeout(timer);
  }, [onGoTo]);

  const navigate = useNavigate();

  switch (type) {
    case NoAccessContainerType.Room:
    case NoAccessContainerType.Account:
      emptyViewProps = {
        title:
          type === NoAccessContainerType.Account
            ? t("NoAccessSectionTitle")
            : t("NoAccessRoomTitle"),
        description: t("RoomAccessRedirectNote", {
          sectionName: t("Common:Rooms"),
        }),
        icon: theme.isBase ? (
          <ManageAccessRightsLightIcon />
        ) : (
          <ManageAccessRightsDarkIcon />
        ),
        options: isFrame
          ? []
          : [
              {
                to: "",
                icon: <FolderIcon />,
                onClick: onGoTo,
                key: "empty-view-goto-rooms",
                description: t("GoToMyRooms"),
              },
            ],
      };
      break;
    // TODO: for AI agents
    case NoAccessContainerType.Agent:
      emptyViewProps = {
        title: t("AIRoom:NoAccessAIAgentTitle", {
          aiAgent: t("Common:AIAgent"),
        }),
        description: t("AIRoom:AIAgentAccessRedirectNote", {
          sectionName: t("Common:AIAgents"),
        }),
        icon: theme.isBase ? (
          <ManageAccessRightsLightIcon />
        ) : (
          <ManageAccessRightsDarkIcon />
        ),
        options: isFrame
          ? []
          : [
              {
                to: "",
                icon: <AIAgentsIcon />,
                onClick: onGoTo,
                key: "empty-view-goto-agents",
                description: t("GoToSection", {
                  sectionName: t("Common:AIAgents"),
                }),
              },
            ],
      };
      break;

    default:
      break;
  }

  if (!emptyViewProps) {
    return null;
  }

  return <EmptyView {...emptyViewProps} />;
};

export default inject<TStore>(
  ({ settingsStore, filesStore, clientLoadingStore, userStore }) => {
    const { setIsSectionFilterLoading } = clientLoadingStore;

    const setIsLoading = (param: boolean) => {
      setIsSectionFilterLoading(param);
    };
    const { isEmptyPage } = filesStore;
    const { isFrame, theme } = settingsStore;
    return {
      setIsLoading,

      isEmptyPage,
      theme,
      isFrame,
      userId: userStore?.user?.id,
    };
  },
)(withTranslation(["Files", "AIRoom"])(observer(NoAccessContainer)));
