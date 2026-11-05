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

import type { TFunction } from "i18next";
import classNames from "classnames";

import type { IClientProps } from "@docspace/shared/utils/oauth/types";
import {
  contextMenuColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import {
  Link,
  LinkTarget,
  LinkType,
} from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";

import NameCell from "./columns/name";

import styles from "../../authorized-apps.module.scss";

const textClassName = classNames(
  styles.descriptionText,
  styles.textOverflow,
  styles.mr8,
);

/** The old header's columns, then the row menu. */
export const getAuthorizedAppsColumns = (
  t: TFunction,
  locale: string,
): DataTableColumn<IClientProps>[] => [
  {
    id: "App",
    title: t("OAuth:Apps"),
    width: { type: "fill" },
    cellClassName: styles.cell,
    cell: (item) => <NameCell item={item} />,
  },
  {
    id: "Website",
    title: t("Common:Website"),
    width: { type: "flex", min: 150 },
    cellClassName: styles.cell,
    cell: (item) => (
      <Text as="span" fontWeight={400} className={textClassName}>
        <Link
          className={styles.descriptionText}
          href={item.websiteUrl}
          type={LinkType.action}
          target={LinkTarget.blank}
          isHovered
          dataTestId="website_link"
        >
          {item.websiteUrl}
        </Link>
      </Text>
    ),
  },
  {
    id: "Access granted",
    title: t("OAuth:AccessGranted"),
    width: { type: "flex", min: 150 },
    cellClassName: styles.cell,
    cell: (item) => (
      <Text
        as="span"
        fontWeight={400}
        className={textClassName}
        dataTestId="modified_date_text"
      >
        {getCorrectDate(locale, item.modifiedOn || "")}
      </Text>
    ),
  },
  contextMenuColumn<IClientProps>({
    // The old rows' menu button test id.
    contextMenuButtonTestId: "context-menu-button",
  }),
];
