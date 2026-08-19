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
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { PageType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import { ArticleItem } from "@docspace/ui-kit/components/article/item";

interface IAccountsItem {
  showText: boolean;
  activeItemId: string;
  onClick: (e: React.MouseEvent, folderId: string) => void;
  getLinkData: (folderId: string) => { path: string; state: object };
}

const AccountsItems = ({
  showText,
  activeItemId,
  onClick,
  getLinkData,
}: IAccountsItem) => {
  const { t } = useTranslation("Common");

  const onClickAction = React.useCallback(
    (e: React.MouseEvent) => {
      onClick && onClick(e, "accounts");
    },
    [onClick],
  );

  return (
    <>
      <ArticleItem
        key="accounts-members"
        text={t("Common:Members")}
        linkData={getLinkData("accounts")}
        title={t("Common:Members")}
        icon={getCatalogIconUrlByType(PageType.account)}
        showText={showText}
        onClick={onClickAction}
        isActive={activeItemId === "accounts"}
        folderId="accounts_catalog-members"
        LinkRouter={Link}
        withAnimation
      />
      <ArticleItem
        key="accounts-groups"
        text={t("Common:Groups")}
        linkData={getLinkData("groups")}
        title={t("Common:Groups")}
        icon={getCatalogIconUrlByType(PageType.groups)}
        showText={showText}
        onClick={onClickAction}
        isActive={activeItemId === "groups"}
        folderId="accounts_catalog-groups"
        LinkRouter={Link}
        withAnimation
      />

      <ArticleItem
        key="accounts-guests"
        text={t("Common:Guests")}
        linkData={getLinkData("guests")}
        title={t("Common:Guests")}
        icon={getCatalogIconUrlByType(PageType.guests)}
        showText={showText}
        onClick={onClickAction}
        isActive={activeItemId === "guests"}
        folderId="accounts_catalog-guests"
        LinkRouter={Link}
        withAnimation
        isEndOfBlock
      />
    </>
  );
};

export default inject(({ settingsStore, userStore }: TStore) => {
  const { showText } = settingsStore;

  return {
    showText,
  };
})(observer(AccountsItems));
