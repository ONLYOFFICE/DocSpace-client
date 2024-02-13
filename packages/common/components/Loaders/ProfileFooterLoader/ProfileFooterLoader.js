import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FooterBlock } from "./StyledProfileFooter";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { RowsSkeleton } from "@docspace/shared/skeletons";

import { isDesktop } from "@docspace/shared/utils";

const ProfileFooterLoader = ({ id, className, style, ...rest }) => {
  const {
    title,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  const [isDesktopView, setIsDesktopView] = useState(false);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    setIsDesktopView(isDesktop());
  };

  return (
    <div id={id} className={className} style={style}>
      <FooterBlock>
        <div className="header">
          <RectangleSkeleton
            title={title}
            width="129"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />

          <RectangleSkeleton
            title={title}
            width="213"
            height="20"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        </div>

        {isDesktopView && (
          <div className="table-header">
            <RectangleSkeleton
              title={title}
              width="51"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />

            <RectangleSkeleton
              title={title}
              width="60"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />

            <RectangleSkeleton
              title={title}
              width="62"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        )}

        <RowsSkeleton count={3} />
      </FooterBlock>
    </div>
  );
};

ProfileFooterLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

ProfileFooterLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default ProfileFooterLoader;
