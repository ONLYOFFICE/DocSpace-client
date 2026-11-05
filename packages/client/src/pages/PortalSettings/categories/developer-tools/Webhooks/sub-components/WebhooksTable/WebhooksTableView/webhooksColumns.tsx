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

import { useState } from "react";
import type { TFunction } from "i18next";

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
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme/themes";
import { Encoder } from "@onlyoffice/apps-ui-kit/utils/encoder";

import type WebhooksStore from "SRC_DIR/store/WebhooksStore";
import type { TWebhook } from "SRC_DIR/store/WebhooksStore";

import StatusBadge from "../../StatusBadge";

import styles from "../WebhooksTable.styled.module.scss";

type TToggleEnabled = WebhooksStore["toggleEnabled"];

const NameCell = ({ webhook }: { webhook: TWebhook }) => (
  <>
    <Text as="span" fontWeight={600} className="mr-8 textOverflow">
      {webhook.name}{" "}
    </Text>
    <StatusBadge status={webhook.status} />
  </>
);

const AuthorCell = ({ webhook }: { webhook: TWebhook }) => (
  <>
    {webhook.createdBy?.hasAvatar ? (
      <Avatar
        source={webhook.createdBy.avatarSmall ?? DefaultUserPhotoSize32PngUrl}
        size={AvatarSize.min}
        className="author-avatar-cell"
        role={AvatarRole.user}
        dataTestId={`avatar_${webhook.name}`}
      />
    ) : null}
    <Text
      fontSize="12px"
      fontWeight={600}
      title={webhook.createdBy?.displayName}
      truncate
      dataTestId={`author_name_${webhook.name}`}
    >
      {Encoder.htmlDecode(webhook.createdBy?.displayName ?? "")}
    </Text>
  </>
);

/** The webhook's switch, which waits for the server before it moves. */
const StateCell = ({
  webhook,
  t,
  toggleEnabled,
}: {
  webhook: TWebhook;
  t: TFunction;
  toggleEnabled: TToggleEnabled;
}) => {
  const [isChecked, setIsChecked] = useState(webhook.enabled);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = async () => {
    setIsLoading(true);
    const res = (await toggleEnabled(webhook, t)) as
      Partial<TWebhook> | undefined;
    if (res) setIsChecked(!!res.enabled);
    setIsLoading(false);
  };

  return (
    <ToggleButton
      dataTestId={`toggle_button_${webhook.name}`}
      className="toggle toggleButton"
      id="toggle id"
      isChecked={isChecked}
      onChange={onChange}
      isDisabled={isLoading}
    />
  );
};

/** The old table's columns: the author only for an admin; then the menu. */
export const getWebhooksColumns = (
  t: TFunction,
  isAdmin: boolean,
  toggleEnabled: TToggleEnabled,
): DataTableColumn<TWebhook>[] => [
  {
    id: "Name",
    title: t("Common:Label"),
    width: { type: "fill" },
    cellClassName: styles.cell,
    cell: (webhook) => <NameCell webhook={webhook} />,
  },
  ...(isAdmin
    ? [
        {
          id: "Author",
          title: t("Common:ByAuthor"),
          width: { type: "flex" },
          cellClassName: styles.cell,
          cell: (webhook) => <AuthorCell webhook={webhook} />,
        } satisfies DataTableColumn<TWebhook>,
      ]
    : []),
  {
    id: "URL",
    title: t("URL"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (webhook) => (
      <Text
        as="span"
        fontSize="11px"
        color={globalColors.gray}
        fontWeight={600}
        className="textOverflow"
      >
        {webhook.uri}
      </Text>
    ),
  },
  {
    id: "State",
    title: t("State"),
    width: { type: "flex" },
    cellClassName: styles.cell,
    cell: (webhook) => (
      <StateCell webhook={webhook} t={t} toggleEnabled={toggleEnabled} />
    ),
  },
  contextMenuColumn<TWebhook>(),
];
