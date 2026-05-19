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

import React from "react";
import { useTranslation, Trans } from "react-i18next";

import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import { NewFilesPanelItemFile } from "./NewFilesPanelItemFile";
import { NewFilesPanelFileListProps } from "../NewFilesBadge.types";

export const NewFilesPanelFileList = ({
  items,
  isRooms,
  onClose,
}: NewFilesPanelFileListProps) => {
  const { t } = useTranslation(["Common"]);

  const [showMore, setShowMore] = React.useState(false);

  return (
    <div className="file-items-container">
      {items.map((item, index) => {
        if (index > 3 && !showMore) return null;

        if (index === 3 && !showMore) {
          return (
            <Text
              key="more-items"
              className="more-items"
              lineHeight="20px"
              fontSize="13px"
              fontWeight={400}
              noSelect
            >
              <Trans
                t={t}
                ns="Common"
                i18nKey="AndMore"
                values={{ count: items.length - 3 }}
                components={{
                  1: (
                    <Link
                      key="more-items-link"
                      className="more-items__link"
                      type={LinkType.action}
                      isBold
                      onClick={() => setShowMore(true)}
                    />
                  ),
                }}
              />
            </Text>
          );
        }

        return (
          <NewFilesPanelItemFile
            key={item.id}
            item={item}
            onClose={onClose}
            isRooms={isRooms}
          />
        );
      })}
    </div>
  );
};
