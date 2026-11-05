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

import type React from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import type { IClientProps } from "@docspace/shared/utils/oauth/types";
import { DataTableRowCheckbox } from "@onlyoffice/apps-ui-kit/components/data-table";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import type OAuthStore from "SRC_DIR/store/OAuthStore";

import styles from "../../../authorized-apps.module.scss";

type TNameCellProps = { item: IClientProps };

type TInjectedProps = TNameCellProps & {
  checked: boolean;
  inProgress: boolean;
  setSelection: OAuthStore["setSelection"];
};

/** The app's logo that turns into the checkbox, and its name. */
const NameCell = ({
  item,
  checked,
  inProgress,
  setSelection,
}: TInjectedProps) => (
  <>
    <DataTableRowCheckbox
      // The click-outside handler that clears the selection leaves this class
      // alone, as it did the old checkbox.
      className={classNames(styles.selection, "table-container_row-checkbox")}
      icon={
        item.logo ? (
          <img src={item.logo} alt="App icon" className={styles.styledImage} />
        ) : null
      }
      checked={checked}
      loading={inProgress}
      label={item.name}
      onChange={() => setSelection(item.clientId)}
      testId="row_selection_checkbox"
    />
    <Text title={item.name} fontWeight="600" fontSize="13px" truncate>
      {item.name}
    </Text>
  </>
);

export default inject(
  ({ oauthStore }: { oauthStore: OAuthStore }, { item }: TNameCellProps) => ({
    checked: oauthStore.selection.includes(item.clientId),
    inProgress: oauthStore.activeClients.includes(item.clientId),
    setSelection: oauthStore.setSelection,
  }),
)(observer(NameCell)) as unknown as React.ComponentType<TNameCellProps>;
