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
import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import VersionSvg from "PUBLIC_DIR/images/versionrevision_active.react.svg";
import { useTranslation } from "react-i18next";

const VersionMarkIcon = styled(VersionSvg)`
  path {
    fill: ${(props) =>
      !props.$isVersion
        ? props.theme.filesVersionHistory.badge.defaultFill
        : props.index === 0
          ? props.theme.filesVersionHistory.badge.fill
          : props.theme.filesVersionHistory.badge.badgeFill};
    stroke: ${(props) =>
      !props.$isVersion
        ? props.theme.filesVersionHistory.badge.stroke
        : props.index === 0
          ? props.theme.filesVersionHistory.badge.fill
          : props.theme.filesVersionHistory.badge.badgeFill};

    stroke-dasharray: ${(props) => (props.$isVersion ? "2 0" : "3 1")};
    stroke-linejoin: ${(props) => (props.$isVersion ? "unset" : "round")};

    ${(props) =>
      props.$isVersion &&
      css`
        stroke-width: 2;
      `}
  }
`;

const VersionBadgeText = styled(Text)`
  position: absolute;
  box-sizing: border-box;
  max-width: 56px;
  padding-inline: 6px;

  white-space: nowrap;

  display: flex;
  justify-content: flex-start;
  ${({ $reverse }) => $reverse && `flex-direction: row-reverse;`}
  gap: 3px;

  span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const VersionBadge = ({
  className,
  isVersion,
  versionGroup,
  index,
  t,
  theme,
  ...rest
}) => {
  const { i18n } = useTranslation();
  const isJapanese = i18n.language === "ja-JP";

  return (
    <ColorTheme
      themeId={ThemeId.VersionBadge}
      className={className}
      style={{
        boxSizing: "border-box",
        display: "flex",
      }}
      $isVersion
      theme={theme}
      $isFirst={index === 0}
      {...rest}
    >
      <VersionMarkIcon
        className="version-mark-icon"
        $isVersion={isVersion}
        theme={theme}
        index={index}
      />

      <VersionBadgeText
        className="version_badge-text"
        color={theme.filesVersionHistory.badge.color}
        isBold
        fontSize="12px"
        $reverse={isJapanese}
      >
        {isVersion ? (
          <>
            <span>{t("Version")}</span>
            <span>{versionGroup}</span>
          </>
        ) : null}
      </VersionBadgeText>
    </ColorTheme>
  );
};

export default VersionBadge;
