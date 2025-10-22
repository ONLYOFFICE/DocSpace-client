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

import React, { useState, useEffect, useRef } from "react";
import { ReactSVG } from "react-svg";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobileOnly } from "react-device-detect";
import { useTheme } from "styled-components";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { TextWithTooltip as Text } from "@docspace/shared/components/text";
import {
  LinkWithTooltip as Link,
  LinkTarget,
} from "@docspace/shared/components/link";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Badge } from "@docspace/shared/components/badge";
import { toastr } from "@docspace/shared/components/toast";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import {
  getUserType,
  convertLanguage,
  getUserTypeName,
  getUserTypeDescription,
} from "@docspace/shared/utils/common";
import { isMobile } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";
import { TDirectionY } from "@docspace/shared/types";
import { TUser } from "@docspace/shared/api/people/types";
import { UserStore } from "@docspace/shared/store/UserStore";
import { TAvatarModel } from "@docspace/shared/components/avatar/Avatar.types";
import TopLoadingIndicator from "@docspace/shared/components/top-loading-indicator";

import SendClockReactSvgUrl from "PUBLIC_DIR/images/send.clock.react.svg?url";
import PencilOutlineReactSvgUrl from "PUBLIC_DIR/images/pencil.outline.react.svg?url";
import DefaultUserAvatarMax from "PUBLIC_DIR/images/default_user_photo_size_200-200.png";

import { AvatarEditorDialog } from "SRC_DIR/components/dialogs";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";
import BetaBadge from "SRC_DIR/components/BetaBadgeWrapper";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";
import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";
import DialogStore from "SRC_DIR/store/contacts/DialogStore";
import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";

import {
  StyledWrapper,
  StyledInfo,
  StyledLabel,
  StyledAvatarWrapper,
  getDropdownHoverRules,
} from "./MainProfile.styled";

const TooltipContent = ({ content }: { content: React.ReactNode }) => (
  <Text fontSize="12px">{content}</Text>
);

type MainProfileProps = {
  profile?: TUser;
  culture?: string;
  becometranslatorUrl?: string;
  cultureNames?: {
    key: string;
    label: string;
    icon: string;
    isBeta: boolean;
  }[];
  documentationEmail?: string;
  withActivationBar?: boolean;

  setChangePasswordVisible?: TargetUserStore["setChangePasswordVisible"];
  setChangeNameVisible?: TargetUserStore["setChangeNameVisible"];
  setChangeAvatarVisible?: TargetUserStore["setChangeAvatarVisible"];
  updateProfileCulture?: TargetUserStore["updateProfileCulture"];
  sendActivationLink?: UserStore["sendActivationLink"];
  setChangeEmailVisible?: DialogStore["setChangeEmailVisible"];
  setDialogData?: DialogStore["setDialogData"];
  getProfileModel?: TargetUserStore["getProfileModel"];
  avatarEditorDialogVisible?: AvatarEditorDialogStore["avatarEditorDialogVisible"];
  setAvatarEditorDialogVisible?: AvatarEditorDialogStore["setAvatarEditorDialogVisible"];
  onChangeFile?: AvatarEditorDialogStore["onChangeFile"];
  image?: AvatarEditorDialogStore["image"];
  setImage?: AvatarEditorDialogStore["setImage"];
  fetchTreeFolders?: TreeFoldersStore["fetchTreeFolders"];
};

