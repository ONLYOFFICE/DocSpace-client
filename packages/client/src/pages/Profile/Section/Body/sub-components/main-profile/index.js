// (c) Copyright Ascensio System SIA 2009-2024
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

import SendClockReactSvgUrl from "PUBLIC_DIR/images/send.clock.react.svg?url";
import PencilOutlineReactSvgUrl from "PUBLIC_DIR/images/pencil.outline.react.svg?url";
import DefaultUserAvatarMax from "PUBLIC_DIR/images/default_user_photo_size_200-200.png";
import React, { useState, useEffect } from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Avatar } from "@docspace/shared/components/avatar";

import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { Link } from "@docspace/shared/components/link";
import { ComboBox } from "@docspace/shared/components/combobox";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Badge } from "@docspace/shared/components/badge";
import { isMobileOnly } from "react-device-detect";
import { toastr } from "@docspace/shared/components/toast";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";
import { getUserRole, convertLanguage } from "@docspace/shared/utils/common";
import BetaBadge from "../../../../../../components/BetaBadgeWrapper";

import { Trans } from "react-i18next";
//import TimezoneCombo from "./timezoneCombo";

import { AvatarEditorDialog } from "SRC_DIR/components/dialogs";

import {
  StyledWrapper,
  StyledInfo,
  StyledLabel,
  StyledAvatarWrapper,
} from "./styled-main-profile";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";
import { isMobile } from "@docspace/shared/utils";
import { useTheme } from "styled-components";

