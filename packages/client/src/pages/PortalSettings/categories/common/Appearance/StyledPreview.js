// (c) Copyright Ascensio System SIA 2009-2026
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

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import styles from "./StyledPreview.module.scss";

const buildPreviewVars = (themePreview, colorPreview, isViewTablet) => {
  const isLight = themePreview === "Light";

  return {
    "--preview-color": colorPreview,
    "--preview-menu-bg": isLight
      ? globalColors.grayLight
      : globalColors.darkGrayLight,
    "--preview-menu-width": isViewTablet ? "61px" : "251px",
    "--preview-menu-padding": isViewTablet ? "15px 0 0" : "21px 0 17px",
    "--preview-line-bg": isLight
      ? globalColors.grayLightMid
      : globalColors.grayDarkStrong,
    "--preview-notice-stroke": isLight ? "none" : globalColors.darkGrayLight,
    "--preview-section-bg": isLight ? globalColors.white : globalColors.black,
    "--preview-section-width": isViewTablet ? "100%" : "56%",
    "--preview-section-flex-tablet-display": isViewTablet ? "flex" : "initial",
    "--preview-section-flex-tablet-justify": isViewTablet
      ? "space-between"
      : "initial",
    "--preview-section-tile-padding-inline": isViewTablet ? "20px 0" : "20px",
    "--preview-loaders-theme-bg": isLight
      ? globalColors.white
      : globalColors.grayDark,
    "--preview-select-bg": isLight ? globalColors.white : globalColors.black,
    "--preview-border-color": isLight
      ? globalColors.grayStrong
      : globalColors.grayDarkStrong,
    "--preview-tile-width": isViewTablet ? "64%" : "auto",
    "--preview-background": isLight
      ? globalColors.white
      : globalColors.darkGrayLight,
    "--preview-only-tile-name-width": isViewTablet ? "66%" : "auto",
    "--preview-color-loaders-fill": isLight ? colorPreview : globalColors.white,
    "--preview-pin-fill": isLight ? colorPreview : globalColors.white,
    "--preview-tile-text-bg": isLight
      ? globalColors.grayStrong
      : globalColors.grayDark,
    "--preview-mobile-border": isLight
      ? `1px solid ${globalColors.grayStrong}`
      : `1px solid ${globalColors.grayDarkStrong}`,
  };
};

const StyledComponent = ({
  colorPreview,
  themePreview,
  isViewTablet,
  withBorder,
  className,
  style,
  children,
  ...rest
}) => {
  const { isRTL } = useInterfaceDirection();

  const classNames = [styles.styledComponent];
  if (withBorder) classNames.push(styles.withBorder);
  if (isRTL) classNames.push(styles.rtl);
  if (className) classNames.push(className);

  const inlineStyle = {
    ...buildPreviewVars(themePreview, colorPreview, isViewTablet),
    ...style,
  };

  return (
    <div className={classNames.join(" ")} style={inlineStyle} {...rest}>
      {children}
    </div>
  );
};

const StyledFloatingButton = ({
  colorPreview,
  themePreview,
  className,
  style,
  children,
  ...rest
}) => {
  const classNames = [styles.styledFloatingButton];
  if (className) classNames.push(className);

  const inlineStyle = {
    "--preview-color": colorPreview,
    ...style,
  };

  return (
    <div className={classNames.join(" ")} style={inlineStyle} {...rest}>
      {children}
    </div>
  );
};

const IconBox = ({ colorCheckImg, className, children, ...rest }) => {
  const classNames = [styles.iconBox];
  if (className) classNames.push(className);

  return (
    <div
      className={classNames.join(" ")}
      style={{ "--check-img-color": colorCheckImg }}
      {...rest}
    >
      {children}
    </div>
  );
};

const StyledMobilePreview = ({
  colorPreview,
  themePreview,
  isViewTablet,
  className,
  style,
  children,
  ...rest
}) => {
  const classNames = [styles.styledMobilePreview];
  if (className) classNames.push(className);

  const inlineStyle = {
    ...buildPreviewVars(themePreview, colorPreview, isViewTablet),
    ...style,
  };

  return (
    <div className={classNames.join(" ")} style={inlineStyle} {...rest}>
      {children}
    </div>
  );
};

export { StyledComponent, StyledFloatingButton, IconBox, StyledMobilePreview };

