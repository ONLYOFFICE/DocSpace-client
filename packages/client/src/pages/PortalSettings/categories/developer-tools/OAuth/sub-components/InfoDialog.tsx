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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import { ScopeList } from "@docspace/shared/utils/oauth/scope-list";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { TTranslation } from "@docspace/shared/types";
import { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { Tag } from "@docspace/ui-kit/components/tag";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import styles from "../OAuth.styled.module.scss";

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
        <div
          className={styles.styledInfoContainer}
          style={
            {
              "--description-max-height":
                !showDescription && withShowText ? "100px" : "100%",
              "--description-margin-bottom": withShowText ? "4px" : "0",
            } as React.CSSProperties
          }
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
                {t("Common:DescriptionLabel")}
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
                dataTestId="client_info_last_modified"
              >
                {t("LastModified")}
              </Text>

              <Text
                fontSize="13px"
                lineHeight="20px"
                fontWeight="600"
                truncate
                dataTestId="client_info_modified"
              >
                {modifiedDate}
              </Text>
            </>
          ) : null}
        </div>
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
