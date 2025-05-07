// (c) Copyright Ascensio System SIA 2009-2025
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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";
import {
  StyledDiagramComponent,
  StyledFolderTagColor,
  StyledFolderTagSection,
} from "../StyledComponent";

const calculateSize = (size, common) => {
  if (common === -1) return 0;

  return (size * 100) / common;
};

const getTags = (
  t,
  standalone,
  catalogs,
  tenantCustomQuota,
  maxTotalSizeByQuota,
  usedPortalSpace,
) => {
  const array = [];
  const colors = [
    globalColors.mainBlueLight,
    globalColors.secondGreen,
    globalColors.secondOrange,
    globalColors.mainYellow,
  ];

  let i = 0;
  let commonSize = standalone ? tenantCustomQuota : maxTotalSizeByQuota;

  if (standalone && tenantCustomQuota < usedPortalSpace)
    commonSize = usedPortalSpace;

  Object.keys(catalogs).forEach((key) => {
    const item = catalogs[key];
    const { usedSpace, title } = item;

    let percentageSize = calculateSize(usedSpace, commonSize);
    if (percentageSize < 0.05 && percentageSize !== 0) percentageSize = 0.5;

    const size = getConvertedSize(t, usedSpace);

    array.push({
      name: title,
      color: colors[i],
      percentageSize,
      size,
    });

    i++;
  });

  return array;
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
    <StyledDiagramComponent maxWidth={maxWidth}>
      {!hidingSlider ? (
        <div className="diagram_slider">
          {elementsTags.map((tag) => (
            <StyledFolderTagSection
              width={tag.percentageSize}
              key={tag.name}
              color={tag.color}
            />
          ))}
        </div>
      ) : null}
      <div className="diagram_description">
        {elementsTags.map((tag) => (
          <div className="diagram_folder-tag" key={tag.name}>
            <StyledFolderTagColor color={tag.color} />
            <Text fontWeight={600}>{tag.name}</Text>:
            <Text className="tag_text">{tag.size}</Text>
          </div>
        ))}
      </div>
    </StyledDiagramComponent>
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
