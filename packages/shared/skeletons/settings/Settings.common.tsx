// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { LOADER_STYLE } from "../../constants";

import { RectangleSkeleton } from "../rectangle";
import {
  SectionTitleProps,
  SettingProps,
  SettingsSectionProps,
} from "./Settings.types";

const speed = 2;
const heightText = "20px";
const heightRadio = "16px";
const sectionGap = "12px";
const sectionsGap = "12px";

const Setting = ({ width = "280px" }: SettingProps) => (
  <div
    style={{
      boxSizing: "border-box",
      display: "grid",
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
  </div>
);

const SectionTitle = ({ height = "16", width = "62" }: SectionTitleProps) => (
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

const SettingsSection = ({
  width1,
  width2,
  withTitle = true,
}: SettingsSectionProps) => (
  <div
    style={{ boxSizing: "border-box", display: "grid", gridGap: sectionGap }}
  >
    {withTitle ? <SectionTitle /> : null}
    <Setting width={width1} />
    <Setting width={width2} />
  </div>
);

// const SettingsTabs = () => (
//   <Box
//     displayProp="grid"
//     style={{
//       gridGap: "20px",
//       gridTemplateColumns: "41px 58px",
//     }}
//   >
//     <RectangleSkeleton
//       height="32"
//       backgroundColor={LOADER_STYLE.backgroundColor}
//       foregroundColor={LOADER_STYLE.foregroundColor}
//       backgroundOpacity={LOADER_STYLE.backgroundOpacity}
//       foregroundOpacity={LOADER_STYLE.foregroundOpacity}
//       speed={speed}
//       animate
//     />
//     <RectangleSkeleton
//       height="32"
//       backgroundColor={LOADER_STYLE.backgroundColor}
//       foregroundColor={LOADER_STYLE.foregroundColor}
//       backgroundOpacity={LOADER_STYLE.backgroundOpacity}
//       foregroundOpacity={LOADER_STYLE.foregroundOpacity}
//       speed={speed}
//       animate
//     />
//   </Box>
// );

export const SettingsCommonSkeleton = () => (
  <div
    style={{
      boxSizing: "border-box",
      display: "grid",
      width: "100%",
      height: "100%",
      gridGap: sectionsGap,
    }}
  >
    <SettingsSection width1="225px" width2="281px" withTitle={false} />
    <SettingsSection width1="324px" width2="351px" withTitle={false} />
  </div>
);