const MainProfile = (props) => {
  const { t } = useTranslation(["Profile", "Common"]);

  const {
    theme,
    profile,
    culture,
    helpLink,
    cultureNames,

    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeNameVisible,
    changeAvatarVisible,
    setChangeAvatarVisible,
    withActivationBar,
    sendActivationLink,
    currentColorScheme,
    updateProfileCulture,
    documentationEmail,
    setDialogData,
  } = props;

  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [dimension, setDimension] = useState(window.innerHeight);
  const { interfaceDirection } = useTheme();
  const dirTooltip = interfaceDirection === "rtl" ? "left" : "right";

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    setDimension(innerHeight);
    if (!isMobileOnly) return;

    if (!isMobile()) {
      setHorizontalOrientation(true);
    } else {
      setHorizontalOrientation(false);
    }
  };

  const role = getUserRole(profile);

  const sendActivationLinkAction = () => {
    sendActivationLink && sendActivationLink().then(showEmailActivationToast);
  };

  const onChangeEmailClick = () => {
    setDialogData(profile);
    setChangeEmailVisible(true);
  };

  const onChangePasswordClick = () => {
    const email = profile.email;
    setDialogData({ email });
    setChangePasswordVisible(true);
  };

  const userAvatar = profile.hasAvatar
    ? profile.avatarMax
    : DefaultUserAvatarMax;

  const tooltipLanguage = (
    <Text as="div" fontSize="12px" color="#333333">
      <Trans t={t} i18nKey="NotFoundLanguage" ns="Common">
        "In case you cannot find your language in the list of the available
        ones, feel free to write to us at
        <Link
          href={`mailto:${documentationEmail}`}
          isHovered={true}
          color={currentColorScheme?.main?.accent}
        >
          {{ supportEmail: documentationEmail }}
        </Link>
        to take part in the translation and get up to 1 year free of charge."
      </Trans>
      <Box displayProp="block" marginProp="10px 0 0">
        <Link
          isHovered
          isBold
          fontSize="13px"
          href={`${helpLink}/guides/become-translator.aspx`}
          target="_blank"
        >
          {t("Common:LearnMore")}
        </Link>
      </Box>
    </Text>
  );

  const isMobileHorizontalOrientation = isMobile() && horizontalOrientation;

  const { cultureName, currentCulture } = profile;
  const language = convertLanguage(cultureName || currentCulture || culture);

  const selectedLanguage = cultureNames.find((item) => item.key === language) ||
    cultureNames.find((item) => item.key === culture) || {
      key: language,
      label: "",
    };

  const onLanguageSelect = (language) => {
    if (profile.cultureName === language.key) return;

    updateProfileCulture(profile.id, language.key)
      .then(() => location.reload())
      .catch((error) => {
        toastr.error(error && error.message ? error.message : error);
      });
  };

  const isBetaLanguage = selectedLanguage?.isBeta;

  return (
    <StyledWrapper>
      <StyledAvatarWrapper className="avatar-wrapper">
        <Avatar
          className={"avatar"}
          size="max"
          role={role}
          source={userAvatar}
          userName={profile.displayName}
          editing={true}
          editAction={() => setChangeAvatarVisible(true)}
        />
        {profile.isSSO && (
          <div className="badges-wrapper">
            <Badge
              className="sso-badge"
              label={t("Common:SSO")}
              color={"#FFFFFF"}
              backgroundColor="#22C386"
              fontSize={"9px"}
              fontWeight={800}
              noHover
              lineHeight={"13px"}
            />
          </div>
        )}
      </StyledAvatarWrapper>
      <StyledInfo
        withActivationBar={withActivationBar}
        currentColorScheme={currentColorScheme}
      >
        <div className="rows-container">
          <div className="profile-block">
            <StyledLabel as="div">{t("Common:Name")}</StyledLabel>

            <StyledLabel as="div" marginTopProp="16px">
              {t("Common:Email")}
            </StyledLabel>

            <StyledLabel
              as="div"
              marginTopProp={withActivationBar ? "34px" : "16px"}
            >
              {t("Common:Password")}
            </StyledLabel>

            <StyledLabel
              as="div"
              className="profile-language"
              marginTopProp="15px"
            >
              {t("Common:Language")}
              <HelpButton
                size={12}
                offsetRight={0}
                place={dirTooltip}
                tooltipContent={tooltipLanguage}
              />
            </StyledLabel>
          </div>

          <div className="profile-block">
            <div className="profile-block-field">
              <Text fontWeight={600} truncate title={profile.displayName}>
                {profile.displayName}
              </Text>
              {profile.isSSO && (
                <Badge
                  className="sso-badge"
                  label={t("Common:SSO")}
                  color={"#FFFFFF"}
                  backgroundColor="#22C386"
                  fontSize={"9px"}
                  fontWeight={800}
                  noHover
                  lineHeight={"13px"}
                />
              )}

              {!profile.isSSO && (
                <IconButton
                  className="edit-button"
                  iconName={PencilOutlineReactSvgUrl}
                  size="12"
                  onClick={() => setChangeNameVisible(true)}
                />
              )}
            </div>
            <div className="email-container">
              <div className="email-edit-container">
                <Text
                  data-tooltip-id="emailTooltip"
                  data-tooltip-content={t("EmailNotVerified")}
                  as="div"
                  className="email-text-container"
                  fontWeight={600}
                  truncate
                >
                  {profile.email}
                </Text>
                {withActivationBar && (
                  <Tooltip
                    float
                    id="emailTooltip"
                    getContent={({ content }) => (
                      <Text fontSize="12px">{content}</Text>
                    )}
                    place="bottom"
                  />
                )}
                {!profile.isSSO && (
                  <IconButton
                    className="edit-button email-edit-button"
                    iconName={PencilOutlineReactSvgUrl}
                    size="12"
                    onClick={onChangeEmailClick}
                  />
                )}
              </div>
              {withActivationBar && (
                <div
                  className="send-again-container"
                  onClick={sendActivationLinkAction}
                >
                  <ReactSVG
                    className="send-again-icon"
                    src={SendClockReactSvgUrl}
                  />
                  <Text className="send-again-text" fontWeight={600} noSelect>
                    {t("SendAgain")}
                  </Text>
                </div>
              )}
            </div>
            <div className="profile-block-field profile-block-password">
              <Text fontWeight={600}>********</Text>
              <IconButton
                className="edit-button password-edit-button"
                iconName={PencilOutlineReactSvgUrl}
                size="12"
                onClick={onChangePasswordClick}
              />
            </div>
            <div className="language-combo-box-wrapper">
              <ComboBox
                className="language-combo-box"
                directionY={isMobileHorizontalOrientation ? "bottom" : "both"}
                options={cultureNames}
                selectedOption={selectedLanguage}
                onSelect={onLanguageSelect}
                isDisabled={false}
                scaled={isMobile()}
                scaledOptions={false}
                size="content"
                showDisabledItems={true}
                dropDownMaxHeight={dimension < 620 ? 200 : 364}
                manualWidth="280px"
                isDefaultMode={
                  isMobileHorizontalOrientation
                    ? isMobileHorizontalOrientation
                    : !isMobile()
                }
                withBlur={isMobileHorizontalOrientation ? false : isMobile()}
                fillIcon={false}
                modernView={!isMobile()}
              />
              {isBetaLanguage && <BetaBadge place="bottom-end" />}
            </div>
          </div>
        </div>
        <div className="mobile-profile-block">
          <div className="mobile-profile-row">
            <div className="mobile-profile-field">
              <Text className="mobile-profile-label" as="div">
                {t("Common:Name")}
              </Text>
              <Text
                className="mobile-profile-label-field"
                fontWeight={600}
                truncate
              >
                {profile.displayName}
              </Text>
            </div>
            <IconButton
              className="edit-button"
              iconName={PencilOutlineReactSvgUrl}
              size="12"
              onClick={() => setChangeNameVisible(true)}
            />
          </div>
          <div className="mobile-profile-row">
            <div className="mobile-profile-field">
              <Text className="mobile-profile-label" as="div">
                {t("Common:Email")}
              </Text>
              <div className="email-container">
                <div className="email-edit-container">
                  <Text
                    data-tooltip-id="emailTooltip"
                    data-tooltip-content={t("EmailNotVerified")}
                    as="div"
                    className="email-text-container"
                    fontWeight={600}
                    truncate
                  >
                    {profile.email}
                  </Text>
                </div>
                {withActivationBar && (
                  <Tooltip
                    float
                    id="emailTooltip"
                    getContent={({ content }) => (
                      <Text fontSize="12px">{content}</Text>
                    )}
                    place="bottom"
                  />
                )}
              </div>
              {withActivationBar && (
                <div
                  className="send-again-container"
                  onClick={sendActivationLinkAction}
                >
                  <ReactSVG
                    className="send-again-icon"
                    src={SendClockReactSvgUrl}
                  />
                  <Text className="send-again-text" fontWeight={600} noSelect>
                    {t("SendAgain")}
                  </Text>
                </div>
              )}
            </div>
            <IconButton
              className="edit-button"
              iconName={PencilOutlineReactSvgUrl}
              size="12"
              onClick={onChangeEmailClick}
            />
          </div>
          <div className="mobile-profile-row">
            <div className="mobile-profile-field">
              <Text as="div" className="mobile-profile-label">
                {t("Common:Password")}
              </Text>
              <Text className="mobile-profile-password" fontWeight={600}>
                ********
              </Text>
            </div>
            <IconButton
              className="edit-button"
              iconName={PencilOutlineReactSvgUrl}
              size="12"
              onClick={onChangePasswordClick}
            />
          </div>

          <div className="mobile-language">
            <Text as="div" fontWeight={600} className="mobile-profile-label">
              {t("Common:Language")}
              <HelpButton
                size={12}
                offsetRight={0}
                place="right"
                tooltipContent={tooltipLanguage}
              />
            </Text>
            <div className="mobile-language__wrapper-combo-box">
              <ComboBox
                className="language-combo-box"
                directionY={isMobileHorizontalOrientation ? "bottom" : "both"}
                options={cultureNames}
                selectedOption={selectedLanguage}
                onSelect={onLanguageSelect}
                isDisabled={false}
                scaled={isMobile()}
                scaledOptions={false}
                size="content"
                showDisabledItems={true}
                dropDownMaxHeight={dimension < 620 ? 200 : 364}
                manualWidth="280px"
                isDefaultMode={
                  isMobileHorizontalOrientation
                    ? isMobileHorizontalOrientation
                    : !isMobile()
                }
                withBlur={isMobileHorizontalOrientation ? false : isMobile()}
                fillIcon={false}
                modernView={!isMobile()}
              />
              {isBetaLanguage && <BetaBadge place="bottom-end" />}
            </div>
          </div>
        </div>
        {/* <TimezoneCombo title={t("Common:ComingSoon")} /> */}
      </StyledInfo>

      {changeAvatarVisible && (
        <AvatarEditorDialog
          t={t}
          visible={changeAvatarVisible}
          onClose={() => setChangeAvatarVisible(false)}
        />
      )}
    </StyledWrapper>
  );
};

export default inject(({ settingsStore, peopleStore, userStore }) => {
  const { withActivationBar, sendActivationLink } = userStore;
  const { theme, helpLink, culture, currentColorScheme, documentationEmail } =
    settingsStore;

  const {
    targetUser: profile,
    setChangePasswordVisible,
    setChangeNameVisible,
    changeAvatarVisible,
    setChangeAvatarVisible,
    updateProfileCulture,
  } = peopleStore.targetUserStore;
  const { setDialogData, setChangeEmailVisible } = peopleStore.dialogStore;

  return {
    theme,
    profile,
    culture,
    helpLink,

    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeNameVisible,
    changeAvatarVisible,
    setChangeAvatarVisible,
    withActivationBar,
    sendActivationLink,
    currentColorScheme,
    updateProfileCulture,
    documentationEmail,
    setDialogData,
  };
})(withCultureNames(observer(MainProfile)));
