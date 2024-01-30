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
  const percentage = (size * 100) / common;


  return percentage;
};

const Diagram = (props) => {
  const {
    myDocumentsUsedSpace,
    tenantCustomQuota,
    trashUsedSpace,
    archiveUsedSpace,
    roomsUsedSpace,
    maxWidth = 660,
  } = props;

  const { t } = useTranslation("Common");

  const elementsTags = [
    {
      name: myDocumentsUsedSpace.title,
      color: "#13B7EC",
      percentageSize: calculateSize(
        myDocumentsUsedSpace.usedSpace,
        tenantCustomQuota
      ),
      size: getConvertedSize(t, myDocumentsUsedSpace.usedSpace),
    },
    {
      name: roomsUsedSpace.title,
      color: "#22C386",
      percentageSize: calculateSize(
        roomsUsedSpace.usedSpace,
        tenantCustomQuota,
      ),
      size: getConvertedSize(t, roomsUsedSpace.usedSpace),
    },
    {
      name: trashUsedSpace.title,
      color: "#FF9933",
      percentageSize: calculateSize(
        trashUsedSpace.usedSpace,
        tenantCustomQuota,
      ),
      size: getConvertedSize(t, trashUsedSpace.usedSpace),
    },
    {
      name: archiveUsedSpace.title,
      color: "#FFD30F",
      percentageSize: calculateSize(
        archiveUsedSpace.usedSpace,
        tenantCustomQuota,
      ),
      size: getConvertedSize(t, archiveUsedSpace.usedSpace),
    },
  ];

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
  const { tenantCustomQuota } = currentQuotaStore;

  const {
    myDocumentsUsedSpace,
    trashUsedSpace,
    archiveUsedSpace,
    roomsUsedSpace,
  } = filesUsedSpace;

  return {
    tenantCustomQuota,
    myDocumentsUsedSpace,
    trashUsedSpace,
    archiveUsedSpace,
    roomsUsedSpace,
  };
})(observer(Diagram));
