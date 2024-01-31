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

export default inject(({ storageManagement, auth }) => {
  const { filesUsedSpace } = storageManagement;
  const { currentQuotaStore } = auth;
  const { tenantCustomQuota, usedTotalStorageSizeCount } = currentQuotaStore;

  return {
    tenantCustomQuota,
    filesUsedSpace,
    usedSpace: usedTotalStorageSizeCount,
  };
})(observer(Diagram));
