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

import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import classNames from "classnames";

import type { TApiKey } from "@docspace/shared/api/api-keys/types";
import type { TTranslation } from "@docspace/shared/types";
import {
  contextMenuColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@onlyoffice/apps-ui-kit/components/avatar";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { Encoder } from "@onlyoffice/apps-ui-kit/utils/encoder";

import type { ApiKeyViewProps } from "../../types";
import {
  getItemPermissions,
  getPermissionsOptionTranslation,
  getStatusByDate,
} from "../../utils";
import { ApiKeysLifetimeIcon } from "../ApiKeysLifetimeIcon";

import styles from "./TableView.module.scss";

const SideText = ({ children }: { children: React.ReactNode }) => (
  <Text className="api-keys_text api-keys_text-overflow" fontWeight={600}>
    {children}
  </Text>
);

const NameCell = ({
  item,
  t,
  culture,
}: {
  item: TApiKey;
  t: TTranslation;
  culture?: string;
}) => (
  <div className="api-keys_name">
    <Text truncate fontWeight={600}>
      {item.name}
    </Text>
    <ApiKeysLifetimeIcon
      t={t}
      expiresAt={item.expiresAt}
      expiresAtDate={
        item.expiresAt ? getStatusByDate(item.expiresAt, culture) : ""
      }
    />
  </div>
);

const AuthorCell = ({ item }: { item: TApiKey }) => {
  const displayName = Encoder.htmlDecode(item.createBy?.displayName ?? "");

  return (
    <>
      <Avatar
        source={
          item.createBy?.hasAvatar
            ? item.createBy.avatarSmall
            : DefaultUserPhotoSize32PngUrl
        }
        className="author-avatar-cell"
        role={AvatarRole.user}
        size={AvatarSize.small}
      />
      <Text fontSize="12px" fontWeight={600} title={displayName} truncate>
        {displayName}
      </Text>
    </>
  );
};

/**
 * The old header's columns, none of them the wide one, as its
 * `withoutWideColumn` had it; then the row menu.
 */
export const getApiKeysColumns = (
  t: TTranslation,
  culture: string | undefined,
  onChangeApiKeyParams: ApiKeyViewProps["onChangeApiKeyParams"],
): DataTableColumn<TApiKey>[] => [
  {
    id: "Name",
    title: t("Common:Label"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (item) => <NameCell item={item} t={t} culture={culture} />,
  },
  {
    id: "SecretKey",
    title: t("Webhooks:SecretKey"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (item) => <SideText>{item.key}</SideText>,
  },
  {
    id: "Created",
    title: t("Common:ByCreation"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (item) => (
      <SideText>{getStatusByDate(item.createOn, culture)}</SideText>
    ),
  },
  {
    id: "LastUsed",
    title: t("Common:LastUsed"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (item) => (
      <SideText>{getStatusByDate(item.lastUsed, culture)}</SideText>
    ),
  },
  {
    id: "CreatedBy",
    title: t("Common:CreatedBy"),
    width: { type: "flex" },
    cellClassName: classNames(styles.cell, styles.authorCell),
    cell: (item) => <AuthorCell item={item} />,
  },
  {
    id: "Permissions",
    title: t("Common:Permissions"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (item) => (
      <SideText>
        {getPermissionsOptionTranslation(
          getItemPermissions(item.permissions),
          t,
        )}
      </SideText>
    ),
  },
  {
    id: "State",
    title: t("Webhooks:State"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (item) => (
      <div>
        <ToggleButton
          className="toggle toggleButton"
          isChecked={item.isActive}
          onChange={() =>
            onChangeApiKeyParams(item.id, { isActive: !item.isActive })
          }
        />
      </div>
    ),
  },
  contextMenuColumn<TApiKey>(),
];
