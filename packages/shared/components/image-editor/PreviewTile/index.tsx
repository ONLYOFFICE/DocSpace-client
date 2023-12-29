import React from "react";

import { Tags } from "../../tags";
import { Tag } from "../../tag";
import { StyledPreviewTile } from "../ImageEditor.styled";

const PreviewTile = ({
  title,
  previewIcon,
  tags,
  defaultTagLabel,
}: {
  title: string;
  previewIcon: string;
  tags: string[];
  defaultTagLabel: string;
}) => {
  return (
    <StyledPreviewTile>
      <div className="tile-header">
        <img className="tile-header-icon" src={previewIcon} alt={title} />
        <div className="tile-header-title">{title}</div>
      </div>
      <div className="tile-tags">
        {tags.length ? (
          <Tags columnCount={2} tags={tags} onSelectTag={() => {}} />
        ) : (
          <Tag
            className="type_tag"
            tag="script"
            label={defaultTagLabel}
            isDefault
            onClick={() => {}}
          />
        )}
      </div>
    </StyledPreviewTile>
  );
};

export default PreviewTile;
