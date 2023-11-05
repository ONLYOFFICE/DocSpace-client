import React, { useEffect, useState } from "react";
import Loaders from "../../Loaders";

import { isMobile, isTablet } from "@docspace/components/utils/device";

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
          <Loaders.Tiles filesCount={7} />
        ) : (
          <Loaders.Tiles />
        )
      ) : (
        <Loaders.Rows count={(viewMobile && 8) || (viewTablet && 12) || 9} />
      )}
    </div>
  );
};

export default EmptyContainerLoader;
