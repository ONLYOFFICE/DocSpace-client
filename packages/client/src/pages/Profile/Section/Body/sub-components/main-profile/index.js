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
import { useState, useEffect, useRef } from "react";
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
import {
  getUserType,
  convertLanguage,
  getUserTypeName,
  getUserTypeDescription,
} from "@docspace/shared/utils/common";
import BetaBadge from "../../../../../../components/BetaBadgeWrapper";

import { Trans } from "react-i18next";

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
import { globalColors } from "@docspace/shared/themes";

const MainProfile = (props) => {
  const { t } = useTranslation(["Profile", "Common", "RoomLogoCover"]);

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
    getProfileModel,
    avatarEditorDialogVisible,
    setAvatarEditorDialogVisible,
    onChangeFile,
    image,
    setImage,
  } = props;

  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [dropDownMaxHeight, setDropDownMaxHeight] = useState(352);
  const { interfaceDirection } = useTheme();
  const dirTooltip = interfaceDirection === "rtl" ? "left" : "right";

  const { isOwner, isAdmin, isRoomAdmin, isCollaborator } = profile;

  const comboBoxRef = useRef(null);

  const updateDropDownMaxHeight = () => {
    const newDimension = window.innerHeight;

    if (comboBoxRef.current) {
      const comboBoxRect = comboBoxRef.current.getBoundingClientRect();
      let availableSpaceBottom = newDimension - comboBoxRect.bottom - 20;

      availableSpaceBottom = Math.max(availableSpaceBottom, 100);

      const newDropDownMaxHeight = Math.min(availableSpaceBottom, 352);
      setDropDownMaxHeight(newDropDownMaxHeight);
    }
  };

  const checkScroll = () => {
    updateDropDownMaxHeight();
  };

  const onChangeFileContext = (e) => {
    onChangeFile(e, t);
  };

  useEffect(() => {
    updateDropDownMaxHeight();
    window.addEventListener("resize", updateDropDownMaxHeight);
    window.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("resize", updateDropDownMaxHeight);
      window.removeEventListener("scroll", checkScroll);
    };
  }, [cultureNames]);

  useEffect(() => {
    if (!isMobileOnly) return;

    if (!isMobile()) {
      setHorizontalOrientation(true);
    } else {
      setHorizontalOrientation(false);
    }
  }, []);

  const role = getUserType(profile);

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

  const model = getProfileModel(t);

  const onChangeIcon = (icon) => {
    setImage(icon);
  };

  const userAvatar = profile.hasAvatar
    ? profile.avatarMax
    : DefaultUserAvatarMax;

  const tooltipLanguage = (
    <Text as="div" fontSize="12px">
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
          editing={!profile.isLDAP}
          hasAvatar={!!profile.hasAvatar}
          model={model}
          editAction={() => setChangeAvatarVisible(true)}
          onChangeFile={onChangeFileContext}
        />
        {profile.isSSO && (
          <div className="badges-wrapper">
            <Badge
              className="sso-badge"
              label={t("Common:SSO")}
              color={globalColors.white}
              backgroundColor={
                theme.isBase
                  ? globalColors.secondGreen
                  : globalColors.secondGreenDark
              }
              fontSize={"9px"}
              fontWeight={800}
              noHover
              lineHeight={"13px"}
            />
          </div>
        )}
        {profile.isLDAP && (
          <div className="badges-wrapper">
            <Badge
              className="sso-badge"
              label={t("Common:LDAP")}
              color={globalColors.white}
              backgroundColor={
                theme.isBase
                  ? globalColors.secondPurple
                  : globalColors.secondPurpleDark
              }
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
          <StyledLabel as="div">{t("Common:Name")}</StyledLabel>
          <div className="profile-block-field">
            <Text fontWeight={600} truncate title={profile.displayName}>
              {profile.displayName}
            </Text>
            {profile.isSSO && (
              <>
                <Badge
                  id="sso-badge-profile"
                  className="sso-badge"
                  label={t("Common:SSO")}
                  color={globalColors.white}
                  backgroundColor={
                    theme.isBase
                      ? globalColors.secondGreen
                      : globalColors.secondGreenDark
                  }
                  fontSize={"9px"}
                  fontWeight={800}
                  noHover
                  lineHeight={"13px"}
                />
                <Tooltip anchorSelect={`div[id='sso-badge-profile'] div`}>
                  {t("PeopleTranslations:SSOAccountTooltip")}
                </Tooltip>
              </>
            )}

            {profile.isLDAP && (
              <>
                <Badge
                  id="ldap-badge-profile"
                  className="ldap-badge"
                  label={t("Common:LDAP")}
                  color={globalColors.white}
                  backgroundColor={
                    theme.isBase
                      ? globalColors.secondPurple
                      : globalColors.secondPurpleDark
                  }
                  fontSize={"9px"}
                  fontWeight={800}
                  noHover
                  lineHeight={"13px"}
                />
                <Tooltip anchorSelect={`div[id='ldap-badge-profile'] div`}>
                  {t("PeopleTranslations:LDAPAccountTooltip")}
                </Tooltip>
              </>
            )}

            {!profile.isSSO && !profile.isLDAP && (
              <IconButton
                className="edit-button"
                iconName={PencilOutlineReactSvgUrl}
                size="12"
                onClick={() => setChangeNameVisible(true)}
              />
            )}
          </div>

          <StyledLabel as="div">{t("Common:Email")}</StyledLabel>
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
              {!profile.isSSO && !profile.isLDAP && (
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

          <StyledLabel as="div">{t("Common:Password")}</StyledLabel>
          <div className="profile-block-field profile-block-password">
            <Text fontWeight={600}>********</Text>
            {!profile.isSSO && !profile.isLDAP && (
              <IconButton
                className="edit-button password-edit-button"
                iconName={PencilOutlineReactSvgUrl}
                size="12"
                onClick={onChangePasswordClick}
              />
            )}
          </div>

          <StyledLabel as="div" className="profile-language">
            {t("Common:Language")}
            <HelpButton
              size={12}
              offsetRight={0}
              place={dirTooltip}
              tooltipContent={tooltipLanguage}
            />
          </StyledLabel>
          <div className="language-combo-box-wrapper" ref={comboBoxRef}>
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
              dropDownMaxHeight={dropDownMaxHeight}
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

          <StyledLabel as="div">{t("Common:Type")}</StyledLabel>
          <div className="user-type-container">
            <Text fontWeight={600} truncate title={profile.displayName}>
              {getUserTypeName(
                isOwner,
                isAdmin,
                isRoomAdmin,
                isCollaborator,
                t,
              )}
            </Text>

            {!isOwner && (
              <HelpButton
                size={12}
                offsetRight={0}
                place={dirTooltip}
                tooltipContent={getUserTypeDescription(
                  isAdmin,
                  isRoomAdmin,
                  isCollaborator,
                  t,
                )}
              />
            )}
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
          <div className="mobile-profile-row">
            <div className="mobile-profile-field">
              <Text as="div" className="mobile-profile-label">
                {t("Common:Type")}
              </Text>
              <Text fontWeight={600} truncate title={profile.displayName}>
                {getUserTypeName(
                  isOwner,
                  isAdmin,
                  isRoomAdmin,
                  isCollaborator,
                  t,
                )}
              </Text>
            </div>
            {!isOwner && (
              <div className="edit-button">
                <HelpButton
                  size={12}
                  offsetRight={0}
                  place={dirTooltip}
                  tooltipContent={getUserTypeDescription(
                    isAdmin,
                    isRoomAdmin,
                    isCollaborator,
                    t,
                  )}
                />
              </div>
            )}
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
                dropDownMaxHeight={dropDownMaxHeight}
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
      </StyledInfo>

      {avatarEditorDialogVisible && (
        <AvatarEditorDialog
          t={t}
          visible={image.uploadedFile}
          image={image}
          isProfileUpload={true}
          onChangeImage={onChangeIcon}
          onChangeFile={onChangeFileContext}
          onClose={() => setAvatarEditorDialogVisible(false)}
        />
      )}
    </StyledWrapper>
  );
};

export default inject(
  ({
    settingsStore,
    peopleStore,
    userStore,
    dialogsStore,
    avatarEditorDialogStore,
  }) => {
    const { withActivationBar, sendActivationLink } = userStore;
    const { theme, helpLink, culture, currentColorScheme, documentationEmail } =
      settingsStore;

    const {
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      onChangeFile,
      image,
      setImage,
    } = avatarEditorDialogStore;

    const {
      targetUser: profile,
      setChangePasswordVisible,
      setChangeNameVisible,
      changeAvatarVisible,
      setChangeAvatarVisible,
      updateProfileCulture,
      getProfileModel,
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
      getProfileModel,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      image,
      onChangeFile,
      setImage,
    };
  },
)(withCultureNames(observer(MainProfile)));
