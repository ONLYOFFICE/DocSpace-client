/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { getBgPattern } from "@docspace/shared/utils/common";
import { getLogoFromPath } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";

import { getDeepLink } from "./DeepLink.helper";

import {
  StyledSimpleNav,
  StyledDeepLink,
  StyledBodyWrapper,
  StyledFileTile,
  StyledActionsWrapper,
  BgBlock,
  StyledWrapper,
  LogoWrapper,
} from "./DeepLink.styled";
import { DeepLinkProps } from "./DeepLink.types";

const DeepLink = ({
  fileInfo,
  userEmail,
  setIsShowDeepLink,
  theme,
  logoUrls,
  currentDeviceType,
  deepLinkConfig,
}: DeepLinkProps) => {
  const { t } = useTranslation(["DeepLink", "Common"]);

  const [isRemember, setIsRemember] = useState(false);
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
    );
  };

  const onStayBrowserClick = () => {
    if (isRemember) localStorage.setItem("defaultOpenDocument", "web");
    window.location.replace(window.location.search + "&without_redirect=true");
    setIsShowDeepLink(false);
  };

  const getFileIcon = () => {
    const fileExst = fileInfo?.fileExst.slice(1);
    const iconPath = "/static/images/icons/32/";
    return `${iconPath}${fileExst}.svg`;
  };

  const getFileTitle = () => {
    return fileInfo?.fileExst
      ? fileInfo.title.split(".").slice(0, -1).join(".")
      : fileInfo?.title || "";
  };

  const renderLogo = () => {
    const logoPath = theme.isBase
      ? logoUrls[1]?.path?.light
      : logoUrls[1]?.path?.dark;
    const logo = getLogoFromPath(logoPath);

    if (currentDeviceType === DeviceType.mobile) {
      return (
        <StyledSimpleNav theme={theme}>
          <img src={logo} alt="" />
        </StyledSimpleNav>
      );
    } else {
      return (
        <LogoWrapper theme={theme}>
          <img src={logo} alt="docspace-logo" />
        </LogoWrapper>
      );
    }
  };

  const bgPattern = getBgPattern(theme.currentColorScheme?.id);

  const logoElement = renderLogo();

  return (
    <StyledWrapper>
      {logoElement}
      <FormWrapper>
        <StyledDeepLink>
          <StyledBodyWrapper>
            <Text className="title">{t("OpeningDocument")}</Text>
            <StyledFileTile theme={theme}>
              <img src={getFileIcon()} alt="docspace-logo" />
              <Text fontSize="14px" fontWeight="600" truncate>
                {getFileTitle()}
              </Text>
            </StyledFileTile>
            <Text>{t("DeepLinkText")}</Text>
          </StyledBodyWrapper>
          <StyledActionsWrapper>
            <Checkbox
              label={t("Common:Remember")}
              isChecked={isRemember}
              onChange={onChangeCheckbox}
            />
            <Button
              size={ButtonSize.medium}
              primary
              label={t("OpenInApp")}
              onClick={onOpenAppClick}
            />
            <Link
              className="stay-link"
              type={LinkType.action}
              fontSize="13px"
              fontWeight="600"
              isHovered
              color={theme.currentColorScheme?.main?.accent}
              onClick={onStayBrowserClick}
            >
              {t("StayInBrowser")}
            </Link>
          </StyledActionsWrapper>
        </StyledDeepLink>
      </FormWrapper>
      <BgBlock bgPattern={bgPattern} />
    </StyledWrapper>
  );
};

export default DeepLink;
