import React, { useEffect, useState } from "react";
import { RowsSkeleton } from "@docspace/shared/skeletons";
import { TilesSkeleton } from "@docspace/shared/skeletons/tiles";

import { isMobile, isTablet } from "@docspace/shared/utils";

const EmptyContainerLoader = ({ viewAs, style, ...rest }) => {
  const [viewMobile, setViewMobile] = useState(false);
  const [viewTablet, setViewTablet] = useState(false);

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onCheckView = () => {
    if (isMobile()) {
      setViewMobile(true);
    } else {
      setViewMobile(false);
    }

    if (isTablet()) {
      setViewTablet(true);
    } else {
      setViewTablet(false);
    }
  };

  return (
    <div {...rest} style={{ display: "contents", style }}>
      {viewAs === "tile" ? (
        !viewMobile && !viewTablet ? (
          <TilesSkeleton filesCount={7} />
        ) : (
          <TilesSkeleton />
        )
      ) : (
        <RowsSkeleton count={(viewMobile && 8) || (viewTablet && 12) || 9} />
      )}
    </div>
  );
};

export default EmptyContainerLoader;
