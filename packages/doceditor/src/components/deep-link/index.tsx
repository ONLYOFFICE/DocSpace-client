/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";
import { getBgPattern } from "@docspace/shared/utils/common";
import PortalLogo from "@docspace/ui-kit/components/portal-logo/PortalLogo";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { DeepLinkType } from "@docspace/shared/enums";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

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
    const url = new URL(window.location.href);
    url.searchParams.set("without_redirect", "true");
    window.history.replaceState(null, "", url.toString());
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
                    color={currentColorScheme?.main?.accent ?? undefined}
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
