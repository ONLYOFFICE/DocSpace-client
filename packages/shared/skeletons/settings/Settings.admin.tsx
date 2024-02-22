import React from "react";
import { Box } from "@docspace/shared/components/box";
import { LOADER_STYLE } from "@docspace/shared/constants";

import { RectangleSkeleton } from "../rectangle";

import type { SectionTitleProps, SettingProps } from "./Settings.types";

const speed = 2;
const heightText = "20px";
const heightRadio = "16px";
const sectionGap = "16px";
const sectionsGap = "32px";

const Setting = ({ width = "280px" }: SettingProps) => (
  <Box
    displayProp="grid"
    style={{
      gridGap: "8px",
      gridTemplateColumns: `28px ${width}`,
      alignItems: "center",
    }}
  >
    <RectangleSkeleton
      height={heightRadio}
      backgroundColor={LOADER_STYLE.backgroundColor}
      foregroundColor={LOADER_STYLE.foregroundColor}
      backgroundOpacity={LOADER_STYLE.backgroundOpacity}
      foregroundOpacity={LOADER_STYLE.foregroundOpacity}
      speed={speed}
      animate
    />
    <RectangleSkeleton
      height={heightText}
      backgroundColor={LOADER_STYLE.backgroundColor}
      foregroundColor={LOADER_STYLE.foregroundColor}
      backgroundOpacity={LOADER_STYLE.backgroundOpacity}
      foregroundOpacity={LOADER_STYLE.foregroundOpacity}
      speed={speed}
      animate
    />
  </Box>
);

const SectionTitle = ({
  height = "16px",
  width = "141px",
}: SectionTitleProps) => (
  <RectangleSkeleton
    height={height}
    width={width}
    backgroundColor={LOADER_STYLE.backgroundColor}
    foregroundColor={LOADER_STYLE.foregroundColor}
    backgroundOpacity={LOADER_STYLE.backgroundOpacity}
    foregroundOpacity={LOADER_STYLE.foregroundOpacity}
    speed={speed}
    animate
  />
);

const SettingsSection = ({ width }: Required<SettingProps>) => (
  <Box displayProp="grid" style={{ gridGap: sectionGap }}>
    <SectionTitle />
    <Setting width={width} />
  </Box>
);

const SettingsTabs = () => (
  <Box
    displayProp="grid"
    style={{
      gridGap: "20px",
      gridTemplateColumns: "41px 58px",
    }}
  >
    <RectangleSkeleton
      height="32"
      backgroundColor={LOADER_STYLE.backgroundColor}
      foregroundColor={LOADER_STYLE.foregroundColor}
      backgroundOpacity={LOADER_STYLE.backgroundOpacity}
      foregroundOpacity={LOADER_STYLE.foregroundOpacity}
      speed={speed}
      animate
    />
    <RectangleSkeleton
      height="32"
      backgroundColor={LOADER_STYLE.backgroundColor}
      foregroundColor={LOADER_STYLE.foregroundColor}
      backgroundOpacity={LOADER_STYLE.backgroundOpacity}
      foregroundOpacity={LOADER_STYLE.foregroundOpacity}
      speed={speed}
      animate
    />
  </Box>
);

export const SettingsAdminSkeleton = () => (
  <Box
    widthProp="100%"
    heightProp="100%"
    displayProp="grid"
    style={{ gridGap: sectionsGap }}
  >
    <SettingsTabs />
    <SettingsSection width="222px" />
    <SettingsSection width="260px" />
  </Box>
);
