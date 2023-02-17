import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  StyledDiscSpaceUsedComponent,
  StyledFolderTagColor,
} from "./StyledComponent";
import FolderTagSection from "./sub-components/FolderTagSection";

import Text from "@docspace/components/text";
import { getConvertedSize } from "@docspace/common/utils";

const calculateSize = (size, common) => ((100 * size) / common).toFixed(2);
const DiskSpaceUsedComponent = (props) => {
  const { t } = useTranslation("Settings");
  const {
    documentsSize = 10,
    trashSize = 20,
    archiveSize = 5,
    roomsSize = 40,
    common = 115,
    used = 75,
    usedTotalStorageSizeCount,
    maxTotalSizeByQuota,
  } = props;

  const totalSize = getConvertedSize(t, maxTotalSizeByQuota);
  const usedSize = getConvertedSize(t, usedTotalStorageSizeCount);

  const folderTags = [
    {
      name: "My Document",
      color: "#13B7EC",
      percentageSize: calculateSize(documentsSize, common),
      size: documentsSize,
    },
    {
      name: "Trash",
      color: "#FF9933",
      percentageSize: calculateSize(trashSize, common),
      size: trashSize,
    },
    {
      name: "Archive",
      color: "#FFD30F",
      percentageSize: calculateSize(archiveSize, common),
      size: archiveSize,
    },
    {
      name: "Rooms",
      color: "#22C386",
      percentageSize: calculateSize(roomsSize, common),
      size: roomsSize,
    },
  ];

  const DiskSpace = (
    <>
      <Text fontWeight={600}>
        {t("TotalStorage", {
          size: totalSize,
        })}
      </Text>

      <Text fontWeight={600}>
        {t("UsedStorage", {
          size: usedSize,
        })}
      </Text>
    </>
  );

  console.log("Disk Space render");
  return (
    <StyledDiscSpaceUsedComponent>
      <Text fontSize="16px" fontWeight={700} className="disk-space_title">
        {t("DiskSpaceUsed")}
      </Text>

      {DiskSpace}

      <div className="disk-space_slider">
        {folderTags.map((tag, index) => (
          <FolderTagSection
            width={tag.percentageSize}
            key={index}
            color={tag.color}
          />
        ))}
      </div>
      <div className="disk-space_description">
        {folderTags.map((tag, index) => (
          <div className="disk-space_folder-tag" key={index}>
            <StyledFolderTagColor
              className="disk-space_color"
              color={tag.color}
            />
            <Text fontWeight={600}>{tag.name}</Text>:<Text>{tag.size}</Text>
          </div>
        ))}
      </div>
    </StyledDiscSpaceUsedComponent>
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { maxTotalSizeByQuota, usedTotalStorageSizeCount } = currentQuotaStore;

  return {
    maxTotalSizeByQuota,
    usedTotalStorageSizeCount,
  };
})(observer(DiskSpaceUsedComponent));
