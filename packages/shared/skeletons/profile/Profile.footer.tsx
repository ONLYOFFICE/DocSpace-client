import React, { useEffect, useState } from "react";

import { isDesktop } from "@docspace/shared/utils";

import { RowsSkeleton } from "../rows";
import { RectangleSkeleton } from "../rectangle";

import { FooterBlock } from "./Profile.styled";
import { ProfileFooterLoaderProps } from "./Profile.types";

export const ProfileFooterLoader = ({
  id,
  className,
  style,
  ...rest
}: ProfileFooterLoaderProps) => {
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

  const checkWidth = () => {
    setIsDesktopView(isDesktop());
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

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
