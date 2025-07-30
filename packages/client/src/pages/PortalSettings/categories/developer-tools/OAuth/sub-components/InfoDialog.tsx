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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import { ScopeList } from "@docspace/shared/utils/oauth/scope-list";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";
import { getCookie } from "@docspace/shared/utils/cookie";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/shared/components/text";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { TTranslation } from "@docspace/shared/types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";
import { Tag } from "@docspace/shared/components/tag";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import { StyledInfoContainer } from "../OAuth.styled";

interface InfoDialogProps {
  visible: boolean;
  scopeList?: TScope[];

  setInfoDialogVisible?: (value: boolean) => void;
  getContextMenuItems?: (
    t: TTranslation,
    item: IClientProps,
    isInfo?: boolean,
    isSettings?: boolean,
  ) => ContextMenuModel[];

  client?: IClientProps;
  isProfile?: boolean;
}

const InfoDialog = ({
  visible,

  client,
  scopeList,

  setInfoDialogVisible,
  getContextMenuItems,

  isProfile,
}: InfoDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [showDescription, setShowDescription] = React.useState(false);
  const [isRender, setIsRender] = React.useState(false);
  const [withShowText, setWithShowText] = React.useState(false);

  React.useEffect(() => {
    setIsRender(true);
  }, []);

  React.useEffect(() => {
    const el = document.getElementById("client-info-description-text");
    if (!el) return;

    setWithShowText(el?.offsetHeight >= 100);
  }, [isRender]);

  const getContextOptions = () => {
    const contextOptions =
      client && getContextMenuItems
        ? getContextMenuItems(t, client, true, !isProfile)
        : [];

    return contextOptions;
  };

  const onClose = () => {
    setInfoDialogVisible?.(false);
  };

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale || "", client?.modifiedOn || "");

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:Info")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledInfoContainer
          showDescription={showDescription}
          withShowText={withShowText}
        >
          <div className="client-block">
            <div className="client-block__info">
              <img
                className="client-block__info-logo"
                alt="client-logo"
                src={client?.logo}
              />

              <Text fontSize="16px" lineHeight="22px" fontWeight="700" truncate>
                {client?.name}
              </Text>
            </div>

            <ContextMenuButton
              displayType={ContextMenuButtonDisplayType.dropdown}
              getData={getContextOptions}
              testId="client_info_context_menu_button"
            />
          </div>
          {!isProfile ? (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                truncate
              >
                {t("Creator")}
              </Text>
              <div className="creator-block">
                <Avatar
                  source={client?.creatorAvatar || ""}
                  size={AvatarSize.min}
                  role={AvatarRole.user}
                />

                <Text
                  fontSize="14px"
                  lineHeight="16px"
                  fontWeight="600"
                  truncate
                >
                  {client?.creatorDisplayName}
                </Text>
              </div>
            </>
          ) : null}
          {!isProfile ? (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                truncate
              >
                {t("Common:Description")}
              </Text>

              <Text
                id="client-info-description-text"
                className="description"
                fontSize="13px"
                lineHeight="20px"
                fontWeight="400"
              >
                {client?.description}
              </Text>
              {withShowText ? (
                <Link
                  className="desc-link"
                  fontSize="13px"
                  lineHeight="15px"
                  fontWeight="600"
                  isHovered
                  onClick={() => setShowDescription((val) => !val)}
                  type={LinkType.action}
                  dataTestId="client_info_description_link"
                >
                  {showDescription ? "Hide" : "Show more"}
                </Link>
              ) : null}
            </>
          ) : null}
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            truncate
          >
            {t("Common:Website")}
          </Text>
          <Link
            fontSize="13px"
            lineHeight="15px"
            fontWeight="600"
            isHovered
            href={client?.websiteUrl}
            type={LinkType.action}
            target={LinkTarget.blank}
            dataTestId="client_info_website_link"
          >
            {client?.websiteUrl}
          </Link>
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            truncate
          >
            {t("Access")}
          </Text>{" "}
          <ScopeList
            selectedScopes={client?.scopes || []}
            scopes={scopeList || []}
            t={t}
          />
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            truncate
          >
            {t("Scopes")}
          </Text>
          <div className="property-tag_list">
            {client?.scopes.map((scope) => (
              <Tag
                key={scope}
                tag={scope}
                className="property-tag"
                label={scope}
              />
            ))}
          </div>
          {isProfile ? (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                truncate
              >
                {t("AccessGranted")}
              </Text>

              <Text fontSize="13px" lineHeight="20px" fontWeight="600" truncate>
                {modifiedDate}
              </Text>
            </>
          ) : null}
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="20px"
            fontWeight="600"
            truncate
          >
            {t("SupportAndLegalInfo")}
          </Text>
          <Text
            className="privacy-block"
            fontSize="13px"
            lineHeight="15px"
            fontWeight="600"
            truncate
          >
            <Link
              fontSize="13px"
              lineHeight="15px"
              fontWeight="600"
              isHovered
              href={client?.policyUrl}
              type={LinkType.action}
              target={LinkTarget.blank}
              dataTestId="client_info_policy_link"
            >
              {t("PrivacyPolicy")}
            </Link>
            <span className="separator" />

            <Link
              fontSize="13px"
              lineHeight="15px"
              fontWeight="600"
              isHovered
              href={client?.termsUrl}
              type={LinkType.action}
              target={LinkTarget.blank}
              dataTestId="client_info_terms_link"
            >
              {t("TermsOfService")}
            </Link>
          </Text>
          {!isProfile ? (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                truncate
              >
                {t("LastModified")}
              </Text>

              <Text fontSize="13px" lineHeight="20px" fontWeight="600" truncate>
                {modifiedDate}
              </Text>
            </>
          ) : null}
        </StyledInfoContainer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => {
  const {
    setInfoDialogVisible,
    bufferSelection,
    scopeList,
    getContextMenuItems,
  } = oauthStore;

  return {
    setInfoDialogVisible,
    client: bufferSelection,
    scopeList,
    getContextMenuItems,
  };
})(observer(InfoDialog));