const MainProfile = (props: MainProfileProps) => {
  const { t, i18n } = useTranslation(["Profile", "Common", "RoomLogoCover"]);

  const {
    profile,
    culture,
    becometranslatorUrl,
    cultureNames,

    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeNameVisible,
    setChangeAvatarVisible,
    withActivationBar,
    sendActivationLink,
    updateProfileCulture,
    documentationEmail,
    setDialogData,
    getProfileModel,
    avatarEditorDialogVisible,
    setAvatarEditorDialogVisible,
    onChangeFile,
    image,
    setImage,
    fetchTreeFolders,
  } = props;

  const styleContainerRef = useRef<HTMLDivElement>(null);
  const comboBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!styleContainerRef.current) return;

    const styleElement = document.createElement("style");
    styleContainerRef.current.appendChild(styleElement);

    const sheet = styleElement.sheet;
    const rules = getDropdownHoverRules();

    rules.forEach((rule, index) => {
      if (sheet) {
        sheet.insertRule(rule, index);
      }
    });

    return () => {
      styleElement.parentNode?.removeChild(styleElement);
    };
  }, []);

  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [dropDownMaxHeight, setDropDownMaxHeight] = useState(352);
  const [directionY, setDirectionY] = useState("both");
  const { interfaceDirection, isBase } = useTheme();
  const dirTooltip = interfaceDirection === "rtl" ? "left" : "right";

  const isMobileHorizontalOrientation = isMobile() && horizontalOrientation;

  const { isOwner, isAdmin, isRoomAdmin, isCollaborator } = profile!;

  const updateDropDownMaxHeight = () => {
    if (comboBoxRef.current) {
      const padding = 32;
      const comboBoxRect = comboBoxRef.current.getBoundingClientRect();
      const availableSpaceBottom =
        window.innerHeight - comboBoxRect.bottom - padding;
      const availableSpaceTop = comboBoxRect.top - padding;

      const max = Math.max(availableSpaceBottom, availableSpaceTop);

      if (max === availableSpaceBottom) setDirectionY("bottom");
      else setDirectionY("top");

      const newDropDownMaxHeight = Math.min(max, 352);

      setDropDownMaxHeight(newDropDownMaxHeight);
    }
  };

  const checkScroll = () => {
    updateDropDownMaxHeight();
  };

  const onChangeFileContext = (e?: unknown) => {
    onChangeFile?.(e, t);
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

  const role = getUserType(profile!);

  const sendActivationLinkAction = () => {
    sendActivationLink && sendActivationLink().then(showEmailActivationToast);
  };

  const onChangeEmailClick = () => {
    setDialogData?.(profile);
    setChangeEmailVisible?.(true);
  };

  const onChangePasswordClick = () => {
    const email = profile!.email;
    setDialogData?.({ email });
    setChangePasswordVisible?.(true);
  };

  const model = getProfileModel?.(t);

  const onChangeIcon = (icon: unknown) => {
    setImage?.(icon);
  };

  const userAvatar =
    profile && profile.hasAvatar ? profile.avatarMax : DefaultUserAvatarMax;

  const tooltipLanguage = (
    <Text as="div" fontSize="12px">
      <Trans
        t={t}
        i18nKey="NotFoundLanguage"
        ns="Common"
        values={{ supportEmail: documentationEmail }}
        components={{
          1: (
            <Link
              href={`mailto:${documentationEmail}`}
              isHovered
              color="accent"
              dataTestId="language_support_link"
            />
          ),
        }}
      />

      {becometranslatorUrl ? (
        <Link
          style={{
            boxSizing: "border-box",
            display: "block",
            margin: "10px 0 0",
          }}
          isHovered
          isBold
          fontSize="13px"
          href={becometranslatorUrl}
          target={LinkTarget.blank}
          dataTestId="language_becometranslator_link"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
    </Text>
  );

  const { cultureName } = profile!;
  const language = convertLanguage(cultureName || culture || "");

  const selectedLanguage = cultureNames?.find(
    (item: { key: string; label: string; icon: string; isBeta: boolean }) =>
      item.key === language,
  ) ||
    cultureNames?.find(
      (item: { key: string; label: string; icon: string; isBeta: boolean }) =>
        item.key === culture,
    ) || {
      key: language,
      label: "",
      icon: "",
      isBeta: false,
    };

  const onLanguageSelect = async (newLanguage: TOption) => {
    if (profile!.cultureName === newLanguage.key) return;

    try {
      TopLoadingIndicator.start();
      await updateProfileCulture?.(profile!.id, newLanguage.key as string);
      await i18n.changeLanguage(newLanguage.key?.toString());
      await fetchTreeFolders?.();
    } catch (error: unknown) {
      toastr.error(
        error && (error as { message: string }).message
          ? (error as { message: string }).message
          : (error as string),
      );
    } finally {
      TopLoadingIndicator.end();
    }
  };

  const isBetaLanguage = selectedLanguage?.isBeta;

  return (
    <StyledWrapper ref={styleContainerRef}>
      <StyledAvatarWrapper className="avatar-wrapper">
        <Avatar
          className="avatar"
          size={AvatarSize.max}
          role={role as unknown as AvatarRole}
          source={userAvatar}
          userName={profile!.displayName}
          editing={!profile!.isLDAP}
          hasAvatar={!!profile!.hasAvatar}
          model={model as unknown as TAvatarModel[]}
          editAction={() => setChangeAvatarVisible?.(true)}
          onChangeFile={onChangeFileContext}
        />
        {profile!.isSSO ? (
          <div className="badges-wrapper">
            <Badge
              className="sso-badge"
              label={t("Common:SSO")}
              color={globalColors.white}
              backgroundColor={
                isBase ? globalColors.secondGreen : globalColors.secondGreenDark
              }
              fontSize="9px"
              fontWeight={800}
              noHover
            />
          </div>
        ) : null}
        {profile!.isLDAP ? (
          <div className="badges-wrapper">
            <Badge
              className="sso-badge"
              label={t("Common:LDAP")}
              color={globalColors.white}
              backgroundColor={
                isBase
                  ? globalColors.secondPurple
                  : globalColors.secondPurpleDark
              }
              fontSize="9px"
              fontWeight={800}
              noHover
            />
          </div>
        ) : null}
      </StyledAvatarWrapper>
      <StyledInfo withActivationBar={withActivationBar}>
        <div className="rows-container">
          <StyledLabel as="div">{t("Common:Name")}</StyledLabel>
          <div className="profile-block-field">
            <Text fontWeight={600} truncate title={profile!.displayName}>
              {profile!.displayName}
            </Text>
            {profile!.isSSO ? (
              <>
                <Badge
                  id="sso-badge-profile"
                  className="sso-badge"
                  label={t("Common:SSO")}
                  color={globalColors.white}
                  backgroundColor={
                    isBase
                      ? globalColors.secondGreen
                      : globalColors.secondGreenDark
                  }
                  fontSize="9px"
                  fontWeight={800}
                  noHover
                />
                <Tooltip anchorSelect={`div[id='sso-badge-profile'] div`}>
                  {t("PeopleTranslations:SSOAccountTooltip")}
                </Tooltip>
              </>
            ) : null}

            {profile!.isLDAP ? (
              <>
                <Badge
                  id="ldap-badge-profile"
                  className="ldap-badge"
                  label={t("Common:LDAP")}
                  color={globalColors.white}
                  backgroundColor={
                    isBase
                      ? globalColors.secondPurple
                      : globalColors.secondPurpleDark
                  }
                  fontSize="9px"
                  fontWeight={800}
                  noHover
                />
                <Tooltip anchorSelect={`div[id='ldap-badge-profile'] div`}>
                  {t("PeopleTranslations:LDAPAccountTooltip")}
                </Tooltip>
              </>
            ) : null}

            {!profile!.isSSO && !profile!.isLDAP ? (
              <IconButton
                className="edit-button"
                iconName={PencilOutlineReactSvgUrl}
                size={12}
                onClick={() => setChangeNameVisible?.(true)}
                dataTestId="name_edit_icon_button"
              />
            ) : null}
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
                {profile!.email}
              </Text>
              {withActivationBar ? (
                <Tooltip
                  float
                  id="emailTooltip"
                  getContent={TooltipContent}
                  place="bottom"
                />
              ) : null}
              {!profile!.isSSO && !profile!.isLDAP ? (
                <IconButton
                  className="edit-button email-edit-button"
                  iconName={PencilOutlineReactSvgUrl}
                  size={12}
                  onClick={onChangeEmailClick}
                  dataTestId="email_edit_icon_button"
                />
              ) : null}
            </div>
            {withActivationBar ? (
              <div
                className="send-again-container"
                onClick={sendActivationLinkAction}
                data-testid="send_again_container"
              >
                <ReactSVG
                  className="send-again-icon"
                  src={SendClockReactSvgUrl}
                />
                <Text className="send-again-text" fontWeight={600}>
                  {t("SendAgain")}
                </Text>
              </div>
            ) : null}
          </div>

          <StyledLabel as="div">{t("Common:Password")}</StyledLabel>
          <div className="profile-block-field profile-block-password">
            <Text fontWeight={600}>********</Text>
            {!profile!.isSSO && !profile!.isLDAP ? (
              <IconButton
                className="edit-button password-edit-button"
                iconName={PencilOutlineReactSvgUrl}
                size={12}
                onClick={onChangePasswordClick}
                dataTestId="password_edit_icon_button"
              />
            ) : null}
          </div>

          <StyledLabel as="div" className="profile-language">
            {t("Common:Language")}
            {documentationEmail ? (
              <HelpButton
                size={12}
                offsetRight={0}
                place={dirTooltip}
                tooltipContent={tooltipLanguage}
                dataTestId="language_help_button"
              />
            ) : null}
          </StyledLabel>
          <div className="language-combo-box-wrapper" ref={comboBoxRef}>
            <ComboBox
              className="language-combo-box"
              directionY={
                isMobileHorizontalOrientation
                  ? "bottom"
                  : (directionY as TDirectionY)
              }
              options={cultureNames!}
              selectedOption={selectedLanguage}
              onSelect={onLanguageSelect}
              isDisabled={false}
              scaled={isMobile()}
              scaledOptions={false}
              size="content"
              showDisabledItems
              dropDownMaxHeight={dropDownMaxHeight}
              manualWidth="280px"
              isDefaultMode={isMobileHorizontalOrientation || !isMobile()}
              withBlur={isMobileHorizontalOrientation ? false : isMobile()}
              fillIcon={false}
              modernView={!isMobile()}
              dataTestId="language_combo_box"
              dropDownTestId="language_combo_box_dropdown"
              noSelect={false}
            />
            {isBetaLanguage ? <BetaBadge place="bottom-end" /> : null}
          </div>

          <StyledLabel as="div">{t("Common:Type")}</StyledLabel>
          <div className="user-type-container">
            <Text fontWeight={600} truncate title={profile!.displayName}>
              {getUserTypeName(
                isOwner,
                isAdmin,
                isRoomAdmin,
                isCollaborator,
                t,
              )}
            </Text>

            {!isOwner ? (
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
                dataTestId="user_type_help_button"
              />
            ) : null}
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
                {profile!.displayName}
              </Text>
            </div>
            <IconButton
              className="edit-button"
              iconName={PencilOutlineReactSvgUrl}
              size={12}
              onClick={() => setChangeNameVisible?.(true)}
              dataTestId="edit_name_icon_button"
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
                    {profile!.email}
                  </Text>
                </div>
                {withActivationBar ? (
                  <Tooltip
                    float
                    id="emailTooltip"
                    getContent={TooltipContent}
                    place="bottom"
                  />
                ) : null}
              </div>
              {withActivationBar ? (
                <div
                  className="send-again-container"
                  onClick={sendActivationLinkAction}
                  data-testid="send_again_container"
                >
                  <ReactSVG
                    className="send-again-icon"
                    src={SendClockReactSvgUrl}
                  />
                  <Text className="send-again-text" fontWeight={600}>
                    {t("SendAgain")}
                  </Text>
                </div>
              ) : null}
            </div>
            <IconButton
              className="edit-button"
              iconName={PencilOutlineReactSvgUrl}
              size={12}
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
              size={12}
              onClick={onChangePasswordClick}
              dataTestId="edit_password_icon_button"
            />
          </div>
          <div className="mobile-profile-row">
            <div className="mobile-profile-field">
              <Text as="div" className="mobile-profile-label">
                {t("Common:Type")}
              </Text>
              <Text fontWeight={600} truncate title={profile!.displayName}>
                {getUserTypeName(
                  isOwner,
                  isAdmin,
                  isRoomAdmin,
                  isCollaborator,
                  t,
                )}
              </Text>
            </div>
            {!isOwner ? (
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
                  dataTestId="user_type_help_button"
                />
              </div>
            ) : null}
          </div>

          <div className="mobile-language">
            <Text as="div" fontWeight={600} className="mobile-profile-label">
              {t("Common:Language")}
              {documentationEmail ? (
                <HelpButton
                  size={12}
                  offsetRight={0}
                  place="right"
                  tooltipContent={tooltipLanguage}
                  dataTestId="language_help_button"
                />
              ) : null}
            </Text>
            <div className="mobile-language__wrapper-combo-box">
              <ComboBox
                className="language-combo-box"
                directionY={isMobileHorizontalOrientation ? "bottom" : "both"}
                options={cultureNames!}
                selectedOption={selectedLanguage}
                onSelect={onLanguageSelect}
                isDisabled={false}
                scaled={isMobile()}
                scaledOptions={false}
                size="content"
                showDisabledItems
                dropDownMaxHeight={dropDownMaxHeight}
                manualWidth="280px"
                isDefaultMode={isMobileHorizontalOrientation || !isMobile()}
                withBlur={isMobileHorizontalOrientation ? false : isMobile()}
                fillIcon={false}
                modernView={!isMobile()}
                dataTestId="language_combo_box"
                dropDownTestId="language_combo_box_dropdown"
              />
              {isBetaLanguage ? <BetaBadge place="bottom-end" /> : null}
            </div>
          </div>
        </div>
      </StyledInfo>

      {avatarEditorDialogVisible ? (
        <AvatarEditorDialog
          t={t}
          visible={image?.uploadedFile}
          image={image}
          isProfileUpload
          onChangeImage={onChangeIcon}
          onChangeFile={onChangeFileContext}
          onClose={() => setAvatarEditorDialogVisible?.(false)}
        />
      ) : null}
    </StyledWrapper>
  );
};

export default inject(
  ({
    settingsStore,
    peopleStore,
    userStore,
    avatarEditorDialogStore,
    treeFoldersStore,
  }: TStore) => {
    const { withActivationBar, sendActivationLink, user: profile } = userStore;
    const { becometranslatorUrl, culture, documentationEmail } = settingsStore;

    const {
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      onChangeFile,
      image,
      setImage,
    } = avatarEditorDialogStore;

    const {
      setChangePasswordVisible,
      setChangeNameVisible,
      changeAvatarVisible,
      setChangeAvatarVisible,
      updateProfileCulture,
      getProfileModel,
    } = peopleStore.targetUserStore!;
    const { setDialogData, setChangeEmailVisible } = peopleStore.dialogStore!;

    const { fetchTreeFolders } = treeFoldersStore;

    return {
      profile,
      culture,
      becometranslatorUrl,

      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeNameVisible,
      changeAvatarVisible,
      setChangeAvatarVisible,
      withActivationBar,
      sendActivationLink,
      updateProfileCulture,
      documentationEmail,
      setDialogData,
      getProfileModel,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      image,
      onChangeFile,
      setImage,
      fetchTreeFolders,
    };
  },
)(withCultureNames<MainProfileProps>(observer(MainProfile)));
