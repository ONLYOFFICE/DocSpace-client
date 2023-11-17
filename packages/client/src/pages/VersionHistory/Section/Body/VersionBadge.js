import React from "react";
import styled, { css } from "styled-components";
import Text from "@docspace/components/text";
import { ColorTheme, ThemeType } from "@docspace/components/ColorTheme";
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
  ${({ reverse }) => reverse && `flex-direction: row-reverse;`}

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
      themeId={ThemeType.VersionBadge}
      className={className}
      marginProp="0 8px"
      displayProp="flex"
      isVersion={true}
      theme={theme}
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
        reverse={isJapanese}
      >
        {isVersion && (
          <>
            <span>{t("Version")}</span>&nbsp;<span>{versionGroup}</span>
          </>
        )}
      </VersionBadgeText>
    </ColorTheme>
  );
};

export default VersionBadge;
