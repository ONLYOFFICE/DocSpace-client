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
import React, { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";

import CanceledLightIconURL from "PUBLIC_DIR/images/emptyview/empty.access.rights.light.svg?url";
import CanceledDarkIconURL from "PUBLIC_DIR/images/emptyview/empty.access.rights.dark.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import {
  Heading,
  HeadingLevel,
  HeadingSize,
} from "@docspace/ui-kit/components/heading";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { isFile, isFolder } from "@docspace/shared/utils/typeGuards";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import styles from "./NoItem.module.scss";

interface ExpiredItemProps {
  infoPanelSelection?: TRoom | TFile | TFolder;
}

const ExpiredItem: FC<ExpiredItemProps> = ({ infoPanelSelection }) => {
  const { isBase } = useTheme();
  const { t } = useTranslation(["Common"]);

  const { title, description } = useMemo(() => {
    if (isFile(infoPanelSelection))
      return {
        title: t("Common:FileNotAvailable"),
        description: t("Common:FileLinkExpired"),
      };

    if (isFolder(infoPanelSelection))
      return {
        title: t("Common:FolderNotAvailable"),
        description: t("Common:FolderLinkExpired"),
      };

    return {
      title: t("Common:RoomNotAvailable"),
      description: t("Common:RoomLinkExpired"),
    };
  }, [infoPanelSelection]);

  const imageSrc = isBase ? CanceledLightIconURL : CanceledDarkIconURL;

  return (
    <div className={styles.noItemContainer}>
      <div className="no-thumbnail-img-wrapper">
        <img src={imageSrc} alt="Locked icon" />
      </div>
      <div>
        <Heading
          className="expired-title"
          level={HeadingLevel.h3}
          size={HeadingSize.xsmall}
        >
          {title}
        </Heading>
        <Text className="expired-text" textAlign="center">
          {description}
        </Text>
      </div>
    </div>
  );
};

export default ExpiredItem;
