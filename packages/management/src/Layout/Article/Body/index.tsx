// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { isMobileOnly } from "react-device-detect";

import { isMobile } from "@docspace/shared/utils";
import { ArticleItem } from "@docspace/shared/components/article-item";
import { settingsTree } from "SRC_DIR/utils/settingsTree";
import { getItemByLink } from "SRC_DIR/utils";
import { TSettingsTreeItem } from "SRC_DIR/types/index";

import { useStore } from "SRC_DIR/store";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

const PROXY_BASE_URL = combineUrl(
  window.ClientConfig?.proxy?.url,
  "/management"
);

const ArticleBodyContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation(["Settings", "Common"]);

  const { settingsStore, currentTariffStatusStore } = useStore();

  const { isCommunity } = currentTariffStatusStore;
  const { toggleArticleOpen, setIsBurgerLoading, currentColorScheme } =
    settingsStore;

  const [selectedKey, setSelectedKey] = useState("0");

  useEffect(() => {
    const path = location.pathname;
    const item = getItemByLink(path);
    setSelectedKey(item?.key);
    setIsBurgerLoading(false);
  }, []);

  const onClickItem = (item: TSettingsTreeItem, e: React.MouseEvent) => {
    setSelectedKey(item?.key);

    if (isMobileOnly || isMobile()) {
      toggleArticleOpen();
    }
  };

  const catalogItems = () => {
    const items: Array<React.ReactNode> = [];

    let resultTree = settingsTree.filter((item) => item?.isHeader);

    const deletionTKey = isCommunity ? "Common:PaymentsTitle" : "Common:Bonus";

    const index = resultTree.findIndex((el) => el.tKey === deletionTKey);

    if (index !== -1) {
      resultTree.splice(index, 1);
    }

    resultTree.map((item) => {
      items.push(
        <ArticleItem
          key={item.key}
          id={item.key}
          icon={item.icon}
          showText={true}
          text={t(item.tKey)}
          value={item.link}
          isActive={item.key === selectedKey}
          onClick={(e) => onClickItem(item, e)}
          folderId={item.id}
          $currentColorScheme={currentColorScheme}
          linkData={{ path: item.link, state: {} }}
        />
      );
    });

    return items;
  };

  const items = catalogItems();

  return <>{items}</>;
};

export default observer(ArticleBodyContent);
