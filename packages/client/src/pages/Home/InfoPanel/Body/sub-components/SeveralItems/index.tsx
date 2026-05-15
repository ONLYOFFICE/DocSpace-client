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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { TGroup } from "@docspace/shared/api/groups/types";

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/emptyview/empty.contacts.info.light.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/emptyview/empty.contacts.info.dark.svg?url";
import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.light.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/emptyview/empty.files.info.dark.svg?url";

import { TPeopleListItem } from "SRC_DIR/helpers/contacts";

import styles from "./SeveralItems.module.scss";

type SeveralItemsProps = {
  isGroups?: boolean;
  isUsers?: boolean;
  selectedItems: TPeopleListItem[] | TGroup[] | (TRoom | TFile | TFolder)[];
};

const SeveralItems = ({
  isGroups,
  isUsers,
  selectedItems,
}: SeveralItemsProps) => {
  const { t } = useTranslation(["InfoPanel"]);
  const { isBase } = useTheme();

  const emptyScreenAlt = isBase
    ? EmptyScreenAltSvgUrl
    : EmptyScreenAltSvgDarkUrl;

  const emptyScreenPerson = isBase
    ? EmptyScreenPersonSvgUrl
    : EmptyScreenPersonSvgDarkUrl;

  const isContacts = isGroups || isUsers;

  const imgSrc = isContacts ? emptyScreenPerson : emptyScreenAlt;

  const itemsText = isGroups
    ? t("InfoPanel:SelectedGroups")
    : isUsers
      ? t("InfoPanel:SelectedUsers")
      : t("InfoPanel:ItemsSelected");

  return (
    <div className={classNames("no-thumbnail-img-wrapper", styles.container)}>
      <img src={imgSrc} alt="Several items" />
      <Text fontSize="16px" fontWeight={700}>
        {`${itemsText}: ${selectedItems.length}`}
      </Text>
    </div>
  );
};

export default SeveralItems;
