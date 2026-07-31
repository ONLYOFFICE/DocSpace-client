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
import { useTranslation } from "react-i18next";
import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";
import {
  TableRow as TableRowComponent,
  TableCell,
} from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { TableRowProps } from "../../types";
import {
  getItemPermissions,
  getPermissionsOptionTranslation,
  getStatusByDate,
} from "../../utils";
import { useContextOptions } from "../useContextOptions";
import { ApiKeysLifetimeIcon } from "../ApiKeysLifetimeIcon";
import styles from "./TableView.module.scss";

const TableRow = (props: TableRowProps) => {
  const {
    item,
    hideColumns,
    culture,
    onChangeApiKeyParams,
    onDeleteApiKey,
    onEditApiKey,
  } = props;

  const { t } = useTranslation(["Common"]);

  const selectedOption = getItemPermissions(item.permissions);

  const permissionTranslation = getPermissionsOptionTranslation(
    selectedOption,
    t,
  );

  const { contextOptions } = useContextOptions(
    t,
    item,
    onEditApiKey,
    onDeleteApiKey,
  );

  const avatarSource = item.createBy?.hasAvatar
    ? item.createBy?.avatarSmall
    : DefaultUserPhotoSize32PngUrl;

  const createOnDate = getStatusByDate(item.createOn, culture);
  const lastUsedDate = getStatusByDate(item.lastUsed, culture);
  const expiresAtDate = item.expiresAt
    ? getStatusByDate(item.expiresAt, culture)
    : "";

  return (
    <div className={styles.wrapper}>
      <TableRowComponent
        className={classNames(styles.tableRow, {
          [styles.hideColumns]: hideColumns,
        })}
        contextOptions={contextOptions}
        hideColumns={hideColumns}
      >
        <TableCell>
          <div className="api-keys_name">
            <Text truncate fontWeight={600}>
              {item.name}
            </Text>
            <ApiKeysLifetimeIcon
              t={t}
              item={item}
              expiresAt={item.expiresAt}
              expiresAtDate={expiresAtDate}
            />
          </div>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {item.key}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {createOnDate}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {lastUsedDate}
          </Text>
        </TableCell>
        <TableCell className="author-cell">
          <Avatar
            source={avatarSource}
            className="author-avatar-cell"
            role={AvatarRole.user}
            size={AvatarSize.small}
          />
          <Text
            fontSize="12px"
            fontWeight={600}
            title={Encoder.htmlDecode(item.createBy?.displayName ?? "")}
            truncate
          >
            {Encoder.htmlDecode(item.createBy?.displayName ?? "")}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {permissionTranslation}
          </Text>
        </TableCell>
        <TableCell>
          <div>
            <ToggleButton
              className="toggle toggleButton"
              isChecked={item.isActive}
              onChange={() =>
                onChangeApiKeyParams(item.id, { isActive: !item.isActive })
              }
            />
          </div>
        </TableCell>
      </TableRowComponent>
    </div>
  );
};

export default TableRow;
