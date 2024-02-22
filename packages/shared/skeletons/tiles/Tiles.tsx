import React from "react";

import { RectangleSkeleton } from "../rectangle";

import { TileSkeleton } from "./Tile";
import { StyledTilesSkeleton, StyledTilesWrapper } from "./Tiles.styled";
import type { TilesSkeletonProps } from "./Tiles.types";

export const TilesSkeleton = ({
  foldersCount = 2,
  filesCount = 8,
  withTitle = true,
  ...rest
}: TilesSkeletonProps) => {
  const folders = [];
  const files = [];

  for (let i = 0; i < foldersCount; i += 1) {
    folders.push(<TileSkeleton isFolder key={`tile-loader-${i}`} {...rest} />);
  }

  for (let i = 0; i < filesCount; i += 1) {
    files.push(<TileSkeleton key={`files-loader-${i}`} {...rest} />);
  }

  return (
    <StyledTilesWrapper>
      {foldersCount > 0 ? (
        <RectangleSkeleton
          height="22px"
          width="78px"
          className="folders"
          animate
          {...rest}
        />
      ) : null}
      <StyledTilesSkeleton>{folders}</StyledTilesSkeleton>

      {filesCount > 0
        ? withTitle && (
            <RectangleSkeleton
              height="22px"
              width="103px"
              className="files"
              animate
              {...rest}
            />
          )
        : null}
      <StyledTilesSkeleton>{files}</StyledTilesSkeleton>
    </StyledTilesWrapper>
  );
};
