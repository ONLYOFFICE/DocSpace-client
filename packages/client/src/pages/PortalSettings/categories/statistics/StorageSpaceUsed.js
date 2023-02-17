import React from "react";
import { useTranslation } from "react-i18next";

import {
  StyledDiscSpaceUsedComponent,
  StyledFolderTagColor,
} from "./StyledComponent";
import FolderTagSection from "./sub-components/FolderTagSection";

import Text from "@docspace/components/text";

const calculateSize = (size, common) => ((100 * size) / common).toFixed(2);
const DiskSpaceUsedComponent = (props) => {
  const { t } = useTranslation("Settings");
  const {
    documentsSize = 10,
    trashSize = 20,
    archiveSize = 5,
    roomsSize = 40,
    common = 115,
  } = props;

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

  return (
    <StyledDiscSpaceUsedComponent>
      <Text fontSize="16px" fontWeight={700}>
        {t("DiskSpaceUsed")}
      </Text>

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

export default DiskSpaceUsedComponent;
