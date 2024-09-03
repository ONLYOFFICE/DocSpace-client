import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import ScopeList from "@docspace/shared/utils/oauth/ScopeList";
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

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

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

              <Text
                fontSize="16px"
                lineHeight="22px"
                fontWeight="700"
                noSelect
                truncate
              >
                {client?.name}
              </Text>
            </div>

            <ContextMenuButton
              displayType={ContextMenuButtonDisplayType.dropdown}
              getData={getContextOptions}
            />
          </div>
          {!isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
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
                  noSelect
                  truncate
                >
                  {client?.creatorDisplayName}
                </Text>
              </div>
            </>
          )}
          {!isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
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
                noSelect
              >
                {client?.description}
              </Text>
              {withShowText && (
                <Link
                  className="desc-link"
                  fontSize="13px"
                  lineHeight="15px"
                  fontWeight="600"
                  isHovered
                  onClick={() => setShowDescription((val) => !val)}
                  type={LinkType.action}
                >
                  {showDescription ? "Hide" : "Show more"}
                </Link>
              )}
            </>
          )}
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            noSelect
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
          >
            {client?.websiteUrl}
          </Link>
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="16px"
            fontWeight="600"
            noSelect
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
            noSelect
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
          {isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
                truncate
              >
                {t("AccessGranted")}
              </Text>

              <Text
                fontSize="13px"
                lineHeight="20px"
                fontWeight="600"
                noSelect
                truncate
              >
                {modifiedDate}
              </Text>
            </>
          )}
          <Text
            className="block-header"
            fontSize="14px"
            lineHeight="20px"
            fontWeight="600"
            noSelect
            truncate
          >
            {t("SupportAndLegalInfo")}
          </Text>
          <Text
            className="privacy-block"
            fontSize="13px"
            lineHeight="15px"
            fontWeight="600"
            noSelect
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
            >
              {t("TermsOfService")}
            </Link>
          </Text>
          {!isProfile && (
            <>
              <Text
                className="block-header"
                fontSize="14px"
                lineHeight="16px"
                fontWeight="600"
                noSelect
                truncate
              >
                {t("LastModified")}
              </Text>

              <Text
                fontSize="13px"
                lineHeight="20px"
                fontWeight="600"
                noSelect
                truncate
              >
                {modifiedDate}
              </Text>
            </>
          )}
        </StyledInfoContainer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStoreProps }) => {
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
