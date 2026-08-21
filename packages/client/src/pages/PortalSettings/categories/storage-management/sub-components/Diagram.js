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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import styles from "../StyledComponent.module.scss";

const calculateSize = (size, common) => {
  if (common === -1) return 0;

  return (size * 100) / common;
};

const MIN_USED_SHARE = 25;

const getTags = (
  t,
  standalone,
  catalogs,
  tenantCustomQuota,
  maxTotalSizeByQuota,
  usedPortalSpace,
) => {
  const colors = [
    globalColors.mainBlueLight,
    globalColors.secondGreen,
    globalColors.secondOrange,
    globalColors.mainYellow,
    globalColors.purple,
    globalColors.coralPink,
  ];

  let commonSize = standalone ? tenantCustomQuota : maxTotalSizeByQuota;

  if (standalone && tenantCustomQuota < usedPortalSpace)
    commonSize = usedPortalSpace;

  const items = Object.values(catalogs).map(({ usedSpace, title }, i) => ({
    name: title,
    color: colors[i],
    share: calculateSize(usedSpace, commonSize),
    size: getConvertedSize(t, usedSpace),
  }));

  const usedShare = items.reduce((sum, item) => sum + item.share, 0);
  const scale =
    usedShare > 0 && usedShare < MIN_USED_SHARE
      ? MIN_USED_SHARE / usedShare
      : 1;

  return items.map(({ share, ...item }) => {
    let percentageSize = share * scale;
    if (percentageSize < 0.05 && percentageSize !== 0) percentageSize = 0.5;

    return { ...item, percentageSize };
  });
};
const Diagram = (props) => {
  const {
    maxWidth = 660,
    filesUsedSpace,
    usedPortalSpace,
    maxTotalSizeByQuota,
    standalone,
    tenantCustomQuota,
  } = props;

  const { t } = useTranslation("Common");

  const elementsTags = getTags(
    t,
    standalone,
    filesUsedSpace,
    tenantCustomQuota,
    maxTotalSizeByQuota,
    usedPortalSpace,
  );

  const hidingSlider = standalone && tenantCustomQuota === -1;

  return (
    <div
      className={styles.diagramComponent}
      style={{ "--diagram-slider-max-width": `${maxWidth}px` }}
    >
      {!hidingSlider ? (
        <div className="diagram_slider">
          {elementsTags.map((tag) => (
            <div
              key={tag.name}
              className={styles.folderTagSection}
              style={{
                background: tag.color,
                width: `${tag.percentageSize}%`,
                borderInlineEnd:
                  tag.percentageSize !== 0
                    ? "1px solid var(--settings-payment-bg-color)"
                    : undefined,
              }}
            />
          ))}
        </div>
      ) : null}
      <div className="diagram_description">
        {elementsTags.map((tag) => (
          <div className="diagram_folder-tag" key={tag.name}>
            <div
              className={styles.folderTagColor}
              style={{ background: tag.color }}
            />
            <Text fontWeight={600}>{tag.name}</Text>:
            <Text className="tag_text">{tag.size}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export default inject(
  ({ storageManagement, currentQuotaStore, settingsStore }) => {
    const { filesUsedSpace } = storageManagement;
    const {
      tenantCustomQuota,
      usedTotalStorageSizeCount,
      maxTotalSizeByQuota,
    } = currentQuotaStore;
    const { standalone } = settingsStore;

    return {
      tenantCustomQuota,
      filesUsedSpace,
      usedPortalSpace: usedTotalStorageSizeCount,
      maxTotalSizeByQuota,
      standalone,
    };
  },
)(observer(Diagram));
