// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import ChatNoAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.dark.svg";
import ChatNoAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.light.svg";

import { EmptyView } from "@docspace/shared/components/empty-view";

const KnowledgeDisabledContainer = (props) => {
  const { t, theme, isFrame, isAdmin, setKnowledgeId, setCurrentTab } = props;

  const titleRoomNoAccess = t("AIRoom:KnowledgeUnavailable");
  const descriptionRoomNoAccess = isAdmin
    ? t("AIRoom:KnowledgeUnavailableDescription", {
        productName: t("Common:ProductName"),
      })
    : t("AIRoom:KnowledgeUnavailableDescriptionUser", {
        productName: t("Common:ProductName"),
      });

  const navigate = useNavigate();

  const goToSettings = (event) => {
    event?.preventDefault();

    if (isFrame) return;

    setKnowledgeId(null);
    setCurrentTab(null);

    navigate("/portal-settings/ai-settings/knowledge");
  };

  const propsRoomNotFoundOrMoved = {
    title: titleRoomNoAccess,
    description: isFrame ? "" : descriptionRoomNoAccess,
    icon: theme.isBase ? (
      <ChatNoAccessRightsLightIcon />
    ) : (
      <ChatNoAccessRightsDarkIcon />
    ),
    options:
      isFrame || !isAdmin
        ? []
        : [
            {
              type: "button",
              onClick: goToSettings,
              key: "disabled-view-go-to-settings",
              title: t("Common:GoToSettings"),
            },
          ],
  };

  return <EmptyView {...propsRoomNotFoundOrMoved} />;
};

export default inject(({ settingsStore, userStore, aiRoomStore }) => {
  const { isFrame, theme } = settingsStore;
  return {
    theme,
    isFrame,
    isAdmin: userStore?.user?.isAdmin || userStore?.user?.isOwner,
    setKnowledgeId: aiRoomStore.setKnowledgeId,
    setCurrentTab: aiRoomStore.setCurrentTab,
  };
})(withTranslation(["Commom", "AIRoom"])(observer(KnowledgeDisabledContainer)));
