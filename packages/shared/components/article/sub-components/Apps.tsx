import React from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import WindowsReactSvgUrl from "PUBLIC_DIR/images/windows.react.svg?url";
import MacOSReactSvgUrl from "PUBLIC_DIR/images/macOS.react.svg?url";
import LinuxReactSvgUrl from "PUBLIC_DIR/images/linux.react.svg?url";
import AndroidReactSvgUrl from "PUBLIC_DIR/images/android.react.svg?url";
import IOSReactSvgUrl from "PUBLIC_DIR/images/iOS.react.svg?url";

import { Text } from "../../text";
import { IconButton } from "../../icon-button";

import { StyledArticleApps } from "../Article.styled";
import { ArticleAppsProps } from "../Article.types";

const ArticleApps = React.memo(
  ({ showText, withDevTools }: ArticleAppsProps) => {
    const { t } = useTranslation(["Translations"]);

    const theme = useTheme();

    const desktopLink = "https://www.onlyoffice.com/desktop.aspx";
    const androidLink = "https://www.onlyoffice.com/office-for-android.aspx";
    const iosLink = "https://www.onlyoffice.com/office-for-ios.aspx";

    if (!showText) return null;

    return (
      <StyledArticleApps showText={showText} withDevTools={withDevTools}>
        <Text className="download-app-text" fontSize="14px" noSelect>
          {t("Common:DownloadApps")}
        </Text>
        <div className="download-app-list">
          <IconButton
            onClick={() => window.open(desktopLink)}
            iconName={WindowsReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.winHoverColor}
            title={t("Common:MobileWin")}
          />
          <IconButton
            onClick={() => window.open(desktopLink)}
            iconName={MacOSReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.macHoverColor}
            title={t("Common:MobileMac")}
          />
          <IconButton
            onClick={() => window.open(desktopLink)}
            iconName={LinuxReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.linuxHoverColor}
            title={t("Common:MobileLinux")}
          />
          <IconButton
            onClick={() => window.open(androidLink)}
            iconName={AndroidReactSvgUrl}
            size={32}
            isFill
            hoverColor={
              theme.filesArticleBody.downloadAppList.androidHoverColor
            }
            title={t("Common:MobileAndroid")}
          />
          <IconButton
            onClick={() => window.open(iosLink)}
            iconName={IOSReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.iosHoverColor}
            title={t("Common:MobileIos")}
          />
        </div>
      </StyledArticleApps>
    );
  },
);

ArticleApps.displayName = "ArticleApps";

export default ArticleApps;

