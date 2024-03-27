// (c) Copyright Ascensio System SIA 2009-2024
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

import {
  StyledDiagramComponent,
  StyledFolderTagColor,
  StyledFolderTagSection,
} from "../StyledComponent";
import { getConvertedSize } from "@docspace/shared/utils/common";

const calculateSize = (size, common) => {
  if (common === -1) return 0;

  return (size * 100) / common;
};

const getTags = (obj, tenantCustomQuota, usedPortalSpace, t) => {
  const array = [];
  const colors = ["#13B7EC", "#22C386", "#FF9933", "#FFD30F"];

  let i = 0;
  const commonSize =
    tenantCustomQuota < usedPortalSpace && tenantCustomQuota !== -1
      ? usedPortalSpace
      : tenantCustomQuota;

  for (let key in obj) {
    const item = obj[key];
    const { usedSpace, title } = item;

    const percentageSize = calculateSize(usedSpace, commonSize);
    const size = getConvertedSize(t, usedSpace);

    array.push({
      name: title,
      color: colors[i],
      percentageSize,
      size,
    });

    i++;
  }

  return array;
};
const Diagram = (props) => {
  const {
    tenantCustomQuota,
    maxWidth = 660,
    filesUsedSpace,
    usedSpace,
  } = props;

  const { t } = useTranslation("Common");

  const elementsTags = getTags(filesUsedSpace, tenantCustomQuota, usedSpace, t);

  return (
    <StyledDiagramComponent maxWidth={maxWidth}>
      <div className="diagram_slider">
        {elementsTags.map((tag, index) => (
          <StyledFolderTagSection
            width={tag.percentageSize}
            key={index}
            color={tag.color}
          />
        ))}
      </div>
      <div className="diagram_description">
        {elementsTags.map((tag, index) => (
          <div className="diagram_folder-tag" key={index}>
            <StyledFolderTagColor color={tag.color} />
            <Text fontWeight={600}>{tag.name}</Text>:
            <Text className="tag_text">{tag.size}</Text>
          </div>
        ))}
      </div>
    </StyledDiagramComponent>
  );
};

export default inject(({ storageManagement, currentQuotaStore }) => {
  const { filesUsedSpace } = storageManagement;
  const { tenantCustomQuota, usedTotalStorageSizeCount } = currentQuotaStore;

  return {
    tenantCustomQuota,
    filesUsedSpace,
    usedSpace: usedTotalStorageSizeCount,
  };
})(observer(Diagram));
