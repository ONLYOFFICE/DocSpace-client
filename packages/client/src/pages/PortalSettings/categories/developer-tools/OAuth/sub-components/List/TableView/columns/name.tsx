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

import classNames from "classnames";
import { inject, observer } from "mobx-react";

import { DataTableRowCheckbox } from "@onlyoffice/apps-ui-kit/components/data-table";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import type OAuthStore from "SRC_DIR/store/OAuthStore";

import styles from "../TableView.styled.module.scss";

interface NameCellProps {
  name: string;
  clientId: string;
  icon?: string;

  selection?: OAuthStore["selection"];
  activeClients?: OAuthStore["activeClients"];
  setSelection?: OAuthStore["setSelection"];
}

/**
 * The app's logo that turns into its checkbox, then its name. An observer of
 * its own: the row does not track the selection its cells read.
 */
const NameCell = ({
  name,
  icon,
  clientId,
  selection,
  activeClients,
  setSelection,
}: NameCellProps) => (
  <>
    <DataTableRowCheckbox
      // The row's click handler leaves this class alone, as it did the old
      // checkbox, so a click on it does not open the app.
      className={classNames(styles.selection, "table-container_row-checkbox")}
      icon={
        icon ? (
          <img className={styles.nameImage} src={icon} alt="App icon" />
        ) : null
      }
      checked={!!selection?.includes(clientId)}
      loading={!!activeClients?.includes(clientId)}
      label={name}
      onChange={() => setSelection?.(clientId)}
      testId={`${name}_checkbox`}
    />
    <Text title={name} fontWeight="600" fontSize="13px" truncate>
      {name}
    </Text>
  </>
);

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => ({
  selection: oauthStore.selection,
  activeClients: oauthStore.activeClients,
  setSelection: oauthStore.setSelection,
}))(observer(NameCell)) as React.ComponentType<NameCellProps>;
