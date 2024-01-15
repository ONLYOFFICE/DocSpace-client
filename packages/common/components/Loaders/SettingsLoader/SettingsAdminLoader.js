import React from "react";
import { LoaderStyle } from "@docspace/shared/constants";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { Box } from "@docspace/shared/components/box";

const speed = 2;
const heightText = "20px";
const heightRadio = "16px";
const sectionGap = "16px";
const sectionsGap = "32px";

const Setting = ({ width = "280px" }) => (
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
      backgroundColor={LoaderStyle.backgroundColor}
      foregroundColor={LoaderStyle.foregroundColor}
      backgroundOpacity={LoaderStyle.backgroundOpacity}
      foregroundOpacity={LoaderStyle.foregroundOpacity}
      speed={speed}
      animate={true}
    />
    <RectangleSkeleton
      height={heightText}
      backgroundColor={LoaderStyle.backgroundColor}
      foregroundColor={LoaderStyle.foregroundColor}
      backgroundOpacity={LoaderStyle.backgroundOpacity}
      foregroundOpacity={LoaderStyle.foregroundOpacity}
      speed={speed}
      animate={true}
    />
  </Box>
);

const SectionTitle = ({ height = "16px", width = "141px" }) => (
  <RectangleSkeleton
    height={height}
    width={width}
    backgroundColor={LoaderStyle.backgroundColor}
    foregroundColor={LoaderStyle.foregroundColor}
    backgroundOpacity={LoaderStyle.backgroundOpacity}
    foregroundOpacity={LoaderStyle.foregroundOpacity}
    speed={speed}
    animate={true}
  />
);

const SettingsSection = ({ width }) => (
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
      height={"32"}
      backgroundColor={LoaderStyle.backgroundColor}
      foregroundColor={LoaderStyle.foregroundColor}
      backgroundOpacity={LoaderStyle.backgroundOpacity}
      foregroundOpacity={LoaderStyle.foregroundOpacity}
      speed={speed}
      animate={true}
    />
    <RectangleSkeleton
      height={"32"}
      backgroundColor={LoaderStyle.backgroundColor}
      foregroundColor={LoaderStyle.foregroundColor}
      backgroundOpacity={LoaderStyle.backgroundOpacity}
      foregroundOpacity={LoaderStyle.foregroundOpacity}
      speed={speed}
      animate={true}
    />
  </Box>
);

const SettingsAdminLoader = () => (
  <Box
    widthProp="100%"
    heightProp="100%"
    displayProp="grid"
    style={{ gridGap: sectionsGap }}
  >
    <SettingsTabs />
    <SettingsSection width={"222px"} />
    <SettingsSection width={"260px"} />
  </Box>
);

export default SettingsAdminLoader;
