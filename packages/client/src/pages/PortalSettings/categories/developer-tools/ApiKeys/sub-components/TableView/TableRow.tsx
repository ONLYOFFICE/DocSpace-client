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

import classNames from "classnames";
import { useTranslation } from "react-i18next";
import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";
import {
  TableRow as TableRowComponent,
  TableCell,
} from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
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
            title={item.createBy?.displayName}
            truncate
          >
            {item.createBy?.displayName}
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
