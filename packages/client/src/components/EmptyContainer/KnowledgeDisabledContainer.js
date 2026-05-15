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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import ChatNoAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.dark.svg";
import ChatNoAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.light.svg";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { getBrandName } from "@docspace/shared/constants/brands";

const KnowledgeDisabledContainer = (props) => {
  const { t, theme, isFrame, isAdmin, setKnowledgeId, setCurrentTab } = props;

  const titleRoomNoAccess = t("AIRoom:KnowledgeUnavailable");
  const descriptionRoomNoAccess = isAdmin
    ? t("AIRoom:KnowledgeUnavailableDescription", {
        productName: getBrandName("ProductName"),
        aiAgents: t("Common:AIAgents"),
      })
    : t("AIRoom:KnowledgeUnavailableDescriptionUser", {
        productName: getBrandName("ProductName"),
        aiAgents: t("Common:AIAgents"),
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
})(withTranslation(["Common", "AIRoom"])(observer(KnowledgeDisabledContainer)));

