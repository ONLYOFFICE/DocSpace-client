import React from "react";

import {
  StyledDiagramComponent,
  StyledFolderTagColor,
  StyledFolderTagSection,
} from "../StyledComponent";

import Text from "@docspace/components/text";

const calculateSize = (size, common) => ((100 * size) / common).toFixed(2);
const Diagram = (props) => {
  const {
    documentsSize = 10,
    trashSize = 20,
    archiveSize = 5,
    roomsSize = 40,
    common = 115,
    maxWidth = 700,
  } = props;

  const elementsTags = [
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
            <Text fontWeight={600}>{tag.name}</Text>:<Text>{tag.size}</Text>
          </div>
        ))}
      </div>
    </StyledDiagramComponent>
  );
};

export default Diagram;
