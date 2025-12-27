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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { getBgPattern } from "@docspace/shared/utils/common";
import PortalLogo from "@docspace/shared/components/portal-logo/PortalLogo";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { DeepLinkType } from "@docspace/shared/enums";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import { iconSize32 } from "@docspace/shared/utils/image-helpers";
import { getDeepLink, redirectToStore } from "./DeepLink.helper";

import { DeepLinkProps } from "./DeepLink.types";
import styles from "./deeplink.module.scss";

const DeepLink = ({
  fileInfo,
  userEmail,
  setIsShowDeepLink,
  deepLinkConfig,
  deepLinkSettings,
}: DeepLinkProps) => {
  const { t } = useTranslation(["DeepLink", "Common"]);
  const { currentColorScheme } = useTheme();

  const [isRemember, setIsRemember] = useState(false);

  const isOpenInAppOnly = deepLinkSettings === DeepLinkType.App;

  const onChangeCheckbox = () => {
    setIsRemember(!isRemember);
  };

  const onOpenAppClick = () => {
    if (isRemember) localStorage.setItem("defaultOpenDocument", "app");
    getDeepLink(
      window.location.origin,
      userEmail ?? "",
      fileInfo,
      deepLinkConfig,
      window.location.href,
      isOpenInAppOnly,
    );
  };

  const onStayBrowserClick = () => {
    if (isRemember) localStorage.setItem("defaultOpenDocument", "web");
    window.location.replace(`${window.location.search}&without_redirect=true`);
    setIsShowDeepLink(false);
  };

  const onDownloadAppClick = () => {
    redirectToStore(deepLinkConfig);
  };

  const getFileIcon = () => {
    const fileExst = `${fileInfo?.fileExst.slice(1)}.svg`;
    const icon = iconSize32.has(fileExst)
      ? iconSize32.get(fileExst)
      : iconSize32.get("file.svg");
    return icon;
  };

  const getFileTitle = () => {
    return fileInfo?.fileExst
      ? fileInfo.title.split(".").slice(0, -1).join(".")
      : fileInfo?.title || "";
  };

  const bgPattern = getBgPattern(currentColorScheme?.id);

  const bgBlockStyle = {
    "--bg-pattern": bgPattern,
  } as React.CSSProperties;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bgBlock} style={bgBlockStyle} />
      <Scrollbar>
        <div className={styles.body}>
          <div className={styles.logoWrapper}>
            <PortalLogo className="portal-logo" isResizable />
          </div>
          <FormWrapper>
            <div className={styles.deepLink}>
              <div className={styles.bodyWrapper}>
                <Text className={styles.title}>
                  {t("DeepLink:OpeningDocument")}
                </Text>
                <div className={styles.fileTile}>
                  <Image
                    src={getFileIcon() ?? ""}
                    alt="portal-logo"
                    width={32}
                    height={32}
                  />
                  <Text fontSize="14px" fontWeight="600" truncate>
                    {getFileTitle()}
                  </Text>
                </div>
                <Text>
                  {isOpenInAppOnly
                    ? t("DeepLink:DeepLinkOnlyAppText")
                    : t("DeepLink:DeepLinkText")}
                </Text>
              </div>
              <div className={styles.actionsWrapper}>
                {!isOpenInAppOnly ? (
                  <Checkbox
                    label={t("DeepLink:RememberChoice")}
                    isChecked={isRemember}
                    onChange={onChangeCheckbox}
                  />
                ) : null}
                <Button
                  size={ButtonSize.medium}
                  primary
                  label={
                    isOpenInAppOnly
                      ? t("DeepLink:DownloadApp")
                      : t("DeepLink:OpenInApp")
                  }
                  onClick={
                    isOpenInAppOnly ? onDownloadAppClick : onOpenAppClick
                  }
                />
                {isOpenInAppOnly ? null : (
                  <Link
                    className={styles.stayLink}
                    type={LinkType.action}
                    fontSize="13px"
                    fontWeight="600"
                    isHovered
                    color={currentColorScheme?.main?.accent}
                    onClick={onStayBrowserClick}
                  >
                    {t("DeepLink:StayInBrowser")}
                  </Link>
                )}
              </div>
            </div>
          </FormWrapper>
        </div>
      </Scrollbar>
    </div>
  );
};

export default DeepLink;
