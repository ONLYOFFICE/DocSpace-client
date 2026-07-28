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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Consumer } from "@docspace/ui-kit/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";
import {
  AccountsTableProps,
  InjectedTypeSelectTableProps,
} from "../../../types";
import { getBrandName } from "@docspace/shared/constants/brands";

const checkedAccountType = "result";

const AccountsTable = (props: AccountsTableProps) => {
  const {
    accountsData,
    viewAs,
    changeGroupType,
    UserTypes,
    toggleAllAccounts,
    isOwner,
  } = props as InjectedTypeSelectTableProps;

  const { t, ready } = useTranslation(["ChangeUserTypeDialog", "People"]);

  const setTypePortalAdmin = () => {
    changeGroupType(UserTypes.PortalAdmin);
    toggleAllAccounts(false, [], checkedAccountType);
  };
  const setTypeRoomAdmin = () => {
    changeGroupType(UserTypes.RoomAdmin);
    toggleAllAccounts(false, [], checkedAccountType);
  };

  const setTypeUser = () => {
    changeGroupType(UserTypes.User);
    toggleAllAccounts(false, [], checkedAccountType);
  };

  const typeOptions = [
    {
      key: UserTypes.RoomAdmin,
      label: t("Common:RoomAdmin"),
      onClick: setTypeRoomAdmin,
    },
    {
      key: UserTypes.User,
      label: t("Common:User"),
      onClick: setTypeUser,
    },
  ];

  if (isOwner) {
    typeOptions.unshift({
      key: UserTypes.PortalAdmin,
      label: t("Common:PortalAdmin", {
        productName: getBrandName("ProductName"),
      }),
      onClick: setTypePortalAdmin,
    });
  }

  if (!ready) return;

  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            t={t}
            sectionWidth={context.sectionWidth}
            accountsData={accountsData}
            typeOptions={typeOptions}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth}
            accountsData={accountsData}
            typeOptions={typeOptions}
          />
        )
      }
    </Consumer>
  );
};
export default inject<TStore>(({ setup, userStore, importAccountsStore }) => {
  const { viewAs } = setup;
  const { changeGroupType, UserTypes, toggleAllAccounts } = importAccountsStore;
  const { isOwner } = userStore.user || {};

  return {
    viewAs,
    changeGroupType,
    UserTypes,
    toggleAllAccounts,
    isOwner,
  };
})(observer(AccountsTable));
